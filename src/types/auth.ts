/** 用户认证相关类型 */

export interface LoginRequest {
  username: string;
  password: string;
  organizationId?: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  user: UserInfo;
}

export interface UserInfo {
  id: string;
  username: string;
  displayName: string;
  email: string;
  phone: string;
  avatar?: string;
  role: UserRole;
  organizationId: string;
  organizationName: string;
  permissions: string[];
}

export type UserRole = 'admin' | 'user' | 'auditor';

export interface MFARequest {
  sessionId: string;
  method: MFAMethod;
  code: string;
}

export type MFAMethod = 'totp' | 'sms' | 'email';

export interface MFASetupInfo {
  sessionId: string;
  required: boolean;
  methods: MFAMethod[];
  preferredMethod: MFAMethod;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserInfo | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
  mfaRequired: boolean;
  mfaSessionId: string | null;
}

export interface SSOConfig {
  provider: 'saml' | 'oidc' | 'cas';
  loginUrl: string;
  logoutUrl: string;
  metadataUrl?: string;
}

export interface Organization {
  id: string;
  name: string;
  logo?: string;
  ssoConfig?: SSOConfig;
}
