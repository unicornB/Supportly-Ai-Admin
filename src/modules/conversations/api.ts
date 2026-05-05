import { apiRequest } from "../../shared/api/client";
import type { Conversation, HandoffStatus, Message } from "./types";

export function listConversations() {
  return apiRequest<Conversation[]>("/api/conversations");
}

export function getConversation(id: string) {
  return apiRequest<Conversation>(`/api/conversations/${id}`);
}

export function listMessages(conversationId: string) {
  return apiRequest<Message[]>(`/api/conversations/${conversationId}/messages`);
}

export function sendMessage(conversationId: string, content: string) {
  return apiRequest<Message>(`/api/conversations/${conversationId}/messages`, {
    method: "POST",
    json: { content }
  });
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
