export interface AuthUser {
  id: string;
  email: string | null;
  name: string;
  teamId: string | null;
  role: string;
  isAdmin: boolean;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}
