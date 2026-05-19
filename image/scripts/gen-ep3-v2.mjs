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
이초록: 짧은 검은 머리 성인 남자, 오렌지 넥타이.
플로키: 연보라색 둥근 범고래, 흰 배, 큰 까만 눈, 분홍 입.
플로수니: 핑크색 둥근 범고래, 하늘색 리본, 긴 속눈썹.`;

async function main() {
  await login();
  const masterFileId = await uploadFile("public/images/flow/floki-friends/floki-friends-character-sheet.png");

  // EP.03 만화만 수정
  const cid = await createChat("[EP.3 만화 노트방향 fix]");
  await generate(cid, `첨부한 이미지는 "FLOKI FRIENDS" 캐릭터 시트야. 이 캐릭터들의 디자인을 정확히 참고해서 4컷 만화를 그려줘.
${PRESERVE}

[4컷 만화 — 정사각형 2x2 그리드, 각 칸에 대사 말풍선]

제목: "낮과 밤" (맨 위 작게)

1컷(좌상): over-the-shoulder 시점 — 이초록(오렌지 넥타이)의 어깨 너머로 책상 위 노트를 내려다보는 구도. 이초록의 뒷머리와 어깨가 프레임 아래쪽에 보임. 노트에 플로키(보라 범고래)가 혼자 그려져 있음. 이초록이 보는 방향과 독자가 보는 방향이 같음.
  이초록 생각 구름: "플로키 혼자네... 범고래는 혼자 안 사는데."
  ⚠️ 카메라는 이초록 뒤에서 어깨 너머로 노트를 내려다보는 앵글. 이초록과 독자가 같은 방향에서 노트를 봄.

2컷(우상): 낮 사무실. 옆자리 여자 동료(사람, 단정한 차림)가 밝게 웃으며 이초록에게 커피를 건넴.
  동료 말풍선: "힘내요 이초록 씨~"

3컷(좌하): 밤 사무실. 이초록 혼자 야근 중. 모니터에 flow 메신저 알림. 동료 메시지: "야근이에요? 제가 도와줄게요." 코드가 올라옴.
  이초록 생각 구름: "...이 사람은 낮에도 밤에도 옆에 있네."

4컷(우하): 같은 over-the-shoulder 시점 — 이초록의 어깨 너머로 노트를 내려다봄. 노트에 플로키(보라 범고래)와 플로수니(핑크 범고래, 리본)가 나란히 그려져 있음. 플로키는 하트눈. 반짝임 효과.
  이초록 생각 구름: "범고래는 같이 있어야 범고래지."
  ⚠️ 카메라는 이초록 뒤에서 어깨 너머로 노트를 내려다보는 앵글. 그림이 이초록 시점과 독자 시점 모두에서 자연스럽게 보여야 함.

정사각형 1:1 비율. 2x2 그리드.

⚠️⚠️⚠️ 매우 중요: 카메라 앵글 ⚠️⚠️⚠️
1컷과 4컷은 반드시 이초록의 뒤쪽/어깨 너머에서 노트를 내려다보는 over-the-shoulder 앵글.
이초록의 뒷머리/어깨가 프레임 하단에 보이고, 노트가 프레임 중앙~상단에 보이는 구도.
이렇게 하면 노트 속 그림이 이초록과 독자 모두에게 자연스러운 방향으로 보임.`, "floki-friends-ep3-comic.png", [masterFileId]);

  console.log("\n📊 완료!");
}

main().catch(e => console.error(e.message));
