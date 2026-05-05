import { apiRequest } from "../../shared/api/client";

export type HealthStatus = {
  ok: boolean;
};

export function getHealth() {
  return apiRequest<HealthStatus>("/health");
}
