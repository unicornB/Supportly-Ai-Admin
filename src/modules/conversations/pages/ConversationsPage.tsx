import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Button } from "../../../shared/components/Button";
import { Panel } from "../../../shared/components/Panel";
import { EmptyState, ErrorState, LoadingState } from "../../../shared/components/StatusView";
import { listChannels } from "../../channels/api";
import {
  getConversation,
  listConversations,
  listMessages,
  resolveConversation,
  sendMessage,
  setHandoff
} from "../api";
import { ConversationList } from "../components/ConversationList";
import { ConversationSidebar } from "../components/ConversationSidebar";
import { MessageTimeline } from "../components/MessageTimeline";
import { ReplyComposer } from "../components/ReplyComposer";
import type { Conversation } from "../types";

const conversationKeys = {
  all: ["conversations"] as const,
  detail: (id: string) => ["conversations", id] as const,
  messages: (id: string) => ["conversations", id, "messages"] as const
};

const channelKeys = {
  all: ["channels"] as const
};

export function ConversationsPage() {
  const { conversationId } = useParams();
  const queryClient = useQueryClient();

  const conversationsQuery = useQuery({
    queryKey: conversationKeys.all,
    queryFn: listConversations,
    refetchInterval: 5_000
  });

  const channelsQuery = useQuery({
    queryKey: channelKeys.all,
    queryFn: listChannels,
    staleTime: 60_000
  });

  const channelsById = useMemo(
    () => new Map(channelsQuery.data?.map((channel) => [channel.id, channel])),
    [channelsQuery.data]
  );

  const selectedFromList = useMemo(
    () => conversationsQuery.data?.find((conversation) => conversation.id === conversationId),
    [conversationsQuery.data, conversationId]
  );

  const conversationQuery = useQuery({
    queryKey: conversationKeys.detail(conversationId ?? ""),
    queryFn: () => getConversation(conversationId!),
    enabled: Boolean(conversationId)
  });

  const messagesQuery = useQuery({
    queryKey: conversationKeys.messages(conversationId ?? ""),
    queryFn: () => listMessages(conversationId!),
    enabled: Boolean(conversationId),
    refetchInterval: 3_000
  });

  const selectedConversation = conversationQuery.data ?? selectedFromList;

  function markConversationReadInCache(id: string) {
    queryClient.setQueryData<Conversation[]>(conversationKeys.all, (current) =>
      current?.map((conversation) =>
        conversation.id === id ? { ...conversation, unreadCount: 0 } : conversation
      )
    );
    queryClient.setQueryData<Conversation>(conversationKeys.detail(id), (current) =>
      current ? { ...current, unreadCount: 0 } : current
    );
  }

  useEffect(() => {
    if (!conversationId || !messagesQuery.data) return;
    markConversationReadInCache(conversationId);
  }, [conversationId, messagesQuery.data]);

  const sendMutation = useMutation({
    mutationFn: (content: string) => sendMessage(conversationId!, content),
    onSuccess: async () => {
      if (!conversationId) return;
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: conversationKeys.messages(conversationId) }),
        queryClient.invalidateQueries({ queryKey: conversationKeys.all })
      ]);
    }
  });

  const handoffMutation = useMutation({
    mutationFn: () =>
      setHandoff(conversationId!, selectedConversation?.handoffStatus === "bot" ? "agent" : "bot"),
    onSuccess: async () => {
      if (!conversationId) return;
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: conversationKeys.detail(conversationId) }),
        queryClient.invalidateQueries({ queryKey: conversationKeys.all })
      ]);
    }
  });

  const resolveMutation = useMutation({
    mutationFn: () => resolveConversation(conversationId!),
    onSuccess: async () => {
      if (!conversationId) return;
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: conversationKeys.detail(conversationId) }),
        queryClient.invalidateQueries({ queryKey: conversationKeys.all })
      ]);
    }
  });

  async function refreshAll() {
    await Promise.all([
      conversationsQuery.refetch(),
      conversationId ? messagesQuery.refetch() : Promise.resolve(),
      conversationId ? conversationQuery.refetch() : Promise.resolve()
    ]);
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col lg:h-screen">
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-line bg-white px-5">
        <div>
          <h1 className="text-lg font-semibold text-ink">客服工作台</h1>
          <p className="text-sm text-muted">会话、消息和接管状态</p>
        </div>
        <Button size="sm" onClick={refreshAll}>
          <RefreshCw className="h-4 w-4" aria-hidden />
          刷新
        </Button>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 p-4 xl:grid-cols-[320px_minmax(0,1fr)_320px]">
        <Panel className="min-h-[360px] overflow-hidden xl:min-h-0">
          <div className="border-b border-line px-4 py-3">
            <h2 className="text-sm font-semibold text-ink">会话列表</h2>
          </div>
          <ConversationList
            conversations={conversationsQuery.data}
            selectedId={conversationId}
            isLoading={conversationsQuery.isLoading}
            error={conversationsQuery.error}
            channelsById={channelsById}
            onRetry={() => void conversationsQuery.refetch()}
            onOpen={(conversation) => markConversationReadInCache(conversation.id)}
          />
        </Panel>

        <Panel className="flex min-h-[560px] flex-col overflow-hidden xl:min-h-0">
          {conversationId ? (
            <>
              <div className="border-b border-line px-5 py-4">
                {conversationQuery.isLoading && !selectedConversation ? (
                  <div className="h-5 w-40 rounded bg-slate-100" />
                ) : selectedConversation ? (
                  <div>
                    <h2 className="text-sm font-semibold text-ink">
                      {selectedConversation.contactName || selectedConversation.externalContactId}
                    </h2>
                    <p className="mt-1 text-xs text-muted">{selectedConversation.externalThreadId}</p>
                  </div>
                ) : (
                  <span className="text-sm text-muted">会话不存在</span>
                )}
              </div>

              <div className="min-h-0 flex-1">
                {conversationQuery.error && !selectedConversation ? (
                  <ErrorState error={conversationQuery.error} onRetry={() => void conversationQuery.refetch()} />
                ) : (
                  <MessageTimeline
                    messages={messagesQuery.data}
                    isLoading={messagesQuery.isLoading}
                    error={messagesQuery.error}
                    onRetry={() => void messagesQuery.refetch()}
                  />
                )}
              </div>

              <ReplyComposer
                disabled={!selectedConversation || selectedConversation.status === "resolved"}
                isSending={sendMutation.isPending}
                onSubmit={(content) => sendMutation.mutateAsync(content)}
              />
            </>
          ) : conversationsQuery.isLoading ? (
            <LoadingState />
          ) : (
            <EmptyState title="选择一个会话" description="左侧选择会话后即可查看消息并回复。" />
          )}
        </Panel>

        <Panel className="min-h-[420px] overflow-hidden xl:min-h-0">
          <ConversationSidebar
            conversation={selectedConversation}
            messages={messagesQuery.data}
            isUpdatingHandoff={handoffMutation.isPending}
            isResolving={resolveMutation.isPending}
            onToggleHandoff={() => handoffMutation.mutate()}
            onResolve={() => resolveMutation.mutate()}
          />
        </Panel>
      </div>
    </div>
  );
}
