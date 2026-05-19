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
  console.log(`   📎 ${fileName} → ${fileId}`);
  return fileId;
}

function extractGeneratedImageUrl(sseText) {
  for (const line of sseText.split("\n")) {
    if (!line.startsWith("data: ")) continue;
    try {
      const data = JSON.parse(line.slice(6));
      if (data.type === "generated_image" && data.imageData?.url) return data.imageData.url;
    } catch {}
  }
  for (const line of sseText.split("\n")) {
    if (!line.startsWith("data: ")) continue;
    try {
      const data = JSON.parse(line.slice(6));
      if (data.type === "tool_result" && data.result?.url) return data.result.url;
    } catch {}
  }
  return null;
}

async function generate(chatId, prompt, filename, fileIds) {
  console.log(`\n🎨 생성 중: ${filename}`);
  const res = await fetch(`${API}/api/v1/agent`, {
    method: "POST",
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
    fs.writeFileSync(`public/images/flow/${filename}`, buf);
    console.log(`   ✅ ${filename} (${(buf.length / 1024).toFixed(0)}KB)`);
    return true;
  }
  console.log("   ❌ 실패:", text.slice(-400));
  return false;
}

async function main() {
  await login();

  const masterFileId = await uploadFile("public/images/flow/floki-friends-character-sheet.png");
  const chatId = await createChat("[EP.1 4컷만화]");

  await generate(chatId, `첨부한 이미지는 "FLOKI FRIENDS" 캐릭터 시트야. 이 캐릭터들의 디자인을 정확히 참고해서 4컷 만화를 그려줘.

[preserve — 캐릭터 외형 변경 금지]
캐릭터 시트의 모든 캐릭터 외형, 색상, 비율, 선 스타일을 정확히 유지.
2D 플랫 일러스트 스타일 유지. 굵은 아웃라인.

[4컷 만화 구성 — 세로로 4칸, 각 칸에 대사 말풍선 포함]

제목: "바다가 보여" (맨 위에 작게)

1컷: 밤 11시 사무실. 이초록이 모니터 앞에서 야근 중. 옆에 서류 산더미.
     서류에 "긴급" "ASAP" 포스트잇이 붙어있음.
     이초록 말풍선: "오늘도... 야근이다..."

2컷: 이초록이 책상에 엎드려 잠들었다. ZzZ.
     꿈속에서 푸른 바다가 보이기 시작한다 (말풍선 대신 생각 구름).
     노트 위에 연필이 굴러가고 있다.

3컷: 꿈속 바다. 플로키가 활짝 웃으며 헤엄치고 있다.
     플로키 말풍선: "여기는 자유야~ 같이 놀자!"
     바다 배경에 물고기, 물거품. 밝고 보라+블루 톤.

4컷: 다음 날 아침. 이초록이 눈을 비비며 일어나다가 노트를 본다.
     노트에 자기도 모르게 그린 보라색 범고래 낙서가 있다.
     이초록 말풍선: "...이게 뭐지?"
     (관객은 이게 플로키의 탄생임을 알게 됨)

[스타일]
- 4칸이 세로로 나열된 한국 웹툰/네컷만화 레이아웃
- 각 칸 사이에 얇은 구분선
- 말풍선은 둥글고 읽기 쉽게, 한국어 대사
- 첨부 캐릭터 시트와 동일한 플랫 일러스트 스타일
- 배경은 심플하되 분위기 전달

[비율] 세로 2:3 (세로로 긴 4컷 만화)`, "floki-friends-ep1-comic.png", [masterFileId]);
}

main().catch(e => console.error(e));
