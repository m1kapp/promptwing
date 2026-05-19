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
  console.log("   ❌ 실패:", text.slice(-300));
  return false;
}

const PRESERVE = `[preserve — 캐릭터 외형 변경 금지]
캐릭터 시트의 모든 캐릭터 외형, 색상, 비율, 선 스타일을 정확히 유지.
2D 플랫 일러스트 스타일. 굵은 아웃라인.
이초록은 반드시 짧은 검은 머리의 성인 남자. 절대 여자로 그리지 마.`;

const items = [
  {
    filename: "floki-friends-ep2-comic.png",
    title: "[EP.2 v2]",
    prompt: `첨부한 이미지는 "FLOKI FRIENDS" 캐릭터 시트야. 이 캐릭터들의 디자인을 정확히 참고해서 4컷 만화를 그려줘.
${PRESERVE}

[4컷 만화 — 정사각형 2x2 그리드, 각 칸에 대사 말풍선]

제목: "느려도 괜찮아" (맨 위 작게)

1컷(좌상): 사무실. 이초록(짧은 검은 머리 남자, 오렌지 넥타이)이 모니터 앞에서 풀 죽어있음. 모니터에 빨간 X "리젝". 옆자리 동료는 모니터에 초록 체크 "승인!" 하고 기뻐하는 중.
  이초록 말풍선: "또 나만 리젝이야..."

2컷(우상): 퇴근길 밤 지하철. 이초록(같은 남자)이 핸드폰을 보고 있음. 핸드폰 화면에 바다거북이 바다를 헤엄치는 다큐 영상이 보임.
  핸드폰 자막: "바다거북은 시속 2km로 대양을 건넌다"

3컷(좌하): 이초록(같은 남자)이 핸드폰을 내리고 미소. 창밖 야경이 흐름.
  이초록 생각 구름: "느려도... 끝까지 가면 되는 거잖아."
  ⚠️ 한글 매우 중요: 반드시 "느려도"로 정확히 써줘. "느껴도" 아님!

4컷(우하): 다음날 사무실. 이초록(같은 남자) 책상. 위에서 내려다보는 시점(이초록의 눈)으로 노트가 보임. 노트에 초록색 바다거북이 그려져 있고, 옆에 "파이팅" 메모.
  (노트는 이초록 시점에서 자연스러운 방향으로 — 거꾸로 그려진 게 아님)

정사각형 1:1 비율. 2x2 그리드.
⚠️ 이초록은 4컷 모두 동일한 외형(짧은 검은 머리 성인 남자, 오렌지 넥타이).
⚠️ 4컷은 위에서 내려다보는 시점(top-down)으로 노트만 보이게.`,
  },
  {
    filename: "floki-friends-ep4-comic.png",
    title: "[EP.4 v2]",
    prompt: `첨부한 이미지는 "FLOKI FRIENDS" 캐릭터 시트야. 이 캐릭터들의 디자인을 정확히 참고해서 4컷 만화를 그려줘.
${PRESERVE}

[4컷 만화 — 정사각형 2x2 그리드, 각 칸에 대사 말풍선]

제목: "포커페이스" (맨 위 작게)

⚠️ 이 에피소드의 주인공은 이초록(사람 남자, 오렌지 넥타이)이야.
⚠️ 팀장님도 사람이야: 통통한 체형, 짧은 다리, 검은 정장, 뒤뚱뒤뚱 걷는 걸음걸이가 펭귄을 닮은 남자.

1컷(좌상): 사무실 복도. 팀장님(통통 체형, 검은 정장, 짧은 다리)이 뒤뚱뒤뚱 걸어가는 뒷모습. 걸음걸이가 딱 펭귄. 이초록(오렌지 넥타이)이 뒤에서 그 모습을 보고 있음.
  이초록 생각 구름: "팀장님 걸음걸이... 왜 이렇게 펭귄 같지..."

2컷(우상): 회의 끝. 팀장님(같은 통통 남자, 무표정)이 돌아서며 말함. 이초록(오렌지 넥타이)이 놀란 표정. 팀장님 옆으로 펭귄 실루엣이 반투명하게 살짝 겹쳐 보임.
  팀장님 말풍선: "오늘 월급날이니까 고기 먹으러 가자!"

3컷(좌하): 비 오는 밤 술집 창가. 이초록(오렌지 넥타이)과 팀장님(검은 정장, 통통) 둘이 나란히 앉아 소주 한잔. 창밖에 비. 둘 다 사람.
  팀장님 말풍선: "이초록 씨... 나도 힘들 때 있어요."

4컷(우하): 위에서 내려다보는 시점(이초록의 눈)으로 노트가 보임. 노트에 엄지척하며 우는 펭귄 그림. 옆에 메모: "겉은 턱시도, 속은 눈물"
  (노트는 이초록 시점에서 자연스러운 방향)

정사각형 1:1 비율. 2x2 그리드.
⚠️ 팀장님 체형이 핵심: 통통하고 짧은 다리로 뒤뚱뒤뚱 걷는 모습이 펭귄을 연상시켜야 함.
⚠️ 4컷 모두 이초록은 사람(오렌지 넥타이), 팀장님도 사람(검은 정장). 펭귄은 노트 안에만.`,
  },
];

async function main() {
  await login();
  const masterFileId = await uploadFile("public/images/flow/floki-friends/floki-friends-character-sheet.png");

  for (const item of items) {
    const chatId = await createChat(item.title);
    await generate(chatId, item.prompt, item.filename, [masterFileId]);
    await new Promise(r => setTimeout(r, 3000));
  }

  console.log("\n📊 완료!");
}

main().catch(e => console.error(e));
