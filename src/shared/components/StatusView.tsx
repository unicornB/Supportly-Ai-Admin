import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "./Button";

type LoadingStateProps = {
  label?: string;
};

export function LoadingState({ label = "加载中" }: LoadingStateProps) {
  return (
    <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-muted">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      <span>{label}</span>
    </div>
  );
}

type EmptyStateProps = {
  title: string;
  description?: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-medium text-ink">{title}</p>
      {description ? <p className="mt-1 max-w-sm text-sm text-muted">{description}</p> : null}
    </div>
  );
}

type ErrorStateProps = {
  title?: string;
  error: unknown;
  onRetry?: () => void;
};

export function ErrorState({ title = "加载失败", error, onRetry }: ErrorStateProps) {
  const message = error instanceof Error ? error.message : "未知错误";
  return (
    <div className="flex min-h-40 flex-col items-center justify-center px-6 text-center">
      <AlertCircle className="h-5 w-5 text-red-600" aria-hidden />
      <p className="mt-2 text-sm font-medium text-ink">{title}</p>
      <p className="mt-1 max-w-md text-sm text-muted">{message}</p>
      {onRetry ? (
        <Button className="mt-4" size="sm" onClick={onRetry}>
          重试
        </Button>
      ) : null}
    </div>
  );
}
