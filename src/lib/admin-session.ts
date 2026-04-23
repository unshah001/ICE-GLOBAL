export const ADMIN_SESSION_EXPIRED_EVENT = "admin-session-expired";

const ADMIN_ACCESS_TOKEN_KEY = "admin_access_token";
const ADMIN_REFRESH_TOKEN_KEY = "admin_refresh_token";

export const clearAdminSession = () => {
  localStorage.removeItem(ADMIN_ACCESS_TOKEN_KEY);
  localStorage.removeItem(ADMIN_REFRESH_TOKEN_KEY);
};

export const installAdminFetchInterceptor = () => {
  if (typeof window === "undefined") return;
  if ((window as any).__adminFetchPatched) return;

  const originalFetch = window.fetch.bind(window);
  (window as any).__adminFetchPatched = true;

  window.fetch = async (...args) => {
    const res = await originalFetch(...args);
    if (res.status === 401) {
      try {
        const body = await res.clone().json();
        if (body?.code === "FST_JWT_AUTHORIZATION_TOKEN_EXPIRED") {
          // Keep the refresh token so page-level retry logic can mint a new access token.
          localStorage.removeItem(ADMIN_ACCESS_TOKEN_KEY);
          if (!localStorage.getItem(ADMIN_REFRESH_TOKEN_KEY)) {
            clearAdminSession();
            window.dispatchEvent(new Event(ADMIN_SESSION_EXPIRED_EVENT));
          }
        }
      } catch {
        // ignore parse errors
      }
    }
    return res;
  };
};
