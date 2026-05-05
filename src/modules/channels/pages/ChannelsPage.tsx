import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { Button } from "../../../shared/components/Button";
import { Panel, PanelBody, PanelHeader } from "../../../shared/components/Panel";
import { createChannel, listChannels, setTelegramWebhook, testTelegramWebhook } from "../api";
import { ChannelCreateForm } from "../components/ChannelCreateForm";
import { ChannelTable } from "../components/ChannelTable";
import type { ChannelAccount } from "../types";

const channelKeys = {
  all: ["channels"] as const
};

export function ChannelsPage() {
  const queryClient = useQueryClient();
  const [telegramResult, setTelegramResult] = useState<{ channelId: string; message: string; ok: boolean }>();
  const channelsQuery = useQuery({
    queryKey: channelKeys.all,
    queryFn: listChannels
  });

  const createMutation = useMutation({
    mutationFn: createChannel,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: channelKeys.all })
  });

  const setWebhookMutation = useMutation({
    mutationFn: ({ channel, webhookUrl }: { channel: ChannelAccount; webhookUrl: string }) =>
      setTelegramWebhook(channel.id, webhookUrl),
    onSuccess: (result, variables) => {
      setTelegramResult({
        channelId: variables.channel.id,
        ok: true,
        message: `已设置：${result.webhookInfo.url || result.webhookUrl}`,
      });
    },
    onError: (error, variables) => {
      setTelegramResult({
        channelId: variables.channel.id,
        ok: false,
        message: error instanceof Error ? error.message : "设置失败",
      });
    },
  });

  const testWebhookMutation = useMutation({
    mutationFn: ({ channel, webhookUrl }: { channel: ChannelAccount; webhookUrl: string }) =>
      testTelegramWebhook(channel.id, webhookUrl),
    onSuccess: (result, variables) => {
      setTelegramResult({
        channelId: variables.channel.id,
        ok: result.webhookUrlMatches && !result.webhookInfo.lastErrorMessage,
        message: [
          `Bot: @${result.bot.username ?? result.bot.id}`,
          result.webhookUrlMatches ? "Webhook 匹配" : "Webhook 不匹配",
          `待处理: ${result.webhookInfo.pendingUpdateCount}`,
          result.webhookInfo.lastErrorMessage ? `错误: ${result.webhookInfo.lastErrorMessage}` : "",
        ]
          .filter(Boolean)
          .join("，"),
      });
    },
    onError: (error, variables) => {
      setTelegramResult({
        channelId: variables.channel.id,
        ok: false,
        message: error instanceof Error ? error.message : "测试失败",
      });
    },
  });

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h1 className="text-xl font-semibold text-ink">渠道</h1>
          <p className="mt-1 text-sm text-muted">Web Chat、Webhook 和外部平台账号</p>
        </div>
        <Button size="sm" onClick={() => void channelsQuery.refetch()}>
          <RefreshCw className="h-4 w-4" aria-hidden />
          刷新
        </Button>
      </div>

      <div className="space-y-4">
        <Panel>
          <PanelHeader>
            <h2 className="text-sm font-semibold text-ink">创建渠道</h2>
          </PanelHeader>
          <PanelBody>
            <ChannelCreateForm isCreating={createMutation.isPending} onCreate={createMutation.mutateAsync} />
            {createMutation.error ? (
              <p className="mt-3 text-sm text-red-600">
                {createMutation.error instanceof Error ? createMutation.error.message : "创建失败"}
              </p>
            ) : null}
          </PanelBody>
        </Panel>

        <Panel className="overflow-hidden">
          <PanelHeader>
            <h2 className="text-sm font-semibold text-ink">渠道列表</h2>
          </PanelHeader>
          <ChannelTable
            channels={channelsQuery.data}
            isLoading={channelsQuery.isLoading}
            error={channelsQuery.error}
            telegramActionId={
              setWebhookMutation.isPending
                ? setWebhookMutation.variables?.channel.id
                : testWebhookMutation.isPending
                  ? testWebhookMutation.variables?.channel.id
                  : undefined
            }
            telegramResult={telegramResult}
            onRetry={() => void channelsQuery.refetch()}
            onSetTelegramWebhook={(channel, webhookUrl) => setWebhookMutation.mutate({ channel, webhookUrl })}
            onTestTelegramWebhook={(channel, webhookUrl) => testWebhookMutation.mutate({ channel, webhookUrl })}
          />
        </Panel>
      </div>
    </div>
  );
}
