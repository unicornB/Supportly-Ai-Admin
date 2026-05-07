import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import { Button } from "../../../shared/components/Button";
import { Panel } from "../../../shared/components/Panel";
import { EmptyState, ErrorState, LoadingState } from "../../../shared/components/StatusView";
import { listChannels } from "../../channels/api";
import {
  createAdminWebSocket,
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
import type { AdminRealtimeEvent } from "../api";
import type { Conversation, Message } from "../types";

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
  const conversationIdRef = useRef<string | undefined>(conversationId);
  const messagesRef = useRef<Message[]>([]);

  const conversationsQuery = useQuery({
    queryKey: conversationKeys.all,
    queryFn: listConversations
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
    enabled: Boolean(conversationId)
  });

  const selectedConversation = conversationQuery.data ?? selectedFromList;

  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  useEffect(() => {
    messagesRef.current = messagesQuery.data ?? [];
  }, [messagesQuery.data]);

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

  useEffect(() => {
    let closedByEffect = false;
    let reconnectTimer: number | undefined;
    let reconnectAttempt = 0;
    let socket: WebSocket | null = null;

    function scheduleReconnect() {
      if (closedByEffect) return;
      const delays = [1000, 2000, 5000, 10000, 30000];
      const delay = delays[Math.min(reconnectAttempt, delays.length - 1)];
      reconnectAttempt += 1;
      reconnectTimer = window.setTimeout(connect, delay);
    }

    function connect() {
      if (closedByEffect) return;
      socket = createAdminWebSocket();

      socket.onopen = () => {
        reconnectAttempt = 0;
        void queryClient.invalidateQueries({ queryKey: conversationKeys.all });

        const activeConversationId = conversationIdRef.current;
        if (!activeConversationId) return;

        const afterMessageId = getLastRemoteMessageId(messagesRef.current);
        void listMessages(activeConversationId, afterMessageId).then((messages) => {
          queryClient.setQueryData<Message[]>(conversationKeys.messages(activeConversationId), (current) =>
            mergeMessageList(current, messages)
          );
        });
      };

      socket.onmessage = (event) => {
        const realtimeEvent = parseAdminRealtimeEvent(event.data);
        if (!realtimeEvent) return;

        if (realtimeEvent.type === "conversation.updated") {
          const activeConversationId = conversationIdRef.current;
          const conversation =
            realtimeEvent.conversation.id === activeConversationId
              ? { ...realtimeEvent.conversation, unreadCount: 0 }
              : realtimeEvent.conversation;
          queryClient.setQueryData<Conversation[]>(conversationKeys.all, (current) =>
            upsertConversationList(current, conversation)
          );
          queryClient.setQueryData<Conversation>(conversationKeys.detail(conversation.id), conversation);
          return;
        }

        if (realtimeEvent.type === "message.new") {
          const activeConversationId = conversationIdRef.current;
          if (realtimeEvent.conversationId === activeConversationId) {
            queryClient.setQueryData<Message[]>(conversationKeys.messages(realtimeEvent.conversationId), (current) =>
              mergeMessageList(current, [realtimeEvent.message])
            );
            markConversationReadInCache(realtimeEvent.conversationId);
          }
        }
      };

      socket.onclose = () => {
        socket = null;
        scheduleReconnect();
      };
    }

    connect();

    return () => {
      closedByEffect = true;
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, [queryClient]);

  const sendMutation = useMutation({
    mutationFn: (content: string) => sendMessage(conversationId!, content, `admin_${randomId()}`),
    onSuccess: async (message) => {
      if (!conversationId) return;
      queryClient.setQueryData<Message[]>(conversationKeys.messages(conversationId), (current) =>
        mergeMessageList(current, [message])
      );
      await queryClient.invalidateQueries({ queryKey: conversationKeys.all });
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

function parseAdminRealtimeEvent(value: unknown): AdminRealtimeEvent | null {
  if (typeof value !== "string") return null;
  try {
    const event = JSON.parse(value) as AdminRealtimeEvent;
    return event && typeof event.type === "string" ? event : null;
  } catch {
    return null;
  }
}

function mergeMessageList(current: Message[] | undefined, items: Message[]): Message[] {
  if (items.length === 0) return current ?? [];

  const merged = new Map((current ?? []).map((message) => [message.id, message]));
  for (const item of items) {
    merged.set(item.id, item);
  }

  return Array.from(merged.values()).sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
}

function upsertConversationList(current: Conversation[] | undefined, item: Conversation): Conversation[] {
  const merged = new Map((current ?? []).map((conversation) => [conversation.id, conversation]));
  if (item.status === "open") {
    merged.set(item.id, item);
  } else {
    merged.delete(item.id);
  }

  return Array.from(merged.values()).sort((a, b) => {
    const byMessageAt = (b.lastMessageAt ?? "").localeCompare(a.lastMessageAt ?? "");
    return byMessageAt || b.updatedAt.localeCompare(a.updatedAt) || a.id.localeCompare(b.id);
  });
}

function getLastRemoteMessageId(messages: Message[]): string | undefined {
  return messages[messages.length - 1]?.id;
}

function randomId(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
