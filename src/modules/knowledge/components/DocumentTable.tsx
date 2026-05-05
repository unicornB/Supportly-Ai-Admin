import { Trash2 } from "lucide-react";
import { Badge } from "../../../shared/components/Badge";
import { Button } from "../../../shared/components/Button";
import { EmptyState, ErrorState, LoadingState } from "../../../shared/components/StatusView";
import { formatBytes, formatDateTime } from "../../../shared/utils/format";
import type { KnowledgeDocument, KnowledgeDocumentStatus } from "../types";

type DocumentTableProps = {
  documents: KnowledgeDocument[] | undefined;
  isLoading: boolean;
  error: unknown;
  deletingId?: string;
  onRetry: () => void;
  onDelete: (id: string) => void;
};

const statusTone: Record<KnowledgeDocumentStatus, "blue" | "green" | "amber" | "red" | "slate"> = {
  uploaded: "blue",
  processing: "amber",
  indexed: "green",
  failed: "red",
  deleted: "slate"
};

export function DocumentTable({ documents, isLoading, error, deletingId, onRetry, onDelete }: DocumentTableProps) {
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={onRetry} />;
  if (!documents?.length) return <EmptyState title="暂无知识库文档" description="上传 PDF 或文档后会显示在这里。" />;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-line text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-5 py-3 text-left font-semibold text-slate-600">标题</th>
            <th className="px-5 py-3 text-left font-semibold text-slate-600">文件</th>
            <th className="px-5 py-3 text-left font-semibold text-slate-600">状态</th>
            <th className="px-5 py-3 text-left font-semibold text-slate-600">时间</th>
            <th className="px-5 py-3 text-right font-semibold text-slate-600">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line bg-white">
          {documents.map((document) => (
            <tr key={document.id}>
              <td className="max-w-sm px-5 py-4">
                <div className="truncate font-medium text-ink">{document.title}</div>
                {document.errorMessage ? <div className="mt-1 text-xs text-red-600">{document.errorMessage}</div> : null}
              </td>
              <td className="px-5 py-4 text-slate-700">
                <div className="truncate">{document.fileName ?? "-"}</div>
                <div className="mt-1 text-xs text-muted">{formatBytes(document.fileSize)}</div>
              </td>
              <td className="px-5 py-4">
                <Badge tone={statusTone[document.status]}>{document.status}</Badge>
              </td>
              <td className="px-5 py-4 text-muted">{formatDateTime(document.createdAt)}</td>
              <td className="px-5 py-4 text-right">
                <Button
                  size="icon"
                  variant="ghost"
                  title="删除"
                  disabled={deletingId === document.id}
                  onClick={() => onDelete(document.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-600" aria-hidden />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
