import { apiRequest, setAccessToken } from "./client";

export type UserRole = "ADMIN" | "EMPLOYEE" | "CUSTOMER";

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string | null;
  emailVerifiedAt?: string | null;
  customer?: { id: string } | null;
}

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface BootstrapAdminInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface TemporaryAdminInput {
  firstName: string;
  lastName: string;
  email: string;
}

export interface AdminBootstrapStatus {
  enabled: boolean;
  configured: boolean;
  available: boolean;
  requiresSecret: boolean;
  adminExists: boolean;
}

interface AuthResponse {
  user: AuthUser;
  token: string;
}

const TEMPORARY_ADMIN_SESSION_KEY = "pioneer.temporaryAdminSession";

export async function register(input: RegisterInput) {
  const result = await apiRequest<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input)
  });
  setAccessToken(result.token);
  return result;
}

export async function login(input: LoginInput) {
  const result = await apiRequest<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input)
  });
  setAccessToken(result.token);
  clearTemporaryAdminSession();
  return result;
}

export async function getAdminBootstrapStatus() {
  return apiRequest<AdminBootstrapStatus>("/api/auth/bootstrap-admin/status");
}

export async function bootstrapAdmin(
  input: BootstrapAdminInput,
  bootstrapSecret?: string
) {
  const headers = new Headers();
  if (bootstrapSecret) {
    headers.set("X-Admin-Bootstrap-Secret", bootstrapSecret);
  }

  const result = await apiRequest<AuthResponse>("/api/auth/bootstrap-admin", {
    method: "POST",
    headers,
    body: JSON.stringify(input)
  });
  setAccessToken(result.token);
  clearTemporaryAdminSession();
  return result;
}

export function createTemporaryAdminSession(input: TemporaryAdminInput) {
  const user: AuthUser = {
    id: "temporary-admin",
    email: input.email.trim().toLowerCase(),
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    role: "ADMIN"
  };

  sessionStorage.setItem(TEMPORARY_ADMIN_SESSION_KEY, JSON.stringify(user));
  setAccessToken(null);
  return user;
}

export function getTemporaryAdminUser(): AuthUser | null {
  const stored = sessionStorage.getItem(TEMPORARY_ADMIN_SESSION_KEY);
  if (!stored) return null;

  try {
    const user = JSON.parse(stored) as AuthUser;
    if (
      user?.id === "temporary-admin" &&
      user?.role === "ADMIN" &&
      typeof user.email === "string" &&
      typeof user.firstName === "string" &&
      typeof user.lastName === "string"
    ) {
      return user;
    }
  } catch {
    // Invalid temporary state is cleared below.
  }

  clearTemporaryAdminSession();
  return null;
}

export function clearTemporaryAdminSession() {
  sessionStorage.removeItem(TEMPORARY_ADMIN_SESSION_KEY);
}

export async function getCurrentUser() {
  return apiRequest<{ user: AuthUser }>("/api/auth/me");
}

export async function forgotPassword(email: string) {
  return apiRequest<{ message: string }>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email })
  });
}

export function logout() {
  setAccessToken(null);
  clearTemporaryAdminSession();
}
