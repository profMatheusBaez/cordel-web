import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cordel — aprenda violão",
  description: "Trilha guiada de violão com afinador e reconhecimento de acordes pelo microfone.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0b0d12",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-base text-[#e7e9ee] font-body">
        <div className="mx-auto max-w-md min-h-screen flex flex-col">{children}</div>
      </body>
    </html>
  );
}
