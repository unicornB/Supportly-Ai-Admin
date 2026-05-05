import { Bot, UserRound } from "lucide-react";
import { Badge } from "../../../shared/components/Badge";
import { EmptyState, ErrorState, LoadingState } from "../../../shared/components/StatusView";
import { cn } from "../../../shared/utils/cn";
import { formatDateTime } from "../../../shared/utils/format";
import type { Message } from "../types";
import { parseAiReferences } from "../types";
import { messageStatusLabel } from "./status";

type MessageTimelineProps = {
  messages: Message[] | undefined;
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
};

export function MessageTimeline({ messages, isLoading, error, onRetry }: MessageTimelineProps) {
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={onRetry} />;
  if (!messages?.length) return <EmptyState title="暂无消息" />;

  return (
    <div className="scrollbar-thin flex h-full flex-col gap-4 overflow-y-auto px-5 py-4">
      {messages.map((message) => {
        const outbound = message.direction === "outbound";
        const references = parseAiReferences(message);
        return (
          <div key={message.id} className={cn("flex gap-3", outbound && "justify-end")}>
            {!outbound ? (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                <UserRound className="h-4 w-4" aria-hidden />
              </div>
            ) : null}

            <div className={cn("max-w-[78%]", outbound && "order-first")}>
              <div
                className={cn(
                  "rounded-lg border px-3 py-2 text-sm leading-6",
                  outbound
                    ? "border-blue-200 bg-blue-50 text-slate-900"
                    : "border-line bg-white text-slate-900"
                )}
              >
                <p className="whitespace-pre-wrap break-words">{message.content || "[非文本消息]"}</p>
              </div>

              <div className={cn("mt-1 flex flex-wrap items-center gap-2 text-xs text-muted", outbound && "justify-end")}>
                <span>{message.senderType === "ai" ? "AI" : message.senderType === "agent" ? "客服" : "客户"}</span>
                <span>{formatDateTime(message.createdAt)}</span>
                <Badge tone={message.status === "failed" ? "red" : "slate"}>{messageStatusLabel(message.status)}</Badge>
              </div>

              {message.errorMessage ? <div className="mt-1 text-xs text-red-600">{message.errorMessage}</div> : null}

              {references.length > 0 ? (
                <div className="mt-2 space-y-1 rounded-md border border-line bg-white px-3 py-2">
                  {references.map((reference) => (
                    <div key={`${message.id}-${reference.id}`} className="flex items-center justify-between gap-3 text-xs">
                      <span className="truncate text-slate-700">{reference.title}</span>
                      <span className="shrink-0 text-muted">{reference.score.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            {outbound ? (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-brand">
                <Bot className="h-4 w-4" aria-hidden />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
