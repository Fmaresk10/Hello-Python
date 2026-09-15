(() => {
  const params = new URLSearchParams(location.search);
  if (params.get('space') !== 'escuela') return;
  if (window.__cafassoSchoolCourseAuthInstalled) return;
  window.__cafassoSchoolCourseAuthInstalled = true;

  const originalFetch = window.fetch.bind(window);

  function readAuth() {
    try {
      return JSON.parse(localStorage.getItem('cafassoAuth') || 'null');
    } catch (error) {
      return null;
    }
  }

  window.fetch = function cafassoAuthenticatedFetch(input, init = {}) {
    const url = typeof input === 'string' ? input : String(input?.url || '');
    if (!url.includes('/_functions/cafassoCourse')) {
      return originalFetch(input, init);
    }

    const auth = readAuth();
    const token = auth?.sessionToken;
    const expiresAt = Number(auth?.expiresAt || 0);
    if (!token || expiresAt <= Date.now()) {
      return originalFetch(input, init);
    }

    const baseHeaders = input instanceof Request ? input.headers : undefined;
    const headers = new Headers(baseHeaders || undefined);
    new Headers(init.headers || undefined).forEach((value, key) => headers.set(key, value));
    if (!headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    if (input instanceof Request) {
      const request = new Request(input, { ...init, headers });
      return originalFetch(request);
    }

    return originalFetch(input, { ...init, headers });
  };
})();
