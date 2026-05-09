export const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export function getToken(): string | null {
  return localStorage.getItem('token');
}

export async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    if (localStorage.getItem('token')) {
      localStorage.removeItem('token');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth');
      window.location.href = '/';
      throw new Error('Unauthorized');
    }
    // 토큰 없음 = 로그인 시도 실패 → 아래 !res.ok 에서 서버 에러 메시지 추출
  }

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      message = body.message ?? message;
    } catch {}
    throw new Error(message);
  }

  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return undefined as T;
  }
  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
