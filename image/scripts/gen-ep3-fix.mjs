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

const PRESERVE = `[preserve — 캐릭터 외형 변경 금지]
캐릭터 시트의 모든 캐릭터 외형, 색상, 비율, 선 스타일을 정확히 유지.
2D 플랫 일러스트 스타일. 굵은 아웃라인.
이초록은 반드시 짧은 검은 머리의 성인 남자. 오렌지 넥타이.
플로키는 연보라색 둥근 범고래, 흰 배, 큰 까만 눈, 분홍 입.
플로수니는 핑크색 둥근 범고래, 하늘색 리본, 긴 속눈썹.`;

async function main() {
  await login();
  const masterFileId = await uploadFile("public/images/flow/floki-friends/floki-friends-character-sheet.png");

  // EP.03 커버
  const cid1 = await createChat("[EP.3 커버 final]");
  await generate(cid1, `첨부한 이미지는 "FLOKI FRIENDS" 캐릭터 시트야. 이 캐릭터들의 디자인을 정확히 참고해서 새로운 장면을 그려줘.
${PRESERVE}

[change — 새로 그릴 장면]
FLOKI FRIENDS EP.03 "낮과 밤" 커버.

사무실 책상. 이초록(오렌지 넥타이 남자)이 노트를 펼쳐놓고 내려다보고 있음.
노트 왼쪽 페이지에 플로키(보라 범고래)가 혼자 그려져 있고,
오른쪽 페이지에 이초록이 방금 플로수니(핑크 범고래, 리본)를 플로키 옆에 그려주고 있는 중.
노트에서 두 범고래가 살아나듯 빛과 함께 나오고 있음. 플로키는 하트눈.

배경이 왼쪽은 밝은 낮(햇살, 커피잔), 오른쪽은 어두운 밤(모니터 빛, flow 메신저 알림)으로 나뉨.
"낮에도 밤에도 함께하는" 느낌.

⚠️ 이초록은 노트를 내려다보는 시선. 독자를 향하지 않음.

상단: "FLOKI FRIENDS"
하단: "EP.03 낮과 밤"
정사각형 1:1 비율.`, "floki-friends-ep3-cover.png", [masterFileId]);

  await new Promise(r => setTimeout(r, 3000));

  // EP.03 만화
  const cid2 = await createChat("[EP.3 만화 final]");
  await generate(cid2, `첨부한 이미지는 "FLOKI FRIENDS" 캐릭터 시트야. 이 캐릭터들의 디자인을 정확히 참고해서 4컷 만화를 그려줘.
${PRESERVE}

[4컷 만화 — 정사각형 2x2 그리드, 각 칸에 대사 말풍선]

제목: "낮과 밤" (맨 위 작게)

⚠️ 이초록은 4컷 모두 짧은 검은 머리 성인 남자(오렌지 넥타이).
⚠️ 여자 동료는 사람 여성으로 그려줘. 단정한 차림, 밝은 미소.

1컷(좌상): 이초록이 노트를 봄. 노트에 플로키(보라 범고래)가 혼자 그려져 있음.
  이초록 생각 구름: "플로키 혼자네... 범고래는 혼자 안 사는데."

2컷(우상): 낮 사무실. 옆자리 여자 동료가 밝게 웃으며 이초록에게 커피를 건넴.
  동료 말풍선: "힘내요 이초록 씨~"
  이초록: 살짝 미소

3컷(좌하): 밤 사무실. 이초록 혼자 야근 중. 모니터에 flow 메신저 알림. 동료 메시지: "야근이에요? 제가 도와줄게요." 화면에 코드가 올라옴.
  이초록 생각 구름: "...이 사람은 낮에도 밤에도 옆에 있네."

4컷(우하): 위에서 내려다보는 시점(이초록의 눈). 노트에 플로수니(핑크 범고래, 리본)를 플로키 옆에 그려줌. 플로키가 하트눈.
  이초록 생각 구름: "범고래는 같이 있어야 범고래지."

정사각형 1:1 비율. 2x2 그리드.
⚠️ 4컷 노트는 위에서 내려다보는 시점. 독자 방향으로 거꾸로 그려진 게 아님.`, "floki-friends-ep3-comic.png", [masterFileId]);

  console.log("\n📊 완료!");
}

main().catch(e => console.error(e.message));
