import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, RotateCw } from "lucide-react";
import { useState } from "react";
import { Button } from "../../../shared/components/Button";
import { Panel, PanelBody, PanelHeader } from "../../../shared/components/Panel";
import { deleteDocument, listDocuments, syncAiSearchDocuments, uploadDocument } from "../api";
import { DocumentTable } from "../components/DocumentTable";
import { DocumentUpload } from "../components/DocumentUpload";

const knowledgeKeys = {
  documents: ["knowledge", "documents"] as const
};

export function KnowledgePage() {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string>();

  const documentsQuery = useQuery({
    queryKey: knowledgeKeys.documents,
    queryFn: listDocuments,
    refetchInterval: 10_000
  });

  const uploadMutation = useMutation({
    mutationFn: uploadDocument,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: knowledgeKeys.documents })
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDocument,
    onMutate: (id) => setDeletingId(id),
    onSettled: () => setDeletingId(undefined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: knowledgeKeys.documents })
  });

  const syncMutation = useMutation({
    mutationFn: syncAiSearchDocuments,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: knowledgeKeys.documents })
  });

  function handleDelete(id: string) {
    if (!window.confirm("确认删除这个文档？")) return;
    deleteMutation.mutate(id);
  }

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h1 className="text-xl font-semibold text-ink">知识库</h1>
          <p className="mt-1 text-sm text-muted">文档上传、索引状态和删除</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => syncMutation.mutate()} disabled={syncMutation.isPending}>
            <RotateCw className="h-4 w-4" aria-hidden />
            同步 AI Search
          </Button>
          <Button size="sm" onClick={() => void documentsQuery.refetch()}>
            <RefreshCw className="h-4 w-4" aria-hidden />
            刷新
          </Button>
        </div>
      </div>

      {syncMutation.data ? (
        <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          已同步 {syncMutation.data.instanceName}：扫描 {syncMutation.data.scanned}，新增 {syncMutation.data.created}，
          更新 {syncMutation.data.updated}，失败 {syncMutation.data.failed}。
        </div>
      ) : null}

      {syncMutation.error ? (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {syncMutation.error instanceof Error ? syncMutation.error.message : "同步失败"}
        </div>
      ) : null}

      <div className="space-y-4">
        <Panel>
          <PanelHeader>
            <h2 className="text-sm font-semibold text-ink">上传文档</h2>
          </PanelHeader>
          <PanelBody>
            <DocumentUpload isUploading={uploadMutation.isPending} onUpload={uploadMutation.mutateAsync} />
            {uploadMutation.error ? (
              <p className="mt-3 text-sm text-red-600">
                {uploadMutation.error instanceof Error ? uploadMutation.error.message : "上传失败"}
              </p>
            ) : null}
          </PanelBody>
        </Panel>

        <Panel className="overflow-hidden">
          <PanelHeader>
            <h2 className="text-sm font-semibold text-ink">文档列表</h2>
          </PanelHeader>
          <DocumentTable
            documents={documentsQuery.data}
            isLoading={documentsQuery.isLoading}
            error={documentsQuery.error}
            deletingId={deletingId}
            onRetry={() => void documentsQuery.refetch()}
            onDelete={handleDelete}
          />
        </Panel>
      </div>
    </div>
  );
}
