#!/usr/bin/env node
import fs from "fs";
const API = "http://127.0.0.1:3001";
let cookie = "";

async function login() {
  const res = await fetch(`${API}/api/v1/auth/dev/bypass-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "dellose-matex@yopmail.com" }),
  });
  cookie = (res.headers.getSetCookie?.() || []).map(c => c.split(";")[0]).find(c => c.startsWith("flowai_session=")) || "";
  console.log("login:", (await res.json()).username);
}

async function createChat(title) {
  const res = await fetch(`${API}/api/v1/chattings`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ title, type: "general" }),
  });
  return (await res.json()).chattingId;
}

async function uploadFile(filePath) {
  const fileName = filePath.split("/").pop();
  const fileBuffer = fs.readFileSync(filePath);
  const urlRes = await fetch(`${API}/api/v1/file/upload-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ fileName, contentType: "image/png", fileSize: fileBuffer.length }),
  });
  const { uploadUrl, fileId } = await urlRes.json();
  await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": "image/png" }, body: fileBuffer });
  console.log(`📎 ${fileName} -> ${fileId}`);
  return fileId;
}

function extractGeneratedImageUrl(sseText) {
  for (const line of sseText.split("\n")) {
    if (!line.startsWith("data: ")) continue;
    try {
      const d = JSON.parse(line.slice(6));
      if (d.type === "generated_image" && d.imageData?.url) return d.imageData.url;
    } catch {}
  }
  for (const line of sseText.split("\n")) {
    if (!line.startsWith("data: ")) continue;
    try {
      const d = JSON.parse(line.slice(6));
      if (d.type === "tool_result" && d.result?.url) return d.result.url;
    } catch {}
  }
  return null;
}

async function generate(chatId, prompt, filename, fileIds) {
  console.log(`\n🎨 생성 중: ${filename}`);
  const res = await fetch(`${API}/api/v1/agent`, {
    method: "POST",
    signal: AbortSignal.timeout(300000),
    headers: { "Content-Type": "application/json", Cookie: cookie, Accept: "text/event-stream" },
    body: JSON.stringify({
      query: prompt,
      conversationId: chatId,
      model: "gpt-5.1-none-reasoning",
      imageModel: "gpt-image-2-plus",
      chatType: "general",
      isFirstMessage: true,
      forceOption: "imageGeneration",
      isSecurityMasking: false,
      fileIds,
    }),
  });
  const text = await res.text();
  const url = extractGeneratedImageUrl(text);
  if (url) {
    const imgRes = await fetch(url);
    const buf = Buffer.from(await imgRes.arrayBuffer());
    fs.writeFileSync(`public/images/flow/floki-friends/${filename}`, buf);
    console.log(`   ✅ ${filename} (${(buf.length / 1024).toFixed(0)}KB)`);
    return true;
  }
  console.log("   ❌ 실패:", text.slice(-400));
  return false;
}

async function main() {
  await login();

  // flow 로고 + 제품 UI를 레퍼런스로 업로드
  const logoFileId = await uploadFile("public/references/flow/logo/flow-logo-purple.png");
  const productFileId = await uploadFile("public/references/flow/product/flow-desktop-projects.png");
  const chatMobileFileId = await uploadFile("public/references/flow/product/flow-chat-mobile.png");

  const cid = await createChat("[flow 브랜드 시트]");
  await generate(cid, `첨부한 3장의 이미지를 참고해서 "flow" 브랜드 가이드 시트를 만들어줘.

첨부 이미지:
- Image 1: flow 로고 (보라색 "flow" 텍스트 로고)
- Image 2: flow 데스크톱 앱 화면 (프로젝트 관리 UI)
- Image 3: flow 모바일 채팅 화면

[만들어야 할 것: flow 브랜드 가이드 시트]

깨끗한 흰색 배경. 가로 16:9 비율.

상단: "flow Brand Guide" 타이틀

내용을 4개 섹션으로 나눠서 정리:

1. [LOGO] 섹션: 첨부한 flow 로고를 그대로 보여줌. 보라색 "flow" 텍스트. 옆에 색상 코드: Primary Navy #003F7E, Purple #6300B2, Gold #DAC5A7

2. [APP UI] 섹션: 첨부한 데스크톱 앱 화면을 작은 모니터/노트북 목업 안에 보여줌. "프로젝트 관리" 라벨.

3. [MESSENGER] 섹션: 첨부한 모바일 채팅 화면을 스마트폰 목업 안에 보여줌. "flow 메신저" 라벨.

4. [IN-SCENE USAGE] 섹션: flow 로고가 자연스럽게 들어갈 수 있는 예시 아이콘들 — 모니터 화면, 머그컵, 노트북 스티커, 회의실 스크린, 명찰

하단: "by flow.team · 대한민국 최초 AI 협업툴"

스타일: 깔끔한 브랜드 가이드라인 문서 느낌. 플랫 디자인.`, "floki-friends-brand-sheet.png", [logoFileId, productFileId, chatMobileFileId]);

  console.log("\n📊 완료!");
}

main().catch(e => console.error(e.message));
