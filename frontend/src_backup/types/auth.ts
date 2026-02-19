export enum UserRole {
  VIEWER = 'viewer',
  ANALYST = 'analyst',
  ADMIN = 'admin',
  SYSTEM = 'system'
}

export interface User {
  user_id: string;
  username: string;
  role: UserRole;
  tenant_id: string;
  session_id?: string;
}

export interface AuthResponse {
  user: User;
  token?: string; // If using JWT, though simple session cookie is preferred
  expires_at?: string;
}
