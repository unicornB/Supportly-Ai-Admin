import { Bot, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../../../shared/components/Badge";
import { EmptyState, ErrorState, LoadingState } from "../../../shared/components/StatusView";
import { cn } from "../../../shared/utils/cn";
import { compactId, formatDateTime } from "../../../shared/utils/format";
import type { ChannelAccount } from "../../channels/types";
import type { Conversation } from "../types";
import { handoffLabel, handoffTone } from "./status";

type ConversationListProps = {
  conversations: Conversation[] | undefined;
  selectedId?: string;
  isLoading: boolean;
  error: unknown;
  channelsById?: Map<string, ChannelAccount>;
  onRetry: () => void;
  onOpen?: (conversation: Conversation) => void;
};

export function ConversationList({
  conversations,
  selectedId,
  isLoading,
  error,
  channelsById,
  onRetry,
  onOpen
}: ConversationListProps) {
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={onRetry} />;
  if (!conversations?.length) return <EmptyState title="暂无会话" description="新消息进入后会出现在这里。" />;

  return (
    <div className="scrollbar-thin h-full overflow-y-auto">
      {conversations.map((conversation) => {
        const channel = channelsById?.get(conversation.channelAccountId);
        return (
          <Link
            key={conversation.id}
            to={`/conversations/${conversation.id}`}
            className={cn(
              "block border-b border-line px-4 py-3 transition hover:bg-slate-50",
              selectedId === conversation.id && "bg-blue-50 hover:bg-blue-50"
            )}
            onClick={() => onOpen?.(conversation)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                  {conversation.isAnonymous ? <Bot className="h-4 w-4" /> : <UserRound className="h-4 w-4" />}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-ink">
                    {conversation.contactName || conversation.externalContactId}
                  </div>
                  <div className="mt-1 flex min-w-0 items-center gap-2">
                    <span className="truncate text-xs text-muted">{conversation.externalThreadId}</span>
                    <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600">
                      {channel?.displayName ?? compactId(conversation.channelAccountId)}
                    </span>
                  </div>
                </div>
              </div>
              <span className="shrink-0 text-xs text-muted">{formatDateTime(conversation.lastMessageAt)}</span>
            </div>

            <div className="mt-3 flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <Badge tone={handoffTone(conversation.handoffStatus)}>{handoffLabel(conversation.handoffStatus)}</Badge>
                <span className="truncate text-xs text-muted">{channelTypeLabel(channel?.channelType)}</span>
              </div>
              {conversation.unreadCount > 0 ? (
                <span className="inline-flex min-w-6 justify-center rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
                  {conversation.unreadCount}
                </span>
              ) : null}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function channelTypeLabel(channelType: ChannelAccount["channelType"] | undefined) {
  if (channelType === "web_chat") return "Web Chat";
  if (channelType === "telegram") return "Telegram";
  if (channelType === "custom_webhook") return "Webhook";
  if (channelType === "whatsapp") return "WhatsApp";
  if (channelType === "wechat") return "WeChat";
  return "未知渠道";
}
