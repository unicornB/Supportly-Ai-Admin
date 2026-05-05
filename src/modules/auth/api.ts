import { apiRequest } from "../../shared/api/client";
import type { AdminUser, LoginResponse } from "./types";

export function login(input: { email: string; password: string }) {
  return apiRequest<LoginResponse>("/api/auth/login", {
    method: "POST",
    json: input
  });
}

export function getCurrentAdmin() {
  return apiRequest<AdminUser>("/api/auth/me");
}
