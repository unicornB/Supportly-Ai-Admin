export type ConversationStatus = "open" | "pending" | "resolved";
export type HandoffStatus = "bot" | "agent";
export type MessageDirection = "inbound" | "outbound" | "internal" | "system";
export type SenderType = "customer" | "agent" | "ai" | "system";
export type MessageStatus = "received" | "sending" | "sent" | "failed";
export type MessageType = "text" | "image" | "file" | "audio" | "event";

export type Conversation = {
  id: string;
  channelAccountId: string;
  externalContactId: string;
  externalThreadId: string;
  contactName: string | null;
  contactAvatarUrl: string | null;
  isAnonymous: boolean;
  status: ConversationStatus;
  handoffStatus: HandoffStatus;
  assigneeAdminUserId: string | null;
  lastMessageId: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
};

export type AiReference = {
  id: string;
  title: string;
  path: string;
  score: number;
};

export type Message = {
  id: string;
  conversationId: string;
  channelAccountId: string;
  externalMessageId: string | null;
  direction: MessageDirection;
  senderType: SenderType;
  senderAdminUserId: string | null;
  messageType: MessageType;
  content: string | null;
  attachmentsJson: string;
  rawPayloadJson: string | null;
  aiMetadataJson: string;
  aiReferencesJson: string;
  status: MessageStatus;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
};

export function parseAiReferences(message: Message): AiReference[] {
  try {
    const references = JSON.parse(message.aiReferencesJson) as unknown;
    if (!Array.isArray(references)) return [];
    return references.filter(isAiReference);
  } catch {
    return [];
  }
}

function isAiReference(value: unknown): value is AiReference {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.path === "string" &&
    typeof candidate.score === "number"
  );
}
