export type KnowledgeDocumentStatus = "uploaded" | "processing" | "indexed" | "failed" | "deleted";

export type KnowledgeDocument = {
  id: string;
  title: string;
  sourceType: "upload" | "website" | "api";
  aiSearchInstanceId: string;
  aiSearchItemId: string | null;
  aiSearchPath: string;
  status: KnowledgeDocumentStatus;
  fileName: string | null;
  fileSize: number;
  mimeType: string | null;
  checksum: string | null;
  metadataJson: string;
  errorMessage: string | null;
  createdByAdminUserId: string | null;
  createdAt: string;
  updatedAt: string;
  indexedAt: string | null;
  deletedAt: string | null;
};
