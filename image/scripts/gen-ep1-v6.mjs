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
이초록은 반드시 짧은 검은 머리의 성인 남자. 오렌지 넥타이.`;

async function main() {
  await login();
  const masterFileId = await uploadFile("public/images/flow/floki-friends/floki-friends-character-sheet.png");

  // EP.01 커버 (정사각형) — 만화와 일관된 장면
  const cid1 = await createChat("[EP.1 커버 v8]");
  await generate(cid1, `첨부한 이미지는 "FLOKI FRIENDS" 캐릭터 시트야. 이 캐릭터들의 디자인을 정확히 참고해서 새로운 장면을 그려줘.
${PRESERVE}

[change — 새로 그릴 장면]
FLOKI FRIENDS EP.01 "바다가 보여" 커버.

회의실. 이초록(오렌지 넥타이 남자)이 회의 테이블에서 노트를 펼쳐놓고 펜으로 범고래를 그리고 있음.
노트에서 캐릭터 시트의 플로키(연보라색 둥근 범고래, 흰 배, 큰 까만 눈, 분홍 입)가 살아나듯 빛과 함께 튀어나오고 있음.
뒤쪽 벽 화이트보드에 범고래 팀 사냥 그림이 그려져 있고 "협업" 글씨가 보임.
이초록은 노트를 내려다보며 미소 짓고 있음 (독자가 아닌 노트를 보는 시선).
플로키 주변에 작은 물방울, 반짝임 효과.

⚠️ 이초록은 노트를 내려다보는 자연스러운 시선. 독자/카메라를 향하지 않음.
⚠️ 플로키는 반드시 캐릭터 시트의 디자인과 동일.

상단: "FLOKI FRIENDS"
하단: "EP.01 바다가 보여"
정사각형 1:1 비율.`, "floki-friends-ep1-cover.png", [masterFileId]);

  await new Promise(r => setTimeout(r, 3000));

  // EP.01 만화 (정사각형 2x2)
  const cid2 = await createChat("[EP.1 만화 v6]");
  await generate(cid2, `첨부한 이미지는 "FLOKI FRIENDS" 캐릭터 시트야. 이 캐릭터들의 디자인을 정확히 참고해서 4컷 만화를 그려줘.
${PRESERVE}

[4컷 만화 — 정사각형 2x2 그리드, 각 칸에 대사 말풍선]

제목: "바다가 보여" (맨 위 작게)

⚠️ 이초록은 4컷 모두 짧은 검은 머리 성인 남자(오렌지 넥타이). 팀장님은 통통한 체형의 검은 정장 남자.

1컷(좌상): 회의실. 팀장님(통통, 검은 정장)이 화이트보드 앞에서 발표 중. 화이트보드에 범고래 그림이 그려져 있음.
  팀장님 말풍선: "우리 팀도 범고래처럼 협업을 잘해야 합니다."
  이초록(오렌지 넥타이, 뒤에 앉아있음) 생각 구름: "범고래...?"

2컷(우상): 이초록이 회의 중 몰래 핸드폰으로 "범고래 사냥" 검색. 핸드폰 화면에 범고래 무리가 백상아리를 사냥하는 영상이 보임.
  이초록 말풍선: "혼자 못 이기는 걸 같이 이기네...!"

3컷(좌하): 이초록이 고개를 들어 팀 동료들을 돌아봄. (동료들의 뒷모습/옆모습이 보임)
  이초록 생각 구름: "우리도... 할 수 있을까."

4컷(우하): 위에서 내려다보는 시점(이초록의 눈). 이초록의 손과 노트만 보임. 노트에 캐릭터 시트의 "플로키"가 그려져 있음 — 둥근 연보라색 범고래, 흰 배, 큰 까만 눈, 분홍 입으로 웃는 얼굴. 옆에 메모: "협업의 천재"
  ⚠️ 노트 속 범고래는 반드시 캐릭터 시트의 플로키와 동일한 디자인이어야 함. 일반 고래가 아님!

정사각형 1:1 비율. 2x2 그리드.`, "floki-friends-ep1-comic.png", [masterFileId]);

  console.log("\n📊 완료!");
}

main().catch(e => console.error(e.message));
