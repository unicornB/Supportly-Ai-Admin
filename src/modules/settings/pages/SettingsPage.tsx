import { useQuery } from "@tanstack/react-query";
import { Activity, Cloud, KeyRound, UserRound } from "lucide-react";
import { Badge } from "../../../shared/components/Badge";
import { Panel, PanelBody, PanelHeader } from "../../../shared/components/Panel";
import { ErrorState, LoadingState } from "../../../shared/components/StatusView";
import { getCurrentAdmin } from "../../auth/api";
import { getHealth } from "../api";

const settingsKeys = {
  me: ["settings", "me"] as const,
  health: ["settings", "health"] as const
};

export function SettingsPage() {
  const meQuery = useQuery({
    queryKey: settingsKeys.me,
    queryFn: getCurrentAdmin
  });

  const healthQuery = useQuery({
    queryKey: settingsKeys.health,
    queryFn: getHealth,
    refetchInterval: 15_000
  });

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-ink">设置</h1>
        <p className="mt-1 text-sm text-muted">当前运行环境和后台身份</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel>
          <PanelHeader>
            <div className="flex items-center gap-2">
              <UserRound className="h-4 w-4 text-brand" aria-hidden />
              <h2 className="text-sm font-semibold text-ink">管理员</h2>
            </div>
          </PanelHeader>
          <PanelBody>
            {meQuery.isLoading ? (
              <LoadingState />
            ) : meQuery.error ? (
              <ErrorState error={meQuery.error} onRetry={() => void meQuery.refetch()} />
            ) : (
              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted">Admin User ID</dt>
                  <dd className="font-mono text-xs text-ink">{meQuery.data?.id}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted">邮箱</dt>
                  <dd className="font-mono text-xs text-ink">{meQuery.data?.email}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted">角色</dt>
                  <dd className="font-mono text-xs text-ink">{meQuery.data?.role}</dd>
                </div>
              </dl>
            )}
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-brand" aria-hidden />
              <h2 className="text-sm font-semibold text-ink">服务状态</h2>
            </div>
          </PanelHeader>
          <PanelBody>
            {healthQuery.isLoading ? (
              <LoadingState />
            ) : healthQuery.error ? (
              <ErrorState error={healthQuery.error} onRetry={() => void healthQuery.refetch()} />
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">API</span>
                <Badge tone={healthQuery.data?.ok ? "green" : "red"}>{healthQuery.data?.ok ? "ok" : "error"}</Badge>
              </div>
            )}
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader>
            <div className="flex items-center gap-2">
              <Cloud className="h-4 w-4 text-brand" aria-hidden />
              <h2 className="text-sm font-semibold text-ink">Cloudflare</h2>
            </div>
          </PanelHeader>
          <PanelBody>
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">AI Search Namespace</dt>
                <dd className="font-mono text-xs text-ink">aidesk</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">AI Search Instance</dt>
                <dd className="font-mono text-xs text-ink">supportly-dev</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">Runtime</dt>
                <dd className="font-mono text-xs text-ink">Workers</dd>
              </div>
            </dl>
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader>
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-brand" aria-hidden />
              <h2 className="text-sm font-semibold text-ink">前端环境</h2>
            </div>
          </PanelHeader>
          <PanelBody>
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">API Base URL</dt>
                <dd className="max-w-[260px] truncate font-mono text-xs text-ink">
                  {import.meta.env.VITE_API_BASE_URL || "same-origin"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">Dev Admin Header</dt>
                <dd className="font-mono text-xs text-ink">{import.meta.env.VITE_DEV_ADMIN_USER_ID || "-"}</dd>
              </div>
            </dl>
          </PanelBody>
        </Panel>
      </div>
    </div>
  );
}
