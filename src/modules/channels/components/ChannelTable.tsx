import { CheckCircle2, Copy, MessageCircle, RadioTower } from "lucide-react";
import { Badge } from "../../../shared/components/Badge";
import { Button } from "../../../shared/components/Button";
import { EmptyState, ErrorState, LoadingState } from "../../../shared/components/StatusView";
import { getWebhookUrl, getWidgetScriptTag } from "../../../shared/api/client";
import { compactId, formatDateTime } from "../../../shared/utils/format";
import type { ChannelAccount, ChannelStatus } from "../types";

type ChannelTableProps = {
  channels: ChannelAccount[] | undefined;
  isLoading: boolean;
  error: unknown;
  telegramActionId?: string;
  telegramResult?: { channelId: string; message: string; ok: boolean };
  onRetry: () => void;
  onSetTelegramWebhook: (channel: ChannelAccount, webhookUrl: string) => void;
  onTestTelegramWebhook: (channel: ChannelAccount, webhookUrl: string) => void;
};

const statusTone: Record<ChannelStatus, "green" | "amber" | "red" | "slate"> = {
  active: "green",
  disabled: "slate",
  error: "red"
};

export function ChannelTable({
  channels,
  isLoading,
  error,
  telegramActionId,
  telegramResult,
  onRetry,
  onSetTelegramWebhook,
  onTestTelegramWebhook,
}: ChannelTableProps) {
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={onRetry} />;
  if (!channels?.length) return <EmptyState title="暂无渠道" description="创建 Web Chat 或平台渠道后即可接收消息。" />;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-line text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-5 py-3 text-left font-semibold text-slate-600">渠道</th>
            <th className="px-5 py-3 text-left font-semibold text-slate-600">接入</th>
            <th className="px-5 py-3 text-left font-semibold text-slate-600">Outbound</th>
            <th className="px-5 py-3 text-left font-semibold text-slate-600">状态</th>
            <th className="px-5 py-3 text-left font-semibold text-slate-600">创建时间</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line bg-white">
          {channels.map((channel) => {
            const webhookUrl = getWebhookUrl(channel.id);
            const widgetScriptTag = getWidgetScriptTag(channel.id, channel.displayName);
            return (
              <tr key={channel.id}>
                <td className="px-5 py-4">
                  <div className="font-medium text-ink">{channel.displayName}</div>
                  <div className="mt-1 text-xs text-muted">
                    {channel.channelType} · {compactId(channel.id)}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="max-w-md space-y-2">
                    {channel.channelType === "web_chat" ? (
                      <>
                        <div className="flex items-center gap-2">
                          <code className="truncate rounded bg-emerald-50 px-2 py-1 text-xs text-emerald-800">
                            {widgetScriptTag}
                          </code>
                          <Button
                            size="icon"
                            variant="ghost"
                            title="复制 Widget 接入脚本"
                            onClick={() => void navigator.clipboard.writeText(widgetScriptTag)}
                          >
                            <Copy className="h-4 w-4" aria-hidden />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <MessageCircle className="h-4 w-4" aria-hidden />
                          复制到客户网站页面即可显示右下角聊天入口
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <code className="truncate rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">{webhookUrl}</code>
                        <Button size="icon" variant="ghost" title="复制" onClick={() => void navigator.clipboard.writeText(webhookUrl)}>
                          <Copy className="h-4 w-4" aria-hidden />
                        </Button>
                      </div>
                    )}
                    {channel.channelType === "telegram" ? (
                      <>
                        <div className="flex items-center gap-2">
                          <code className="truncate rounded bg-blue-50 px-2 py-1 text-xs text-blue-800">
                            {buildTelegramWebhookCommand(webhookUrl, channel.webhookSecretCiphertext)}
                          </code>
                          <Button
                            size="icon"
                            variant="ghost"
                            title="复制 Telegram setWebhook 命令"
                            onClick={() =>
                              void navigator.clipboard.writeText(
                                buildTelegramWebhookCommand(webhookUrl, channel.webhookSecretCiphertext)
                              )
                            }
                          >
                            <Copy className="h-4 w-4" aria-hidden />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            onClick={() => onSetTelegramWebhook(channel, webhookUrl)}
                            disabled={telegramActionId === channel.id}
                          >
                            <RadioTower className="h-4 w-4" aria-hidden />
                            设置 Webhook
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => onTestTelegramWebhook(channel, webhookUrl)}
                            disabled={telegramActionId === channel.id}
                          >
                            <CheckCircle2 className="h-4 w-4" aria-hidden />
                            测试
                          </Button>
                        </div>
                        {telegramResult?.channelId === channel.id ? (
                          <div
                            className={
                              telegramResult.ok
                                ? "rounded bg-green-50 px-2 py-1 text-xs text-green-700"
                                : "rounded bg-red-50 px-2 py-1 text-xs text-red-700"
                            }
                          >
                            {telegramResult.message}
                          </div>
                        ) : null}
                      </>
                    ) : null}
                  </div>
                </td>
                <td className="max-w-xs px-5 py-4 text-slate-700">
                  <span className="block truncate">{channel.channelType === "web_chat" ? "Widget 轮询" : channel.outboundUrl ?? "-"}</span>
                </td>
                <td className="px-5 py-4">
                  <Badge tone={statusTone[channel.status]}>{channel.status}</Badge>
                </td>
                <td className="px-5 py-4 text-muted">{formatDateTime(channel.createdAt)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function buildTelegramWebhookCommand(webhookUrl: string, secret: string | null) {
  return `curl -X POST "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook" -H "content-type: application/json" -d '${JSON.stringify({
    url: webhookUrl,
    secret_token: secret ?? "<WEBHOOK_SECRET>",
    allowed_updates: ["message"],
  })}'`;
}
