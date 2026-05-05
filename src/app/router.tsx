import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "../shared/components/AppShell";
import { RequireAuth } from "../modules/auth/components/RequireAuth";
import { LoginPage } from "../modules/auth/pages/LoginPage";
import { ChannelsPage } from "../modules/channels/pages/ChannelsPage";
import { ConversationsPage } from "../modules/conversations/pages/ConversationsPage";
import { KnowledgePage } from "../modules/knowledge/pages/KnowledgePage";
import { SettingsPage } from "../modules/settings/pages/SettingsPage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/",
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/conversations" replace /> },
      { path: "conversations", element: <ConversationsPage /> },
      { path: "conversations/:conversationId", element: <ConversationsPage /> },
      { path: "knowledge", element: <KnowledgePage /> },
      { path: "channels", element: <ChannelsPage /> },
      { path: "settings", element: <SettingsPage /> }
    ]
  }
]);
