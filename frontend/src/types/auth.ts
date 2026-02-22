import { User, UserRole } from './index';

// ==================== Auth State Types ====================
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
  checkAuth: () => Promise<void>;
  resetError: () => void;
  updateUser: (data: Partial<User>) => void;
}

// ==================== Auth Request/Response Types ====================
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  password: string;
}

// ==================== Permission Types ====================
export interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
}

export interface RolePermissions {
  [UserRole.ADMIN]: Permission[];
  [UserRole.SELLER]: Permission[];
  [UserRole.CUSTOMER]: Permission[];
  [UserRole.USER]: Permission[];
}

// ==================== Session Types ====================
export interface Session {
  user: User;
  token: string;
  expiresAt: number;
  createdAt: number;
}

export interface SessionPayload {
  userId: number;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}
