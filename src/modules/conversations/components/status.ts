import type { HandoffStatus, MessageStatus } from "../types";

export function handoffLabel(status: HandoffStatus) {
  return status === "bot" ? "机器人" : "人工";
}

export function handoffTone(status: HandoffStatus) {
  return status === "bot" ? "blue" : "green";
}

export function messageStatusLabel(status: MessageStatus) {
  const labels: Record<MessageStatus, string> = {
    received: "已接收",
    sending: "发送中",
    sent: "已发送",
    failed: "失败"
  };
  return labels[status];
}
