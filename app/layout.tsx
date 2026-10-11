import type { Metadata } from "next";
import { WorkspaceEntryProvider } from "@/components/transitions/workspace-entry-transition";
import { WORKSPACE_THEME_BOOTSTRAP } from "@/lib/workspace-theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "LinkeAI · 链接想象与天空",
  description: "让想象成为文字、画面、影像与声音。LinkeAI，一站式 AI 创作工作台。",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head><script id="workspace-theme-bootstrap" dangerouslySetInnerHTML={{ __html: WORKSPACE_THEME_BOOTSTRAP }} /></head>
      <body className="antialiased"><WorkspaceEntryProvider>{children}</WorkspaceEntryProvider></body>
    </html>
  );
}
