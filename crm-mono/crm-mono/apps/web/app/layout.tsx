
import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "CRM MVP",
  description: "Trello-style CRM with Unleashed integration",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <div className="mx-auto max-w-6xl p-6">
          <header className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold">CRM MVP</h1>
            <nav className="flex gap-4 text-sm">
              <a className="underline" href="/">Dashboard</a>
              <a className="underline" href="/kanban">Kanban</a>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
