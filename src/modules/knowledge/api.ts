import { apiRequest, uploadRequest } from "../../shared/api/client";
import type { KnowledgeDocument } from "./types";

export type SyncAiSearchResult = {
  instanceName: string;
  scanned: number;
  created: number;
  updated: number;
  failed: number;
};

export function listDocuments() {
  return apiRequest<KnowledgeDocument[]>("/api/knowledge/documents");
}

export function uploadDocument(input: { file: File; title?: string }) {
  const formData = new FormData();
  formData.append("file", input.file);
  if (input.title?.trim()) formData.append("title", input.title.trim());
  return uploadRequest<KnowledgeDocument>("/api/knowledge/documents", formData);
}

export function deleteDocument(id: string) {
  return apiRequest<void>(`/api/knowledge/documents/${id}`, {
    method: "DELETE"
  });
}

export function syncAiSearchDocuments() {
  return apiRequest<SyncAiSearchResult>("/api/knowledge/sync/ai-search", {
    method: "POST"
  });
}
