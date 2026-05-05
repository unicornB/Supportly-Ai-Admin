import { Bot, CheckCircle2, UserRound } from "lucide-react";
import { Badge } from "../../../shared/components/Badge";
import { Button } from "../../../shared/components/Button";
import { EmptyState } from "../../../shared/components/StatusView";
import { compactId, formatDateTime } from "../../../shared/utils/format";
import type { Conversation, Message } from "../types";
import { parseAiReferences } from "../types";
import { handoffLabel, handoffTone } from "./status";

type ConversationSidebarProps = {
  conversation: Conversation | undefined;
  messages: Message[] | undefined;
  isUpdatingHandoff: boolean;
  isResolving: boolean;
  onToggleHandoff: () => void;
  onResolve: () => void;
};

export function ConversationSidebar({
  conversation,
  messages,
  isUpdatingHandoff,
  isResolving,
  onToggleHandoff,
  onResolve
}: ConversationSidebarProps) {
  if (!conversation) return <EmptyState title="未选择会话" />;

  const references =
    messages
      ?.flatMap((message) =>
        parseAiReferences(message).map((reference, referenceIndex) => ({
          ...reference,
          key: `${message.id}-${reference.id}-${referenceIndex}`,
        }))
      )
      .slice(-6)
      .reverse() ?? [];

  return (
    <div className="scrollbar-thin h-full overflow-y-auto">
      <div className="border-b border-line p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
            <UserRound className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-ink">
              {conversation.contactName || conversation.externalContactId}
            </div>
            <div className="mt-1 truncate text-xs text-muted">{compactId(conversation.externalContactId)}</div>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">状态</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge tone={conversation.status === "open" ? "green" : "slate"}>{conversation.status}</Badge>
            <Badge tone={handoffTone(conversation.handoffStatus)}>{handoffLabel(conversation.handoffStatus)}</Badge>
          </div>
        </section>

        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">操作</h3>
          <div className="mt-3 grid gap-2">
            <Button onClick={onToggleHandoff} disabled={isUpdatingHandoff}>
              <Bot className="h-4 w-4" aria-hidden />
              切换到 {conversation.handoffStatus === "bot" ? "人工" : "机器人"}
            </Button>
            <Button onClick={onResolve} disabled={isResolving || conversation.status === "resolved"}>
              <CheckCircle2 className="h-4 w-4" aria-hidden />
              关闭会话
            </Button>
          </div>
        </section>

        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">信息</h3>
          <dl className="mt-3 space-y-3 text-sm">
            <div>
              <dt className="text-muted">会话 ID</dt>
              <dd className="mt-0.5 font-mono text-xs text-ink">{compactId(conversation.id)}</dd>
            </div>
            <div>
              <dt className="text-muted">渠道账号</dt>
              <dd className="mt-0.5 font-mono text-xs text-ink">{compactId(conversation.channelAccountId)}</dd>
            </div>
            <div>
              <dt className="text-muted">最近消息</dt>
              <dd className="mt-0.5 text-ink">{formatDateTime(conversation.lastMessageAt)}</dd>
            </div>
          </dl>
        </section>

        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">AI 引用</h3>
          <div className="mt-3 space-y-2">
            {references.length > 0 ? (
              references.map((reference) => (
                <div key={reference.key} className="rounded-md border border-line bg-white p-3">
                  <div className="truncate text-sm font-medium text-ink">{reference.title}</div>
                  <div className="mt-1 flex items-center justify-between gap-2 text-xs text-muted">
                    <span className="truncate">{reference.path}</span>
                    <span>{reference.score.toFixed(2)}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted">暂无引用</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
