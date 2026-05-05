import { ApiError, type ApiErrorBody } from "./errors";
import { getAuthToken, getDevAdminUserId } from "../auth/session";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const PROXY_TARGET = import.meta.env.VITE_PROXY_TARGET ?? "";
const PUBLIC_WEBHOOK_BASE_URL = import.meta.env.VITE_PUBLIC_WEBHOOK_BASE_URL ?? "";
const PUBLIC_WIDGET_BASE_URL = import.meta.env.VITE_PUBLIC_WIDGET_BASE_URL ?? "";

type RequestOptions = Omit<RequestInit, "body"> & {
  json?: unknown;
  body?: BodyInit | null;
};

type ApiEnvelope<T> = {
  data: T;
};

function buildUrl(path: string) {
  if (path.startsWith("http")) return path;
  return `${API_BASE_URL}${path}`;
}

function buildHeaders(init?: RequestOptions) {
  const headers = new Headers(init?.headers);
  const token = getAuthToken();
  const devAdminUserId = getDevAdminUserId();

  if (token) {
    headers.set("authorization", `Bearer ${token}`);
  } else if (devAdminUserId) {
    headers.set("x-admin-user-id", devAdminUserId);
  }

  if (init?.json !== undefined && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  return headers;
}

export async function apiRequest<T>(path: string, init?: RequestOptions): Promise<T> {
  const response = await fetch(buildUrl(path), {
    ...init,
    headers: buildHeaders(init),
    body: init?.json !== undefined ? JSON.stringify(init.json) : init?.body
  });

  const body = (await response.json().catch(() => null)) as ApiEnvelope<T> & ApiErrorBody | null;

  if (!response.ok) {
    throw new ApiError(
      body?.error?.message ?? "请求失败",
      response.status,
      body?.error?.code,
      body?.error?.details
    );
  }

  return body?.data as T;
}

export async function uploadRequest<T>(path: string, formData: FormData): Promise<T> {
  return apiRequest<T>(path, {
    method: "POST",
    body: formData
  });
}

export function getWebhookUrl(channelAccountId: string) {
  const base = trimTrailingSlash(PUBLIC_WEBHOOK_BASE_URL || API_BASE_URL || PROXY_TARGET || window.location.origin);
  return `${base}/webhooks/${channelAccountId}`;
}

export function getWidgetScriptTag(channelAccountId: string, title: string) {
  const base = trimTrailingSlash(PUBLIC_WIDGET_BASE_URL || PUBLIC_WEBHOOK_BASE_URL || API_BASE_URL || PROXY_TARGET || window.location.origin);
  return `<script src="${base}/widget/supportly.js" data-channel-id="${escapeHtmlAttribute(channelAccountId)}" data-title="${escapeHtmlAttribute(title)}" async></script>`;
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function escapeHtmlAttribute(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
