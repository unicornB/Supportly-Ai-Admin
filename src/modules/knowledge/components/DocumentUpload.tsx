import { FileText, Upload } from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import { Button } from "../../../shared/components/Button";
import { Field, TextInput } from "../../../shared/components/Field";

type DocumentUploadProps = {
  isUploading: boolean;
  onUpload: (input: { file: File; title?: string }) => Promise<unknown>;
};

export function DocumentUpload({ isUploading, onUpload }: DocumentUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) return;
    await onUpload({ file, title });
    setFile(null);
    setTitle("");
    formRef.current?.reset();
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
      <Field label="文档标题">
        <TextInput value={title} onChange={(event) => setTitle(event.target.value)} placeholder="默认使用文件名" />
      </Field>
      <Field label="文件">
        <input
          ref={fileInputRef}
          className="hidden"
          type="file"
          accept=".pdf,.md,.txt,.doc,.docx"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex h-10 w-full items-center justify-between gap-3 rounded-md border border-line bg-white px-3 text-left text-sm text-ink outline-none transition hover:bg-slate-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <span className="flex min-w-0 items-center gap-2">
            <FileText className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
            <span className={file ? "truncate text-ink" : "truncate text-slate-400"}>
              {file ? file.name : "选择 PDF、Markdown 或文本文件"}
            </span>
          </span>
          <span className="shrink-0 rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">选择</span>
        </button>
      </Field>
      <div className="flex items-end">
        <Button type="submit" variant="primary" disabled={!file || isUploading} className="w-full md:w-auto">
          <Upload className="h-4 w-4" aria-hidden />
          上传
        </Button>
      </div>
    </form>
  );
}
