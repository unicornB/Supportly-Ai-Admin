import { apiRequest } from "../../shared/api/client";
import type { ChannelAccount, CreateChannelInput } from "./types";

export type TelegramWebhookInfo = {
  url: string;
  pendingUpdateCount: number;
  lastErrorDate?: number;
  lastErrorMessage?: string;
  allowedUpdates?: string[];
};

export type TelegramSetWebhookResult = {
  ok: boolean;
  description?: string;
  webhookUrl: string;
  webhookInfo: TelegramWebhookInfo;
};

export type TelegramTestResult = {
  bot: {
    id: number;
    isBot?: boolean;
    firstName?: string;
    username?: string;
  };
  webhookInfo: TelegramWebhookInfo;
  webhookUrlMatches: boolean;
  expectedWebhookUrl?: string;
};

export function listChannels() {
  return apiRequest<ChannelAccount[]>("/api/channels");
}

export function createChannel(input: CreateChannelInput) {
  return apiRequest<ChannelAccount>("/api/channels", {
    method: "POST",
    json: input
  });
}

export function setTelegramWebhook(channelId: string, webhookUrl: string) {
  return apiRequest<TelegramSetWebhookResult>(`/api/channels/${channelId}/telegram/set-webhook`, {
    method: "POST",
    json: { webhookUrl }
  });
}

export function testTelegramWebhook(channelId: string, webhookUrl: string) {
  return apiRequest<TelegramTestResult>(`/api/channels/${channelId}/telegram/test`, {
    method: "POST",
    json: { webhookUrl }
  });
}
