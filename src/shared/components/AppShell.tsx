import { BookOpen, LogOut, MessageSquareText, Radio, Settings } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { clearAuthToken } from "../auth/session";
import { Button } from "./Button";
import { cn } from "../utils/cn";

const navItems = [
  { to: "/conversations", label: "会话", icon: MessageSquareText },
  { to: "/knowledge", label: "知识库", icon: BookOpen },
  { to: "/channels", label: "渠道", icon: Radio },
  { to: "/settings", label: "设置", icon: Settings }
];

export function AppShell() {
  const navigate = useNavigate();

  function logout() {
    clearAuthToken();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-line bg-white lg:block">
        <div className="flex h-16 items-center border-b border-line px-5">
          <div>
            <div className="text-base font-semibold">Supportly</div>
            <div className="text-xs text-muted">Admin Console</div>
          </div>
        </div>
        <nav className="space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition",
                  isActive ? "bg-blue-50 text-brand" : "text-slate-700 hover:bg-slate-100"
                )
              }
            >
              <item.icon className="h-4 w-4" aria-hidden />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t border-line p-3">
          <Button variant="ghost" className="w-full justify-start" onClick={logout}>
            <LogOut className="h-4 w-4" aria-hidden />
            退出
          </Button>
        </div>
      </aside>

      <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b border-line bg-white px-3 lg:hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "inline-flex h-9 flex-1 items-center justify-center gap-1 rounded-md text-xs font-medium",
                isActive ? "bg-blue-50 text-brand" : "text-slate-700"
              )
            }
          >
            <item.icon className="h-4 w-4" aria-hidden />
            <span>{item.label}</span>
          </NavLink>
        ))}
        <button
          type="button"
          onClick={logout}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100"
          title="退出"
        >
          <LogOut className="h-4 w-4" aria-hidden />
        </button>
      </header>

      <main className="lg:pl-64">
        <Outlet />
      </main>
    </div>
  );
}
