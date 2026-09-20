// CAFASSO · User State endpoint
// Integrar estas funciones en Backend/http-functions.js del sitio Wix.

import { ok, badRequest, forbidden, serverError } from 'wix-http-functions';
import wixData from 'wix-data';

const CAFASSO_STATE_COLLECTION = 'CafassoUserState';
const CAFASSO_SESSIONS_COLLECTION = 'CafassoSessions';
const CAFASSO_ALLOWED_ORIGIN = 'https://fmaresk10.github.io';

function cafassoStateHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': CAFASSO_ALLOWED_ORIGIN,
    'Access-Control-Allow-Headers': 'Content-Type, X-Cafasso-Session-Hash',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Cache-Control': 'no-store'
  };
}

function cafassoHeader(request, name) {
  const headers = request?.headers || {};
  const target = String(name || '').toLowerCase();
  const found = Object.keys(headers).find(key => String(key).toLowerCase() === target);
  return found ? String(headers[found] || '') : '';
}

async function cafassoSessionFromRequest(request) {
  const tokenHash = cafassoHeader(request, 'x-cafasso-session-hash').trim().toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(tokenHash)) return null;

  const result = await wixData
    .query(CAFASSO_SESSIONS_COLLECTION)
    .eq('tokenHash', tokenHash)
    .limit(1)
    .find({ suppressAuth: true });

  const session = result.items?.[0] || null;
  if (!session?.userId) return null;

  const expiresAt = new Date(session.expiresAt || 0).getTime();
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return null;

  return session;
}

export function options_cafassoUserState() {
  return ok({
    headers: cafassoStateHeaders(),
    body: { ok: true }
  });
}

export async function get_cafassoUserState(request) {
  try {
    const session = await cafassoSessionFromRequest(request);
    if (!session) {
      return forbidden({
        headers: cafassoStateHeaders(),
        body: { ok: false, error: 'Sesión CAFASSO inválida o vencida.' }
      });
    }

    const result = await wixData
      .query(CAFASSO_STATE_COLLECTION)
      .eq('userId', String(session.userId))
      .limit(1)
      .find({ suppressAuth: true });

    const row = result.items?.[0] || null;
    let state = null;
    if (row?.state) {
      try { state = JSON.parse(row.state); }
      catch (error) { state = null; }
    }

    return ok({
      headers: cafassoStateHeaders(),
      body: {
        ok: true,
        userId: String(session.userId),
        state,
        version: Number(row?.version || state?.version || 1),
        updatedAt: row?.updatedAt || row?._updatedDate || null
      }
    });
  } catch (error) {
    console.error('cafassoUserState GET', error);
    return serverError({
      headers: cafassoStateHeaders(),
      body: { ok: false, error: 'No se pudo leer el estado de CAFASSO.' }
    });
  }
}

export async function post_cafassoUserState(request) {
  try {
    const session = await cafassoSessionFromRequest(request);
    if (!session) {
      return forbidden({
        headers: cafassoStateHeaders(),
        body: { ok: false, error: 'Sesión CAFASSO inválida o vencida.' }
      });
    }

    const payload = await request.body.json();
    const state = payload?.state;
    if (!state || typeof state !== 'object') {
      return badRequest({
        headers: cafassoStateHeaders(),
        body: { ok: false, error: 'Falta el estado del usuario.' }
      });
    }

    const serialized = JSON.stringify(state);
    if (serialized.length > 430000) {
      return badRequest({
        headers: cafassoStateHeaders(),
        body: { ok: false, error: 'El estado del usuario es demasiado grande.' }
      });
    }

    const item = {
      _id: String(session.userId),
      userId: String(session.userId),
      state: serialized,
      version: Number(state.version || 1),
      updatedAt: new Date()
    };

    const saved = await wixData.save(
      CAFASSO_STATE_COLLECTION,
      item,
      { suppressAuth: true }
    );

    return ok({
      headers: cafassoStateHeaders(),
      body: {
        ok: true,
        userId: String(session.userId),
        version: Number(saved.version || 1),
        updatedAt: saved.updatedAt || saved._updatedDate || null
      }
    });
  } catch (error) {
    console.error('cafassoUserState POST', error);
    return serverError({
      headers: cafassoStateHeaders(),
      body: { ok: false, error: 'No se pudo guardar el estado de CAFASSO.' }
    });
  }
}
