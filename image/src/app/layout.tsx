import type { Metadata } from "next";
import { THEME_SCRIPT } from "@m1kapp/kit";
import { KitStyles } from "@m1kapp/kit/pwa";
import "./globals.css";

export const metadata: Metadata = {
  title: "PromptWing — AI Image Prompt Studio",
  description: "브랜드 리소스와 프롬프트를 조합하여 AI 이미지를 만드세요",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="antialiased" suppressHydrationWarning>
      <head>
        <KitStyles />
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <link
          rel="stylesheet"
          as="style"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body style={{ fontFamily: '"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, "Segoe UI", sans-serif' }}>
        {children}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://m1k.app/badge/gn.svg" alt="" className="fixed bottom-0 left-0 w-0 h-0 opacity-0 pointer-events-none" aria-hidden="true" />
      </body>
    </html>
  );
}
