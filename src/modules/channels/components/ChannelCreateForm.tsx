import { Plus } from "lucide-react";
import { FormEvent, useState } from "react";
import { Button } from "../../../shared/components/Button";
import { Field, TextInput } from "../../../shared/components/Field";
import type { ChannelType, CreateChannelInput } from "../types";

type ChannelCreateFormProps = {
  isCreating: boolean;
  onCreate: (input: CreateChannelInput) => Promise<unknown>;
};

export function ChannelCreateForm({ isCreating, onCreate }: ChannelCreateFormProps) {
  const [channelType, setChannelType] = useState<ChannelType>("custom_webhook");
  const [displayName, setDisplayName] = useState("");
  const [outboundUrl, setOutboundUrl] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [botToken, setBotToken] = useState("");
  const [botUsername, setBotUsername] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = displayName.trim();
    if (!name) return;
    if (channelType === "telegram" && (!botToken.trim() || !webhookSecret.trim())) return;

    await onCreate({
      channelType,
      displayName: name,
      externalAccountId: channelType === "telegram" ? botUsername.trim() || undefined : undefined,
      credentialCiphertext: channelType === "telegram" ? botToken.trim() : undefined,
      outboundUrl: channelType === "custom_webhook" ? outboundUrl.trim() || undefined : undefined,
      webhookSecretCiphertext: channelType !== "web_chat" ? webhookSecret.trim() || undefined : undefined,
    });

    setDisplayName("");
    setOutboundUrl("");
    setWebhookSecret("");
    setBotToken("");
    setBotUsername("");
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)_minmax(0,1fr)]">
        <Field label="渠道类型">
          <select
            value={channelType}
            onChange={(event) => setChannelType(event.target.value as ChannelType)}
            className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="web_chat">Web Chat Widget</option>
            <option value="custom_webhook">Custom Webhook</option>
            <option value="telegram">Telegram Bot</option>
          </select>
        </Field>
        <Field label="名称">
          <TextInput
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder={channelType === "telegram" ? "Telegram Bot" : "官网客服"}
          />
        </Field>
        {channelType !== "web_chat" ? (
          <Field label="Webhook Secret" hint={channelType === "telegram" ? "用于校验 Telegram webhook 来源" : "可选"}>
            <TextInput
              value={webhookSecret}
              onChange={(event) => setWebhookSecret(event.target.value)}
              placeholder={channelType === "telegram" ? "建议 32 字符以上随机值" : "可选"}
            />
          </Field>
        ) : null}
      </div>

      {channelType === "telegram" ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <Field label="Bot Token">
            <TextInput
              type="password"
              value={botToken}
              onChange={(event) => setBotToken(event.target.value)}
              placeholder="123456:ABC..."
              autoComplete="off"
            />
          </Field>
          <Field label="Bot Username" hint="可选，用于后台识别">
            <TextInput value={botUsername} onChange={(event) => setBotUsername(event.target.value)} placeholder="supportly_bot" />
          </Field>
        </div>
      ) : channelType === "custom_webhook" ? (
        <Field label="Outbound URL">
          <TextInput value={outboundUrl} onChange={(event) => setOutboundUrl(event.target.value)} placeholder="https://..." />
        </Field>
      ) : (
        <div className="rounded-md border border-line bg-slate-50 px-3 py-2 text-sm text-slate-600">
          创建后在渠道列表复制接入脚本，放到客户网站页面中即可显示聊天入口。
        </div>
      )}

      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          disabled={
            !displayName.trim() ||
            isCreating ||
            (channelType === "telegram" && (!botToken.trim() || !webhookSecret.trim()))
          }
          className="w-full lg:w-auto"
        >
          <Plus className="h-4 w-4" aria-hidden />
          创建
        </Button>
      </div>
    </form>
  );
}
