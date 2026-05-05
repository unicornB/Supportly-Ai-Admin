import { useQuery } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { clearAuthToken, hasAuthCredential } from "../../../shared/auth/session";
import { ErrorState, LoadingState } from "../../../shared/components/StatusView";
import { getCurrentAdmin } from "../api";

export const authKeys = {
  me: ["auth", "me"] as const
};

export function RequireAuth({ children }: PropsWithChildren) {
  const location = useLocation();
  const hasCredential = hasAuthCredential();

  const meQuery = useQuery({
    queryKey: authKeys.me,
    queryFn: getCurrentAdmin,
    enabled: hasCredential,
    retry: false
  });

  if (!hasCredential) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (meQuery.isLoading) {
    return <LoadingState label="验证登录状态" />;
  }

  if (meQuery.error) {
    clearAuthToken();
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!meQuery.data) {
    return <ErrorState title="无法读取管理员信息" error={new Error("Missing admin profile")} />;
  }

  return children;
}
