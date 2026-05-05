import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LogIn } from "lucide-react";
import { FormEvent, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { setAuthToken, hasAuthCredential } from "../../../shared/auth/session";
import { Button } from "../../../shared/components/Button";
import { Field, TextInput } from "../../../shared/components/Field";
import { Panel, PanelBody } from "../../../shared/components/Panel";
import { login } from "../api";
import { authKeys } from "../components/RequireAuth";

type LoginLocationState = {
  from?: string;
};

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("");
  const state = location.state as LoginLocationState | null;

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: async (result) => {
      setAuthToken(result.token);
      queryClient.setQueryData(authKeys.me, result.adminUser);
      await queryClient.invalidateQueries({ queryKey: authKeys.me });
      navigate(state?.from || "/conversations", { replace: true });
    }
  });

  if (hasAuthCredential()) {
    return <Navigate to={state?.from || "/conversations"} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await loginMutation.mutateAsync({ email, password });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-4">
      <Panel className="w-full max-w-md">
        <PanelBody>
          <div className="mb-8">
            <h1 className="text-xl font-semibold text-ink">登录 Supportly</h1>
            <p className="mt-2 text-sm text-muted">使用管理员邮箱和密码进入客服后台。</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="邮箱">
              <TextInput
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </Field>
            <Field label="密码">
              <TextInput
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                placeholder="默认 admin123"
                required
              />
            </Field>

            {loginMutation.error ? (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {loginMutation.error instanceof Error ? loginMutation.error.message : "登录失败"}
              </p>
            ) : null}

            <Button type="submit" variant="primary" className="w-full" disabled={loginMutation.isPending}>
              <LogIn className="h-4 w-4" aria-hidden />
              登录
            </Button>
          </form>
        </PanelBody>
      </Panel>
    </div>
  );
}
