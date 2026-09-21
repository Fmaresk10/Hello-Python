(() => {
  if (window.__cafassoSessionHealthInstalled) return;
  window.__cafassoSessionHealthInstalled = true;

  const ME_API = 'https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoMe';

  const read = key => {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); }
    catch (error) { return null; }
  };

  function clearSession() {
    localStorage.removeItem('cafassoSession');
    localStorage.removeItem('cafassoAuth');
  }

  function goToLogin() {
    clearSession();
    const target = new URL('./login.html', location.href);
    target.searchParams.set('reason', 'session');
    try {
      if (window.top && window.top !== window) {
        window.top.location.replace(target.href);
        return;
      }
    } catch (error) {}
    location.replace(target.href);
  }

  window.CafassoInvalidateSession = goToLogin;

  async function validate() {
    const session = read('cafassoSession');
    const auth = read('cafassoAuth');
    const token = String(auth?.sessionToken || '');
    const expiresAt = Number(auth?.expiresAt || 0);

    if (!session?.authenticated || !session?.user || !token || expiresAt <= Date.now()) {
      goToLogin();
      return { ok:false, reason:'missing-or-expired' };
    }

    try {
      const response = await fetch(ME_API, {
        headers:{ Authorization:`Bearer ${token}` },
        cache:'no-store'
      });
      const data = await response.clone().json().catch(() => ({}));

      if (response.status === 401 || response.status === 403) {
        goToLogin();
        return { ok:false, reason:'server-invalid', status:response.status };
      }

      if (!response.ok) {
        return { ok:true, degraded:true, status:response.status };
      }

      if (data?.ok === false && /sesi[oó]n|token/i.test(String(data?.error || ''))) {
        goToLogin();
        return { ok:false, reason:'server-invalid' };
      }

      return { ok:true };
    } catch (error) {
      // A network/server outage must not destroy a valid local session.
      return { ok:true, degraded:true, error:String(error?.message || error) };
    }
  }

  window.CafassoSessionReady = validate();
})();
