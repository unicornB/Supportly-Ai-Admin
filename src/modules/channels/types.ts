export type ChannelType = "custom_webhook" | "telegram" | "whatsapp" | "wechat" | "web_chat";
export type ChannelStatus = "active" | "disabled" | "error";

export type ChannelAccount = {
  id: string;
  channelType: ChannelType;
  displayName: string;
  externalAccountId: string | null;
  credentialCiphertext: string | null;
  webhookSecretCiphertext: string | null;
  outboundUrl: string | null;
  status: ChannelStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateChannelInput = {
  channelType: ChannelType;
  displayName: string;
  externalAccountId?: string;
  credentialCiphertext?: string;
  webhookSecretCiphertext?: string;
  outboundUrl?: string;
};
