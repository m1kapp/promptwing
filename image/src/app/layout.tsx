import type { Metadata } from "next";
import { THEME_SCRIPT } from "@m1kapp/kit";
import { KitStyles } from "@m1kapp/kit/pwa";
import "./globals.css";

export const metadata: Metadata = {
  title: "PromptWing — AI Image Prompt Studio",
  description: "브랜드 리소스와 프롬프트를 조합하여 AI 이미지를 만드세요",
};

// `npx m1kkit pwa --no-sw --bg=#ffffff` 가 만든 public/splash 와 짝 — iOS 는 기기 해상도와 똑같은 그림만 쓰고, 없으면 흰 화면을 띄운다
// [CSS 폭, CSS 높이, 배율] 아이폰 세로 13종
const SPLASH = [
  [440, 956, 3], [402, 874, 3], [420, 912, 3], [430, 932, 3], [393, 852, 3], [428, 926, 3], [390, 844, 3],
  [375, 812, 3], [414, 896, 3], [414, 896, 2], [414, 736, 3], [375, 667, 2], [320, 568, 2],
] as const;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="antialiased" suppressHydrationWarning>
      <head>
        <KitStyles />
        {/* 이 태그가 없으면 iOS 가 스플래시를 쓰지 않는다 — Next 는 mobile-web-app-capable 만 낸다 */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        {SPLASH.map(([w, h, r]) => (
          <link
            key={`${w}x${h}@${r}`}
            rel="apple-touch-startup-image"
            media={`(device-width: ${w}px) and (device-height: ${h}px) and (-webkit-device-pixel-ratio: ${r}) and (orientation: portrait)`}
            href={`/splash/${w * r}x${h * r}.png`}
          />
        ))}
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
