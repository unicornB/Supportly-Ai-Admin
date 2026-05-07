import { apiRequest } from "../../shared/api/client";
import { getAuthToken, getDevAdminUserId } from "../../shared/auth/session";
import type { Conversation, HandoffStatus, Message } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export type AdminRealtimeEvent =
  | {
      type: "connected";
      connectionKind: "admin";
      serverTime: string;
    }
  | {
      type: "message.new";
      conversationId: string;
      message: Message;
    }
  | {
      type: "conversation.updated";
      conversation: Conversation;
    }
  | {
      type: "pong";
      serverTime: string;
    }
  | {
      type: "error";
      code: string;
      message: string;
    };

export function listConversations() {
  return apiRequest<Conversation[]>("/api/conversations");
}

export function getConversation(id: string) {
  return apiRequest<Conversation>(`/api/conversations/${id}`);
}

export function listMessages(conversationId: string, afterMessageId?: string) {
  const query = afterMessageId ? `?after=${encodeURIComponent(afterMessageId)}` : "";
  return apiRequest<Message[]>(`/api/conversations/${conversationId}/messages${query}`);
}

export function sendMessage(conversationId: string, content: string, clientMessageId?: string) {
  return apiRequest<Message>(`/api/conversations/${conversationId}/messages`, {
    method: "POST",
    json: { clientMessageId, content }
  });
}

export function createAdminWebSocket(): WebSocket {
  const url = buildWebSocketUrl("/api/admin/ws");
  const token = getAuthToken();
  const devAdminUserId = getDevAdminUserId();
  if (token) {
    url.searchParams.set("token", token);
  } else if (devAdminUserId) {
    url.searchParams.set("adminUserId", devAdminUserId);
  }
  return new WebSocket(url);
}

export function setHandoff(conversationId: string, status: HandoffStatus) {
  return apiRequest<Conversation>(`/api/conversations/${conversationId}/handoff`, {
    method: "POST",
    json: { status }
  });
}

export function resolveConversation(conversationId: string) {
  return apiRequest<Conversation>(`/api/conversations/${conversationId}/resolve`, {
    method: "POST"
  });
}

function buildWebSocketUrl(path: string): URL {
  const base = API_BASE_URL || window.location.origin;
  const url = new URL(path, base);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  return url;
}
