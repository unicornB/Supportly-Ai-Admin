const AUTH_TOKEN_KEY = "supportly.auth.token";

const DEV_ADMIN_USER_ID = import.meta.env.VITE_DEV_ADMIN_USER_ID ?? "";

export function getAuthToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string) {
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken() {
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function getDevAdminUserId() {
  return DEV_ADMIN_USER_ID;
}

export function hasAuthCredential() {
  return Boolean(getAuthToken() || DEV_ADMIN_USER_ID);
}
