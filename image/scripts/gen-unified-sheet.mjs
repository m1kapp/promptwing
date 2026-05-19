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

  // 기존 캐릭터 시트 + flow 로고 + flow 제품 UI + flow 채팅 화면 업로드
  const fileIds = [];
  fileIds.push(await uploadFile("public/images/flow/floki-friends/floki-friends-character-sheet.png"));
  fileIds.push(await uploadFile("public/references/flow/logo/flow-logo-purple.png"));
  fileIds.push(await uploadFile("public/references/flow/product/flow-desktop-projects.png"));
  fileIds.push(await uploadFile("public/references/flow/product/flow-chat-mobile.png"));

  const cid = await createChat("[통합 캐릭터+브랜드 시트]");
  await generate(cid, `첨부한 4장의 이미지를 모두 참고해서, "FLOKI FRIENDS + flow 브랜드" 통합 레퍼런스 시트 1장을 만들어줘.

첨부 이미지 역할:
- Image 1 (subject): FLOKI FRIENDS 캐릭터 시트 — 5캐릭터의 외형을 정확히 유지
- Image 2 (subject): flow 로고 — 보라색 "flow" 텍스트 로고의 디자인을 정확히 유지
- Image 3 (style): flow 데스크톱 앱 UI — 프로젝트 관리 화면 디자인 참고
- Image 4 (style): flow 모바일 채팅 UI — 메신저 화면 디자인 참고

[생성할 이미지: 통합 레퍼런스 시트]

깨끗한 흰색 배경. 가로 16:9 비율.

상단 영역:
- "FLOKI FRIENDS" 로고 타이포 (둥글고 귀여운 볼드체)
- 바로 옆에 첨부한 flow 로고를 정확히 재현
- 부제: "by flow.team"

중앙 상단 — [CHARACTERS] 영역:
- 5캐릭터가 나란히 서 있는 단체 포즈 (Image 1 참고하여 외형 동일하게)
- 가운데 이초록, 양옆에 플로키·플로수니, 끝에 보라부키·펭플로
- 각 캐릭터 아래 이름 라벨

중앙 하단 — [BRAND IN SCENE] 영역:
- flow 브랜드가 만화에서 자연스럽게 등장하는 예시를 4개 아이콘으로 보여줌:
  1. 노트북/모니터 화면에 flow 앱 UI (Image 3 참고)
  2. 스마트폰 화면에 flow 메신저 (Image 4 참고)
  3. 머그컵에 flow 로고
  4. 회의실 화이트보드에 flow 로고
- 각 아이콘 아래 작은 라벨: "모니터", "메신저", "머그컵", "화이트보드"

하단 — [COLOR PALETTE] 영역:
- 컬러 스와치 4개: Navy #003F7E, Purple #6300B2, Gold #DAC5A7, Pink #FF59E9
- 각 스와치 아래 HEX 코드

맨 하단: "flow.team · 대한민국 최초 AI 협업툴"

[스타일]
- 깔끔한 2D 플랫 일러스트
- 브랜드 가이드라인 문서 + 캐릭터 시트의 합체
- 정보가 한눈에 보이는 정리된 레이아웃
- 캐릭터는 Image 1과 동일한 스타일 유지`, "floki-friends-unified-sheet.png", fileIds);

  console.log("\n📊 완료!");
}

main().catch(e => console.error(e.message));
