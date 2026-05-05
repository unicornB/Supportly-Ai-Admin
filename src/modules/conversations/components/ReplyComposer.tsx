import { Send } from "lucide-react";
import { FormEvent, useState } from "react";
import { Button } from "../../../shared/components/Button";
import { TextArea } from "../../../shared/components/Field";

type ReplyComposerProps = {
  disabled?: boolean;
  isSending?: boolean;
  onSubmit: (content: string) => Promise<unknown>;
};

export function ReplyComposer({ disabled, isSending, onSubmit }: ReplyComposerProps) {
  const [content, setContent] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = content.trim();
    if (!value) return;
    await onSubmit(value);
    setContent("");
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-line bg-white p-4">
      <TextArea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        disabled={disabled || isSending}
        placeholder="输入回复内容"
        className="min-h-20"
      />
      <div className="mt-3 flex justify-end">
        <Button type="submit" variant="primary" disabled={disabled || isSending || !content.trim()}>
          <Send className="h-4 w-4" aria-hidden />
          发送
        </Button>
      </div>
    </form>
  );
}
