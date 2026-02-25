const AUTH_KEY = 'rc_auth_token';

export function isAuthenticated(): boolean {
  return !!localStorage.getItem(AUTH_KEY);
}

export function login(email: string, _password: string): void {
  // Simple local auth — replace with real auth later
  localStorage.setItem(AUTH_KEY, `token_${email}_${Date.now()}`);
}

export function loginAsGuest(): void {
  localStorage.setItem(AUTH_KEY, 'guest_token');
}

export function logout(): void {
  localStorage.removeItem(AUTH_KEY);
}

export function getAuthLabel(): string {
  const token = localStorage.getItem(AUTH_KEY);
  if (!token) return '';
  if (token === 'guest_token') return 'Guest';
  const parts = token.split('_');
  return parts[1] ?? 'User';
}
