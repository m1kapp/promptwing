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
  console.log(`   📎 ${fileName} -> ${fileId}`);
  return fileId;
}

function extractUrl(sseText) {
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
  console.log(`\n🎨 ${filename}`);
  const res = await fetch(`${API}/api/v1/agent`, {
    method: "POST",
    signal: AbortSignal.timeout(300000),
    headers: { "Content-Type": "application/json", Cookie: cookie, Accept: "text/event-stream" },
    body: JSON.stringify({ query: prompt, conversationId: chatId, model: "gpt-5.1-none-reasoning", imageModel: "gpt-image-2-plus", chatType: "general", isFirstMessage: true, forceOption: "imageGeneration", isSecurityMasking: false, fileIds }),
  });
  const text = await res.text();
  const url = extractUrl(text);
  if (url) {
    const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
    fs.writeFileSync(`public/images/flow/floki-friends/${filename}`, buf);
    console.log(`   ✅ (${(buf.length / 1024).toFixed(0)}KB)`);
    return true;
  }
  console.log("   ❌:", text.slice(-300));
  return false;
}

const COMMON = `첨부한 이미지는 "FLOKI FRIENDS + flow 브랜드" 통합 레퍼런스 시트야.

[preserve]
- 캐릭터 외형: 시트의 캐릭터 디자인 정확히 유지
- 스타일: 2D 플랫 일러스트, 굵은 아웃라인
- 이초록: 짧은 검은 머리 성인 남자, 오렌지 넥타이

[flow 브랜드 — 포인트로만, 최대 2곳]
자연스럽게 배경에 녹이되 과하지 않게. 예: flow 머그컵 1개 + 모니터에 flow UI 1개. 그 이상은 넣지 마.

[노트 장면]
노트가 나오는 컷은 over-the-shoulder 앵글 (이초록 어깨 너머에서 노트를 내려다보는 시점).`;

const items = [
  // ===== EP.01 커버 =====
  { filename: "floki-friends-ep1-cover.png", title: "[S1 EP1 cover]",
    prompt: `${COMMON}

FLOKI FRIENDS EP.01 "바다가 보여" 커버. 정사각형 1:1.

⚠️ 등장 캐릭터: 이초록 + 플로키만. 다른 캐릭터(보라부키, 플로수니, 펭플로)는 아직 안 태어났으므로 등장 금지.

회의실. 이초록이 책상에서 노트를 펼치고 있고, 노트에서 플로키(보라색 범고래)가 빛과 함께 살아나듯 나오고 있음. 뒤쪽 화이트보드에 범고래 그림과 "협업" 글씨.

상단: "FLOKI FRIENDS" + 작게 flow.team 로고
하단: "EP.01 바다가 보여"` },

  // ===== EP.01 만화 =====
  { filename: "floki-friends-ep1-comic.png", title: "[S1 EP1 comic]",
    prompt: `${COMMON}

4컷 만화 정사각형 2x2. 제목: "바다가 보여"
⚠️ 이초록만 등장. 동물 캐릭터는 4컷 노트 안에서만. 회의실에 동물 캐릭터 앉아있으면 안 됨.

1컷(좌상): 회의실. 팀장님(통통, 검은 정장)이 화이트보드 앞에서 발표. 화이트보드에 범고래 그림+"협업". 이초록이 뒤에 앉아있음. 주변은 일반 사람 동료들만.
  팀장님: "우리 팀도 범고래처럼 협업을 잘해야 합니다."
  이초록 생각: "범고래...?"

2컷(우상): 이초록이 몰래 핸드폰으로 범고래 사냥 검색. 책상에 flow 머그컵(포인트 1).
  이초록: "혼자 못 이기는 걸 같이 이기네...!"

3컷(좌하): 이초록이 고개 들어 동료들(사람) 돌아봄.
  이초록 생각: "우리도... 할 수 있을까."

4컷(우하): over-the-shoulder. 이초록 어깨 너머로 노트. 노트에 플로키(보라 범고래) 그림. 메모: "협업의 천재"` },

  // ===== EP.02 커버 =====
  { filename: "floki-friends-ep2-cover.png", title: "[S1 EP2 cover]",
    prompt: `${COMMON}

FLOKI FRIENDS EP.02 "느려도 괜찮아" 커버. 정사각형 1:1.

⚠️ 등장 캐릭터: 이초록 + 보라부키만. 플로키는 이미 탄생했으므로 작게 등장 가능. 플로수니, 펭플로는 등장 금지.

퇴근길 밤 지하철. 이초록이 의자에 앉아 노트에 보라부키를 그리고 있고, 노트에서 보라부키(초록 바다거북)가 살아나듯 나오며 꽃잎이 흩날림. 창밖 도시 야경.

상단: "FLOKI FRIENDS" + 작게 flow.team 로고
하단: "EP.02 느려도 괜찮아"` },

  // ===== EP.02 만화 =====
  { filename: "floki-friends-ep2-comic.png", title: "[S1 EP2 comic]",
    prompt: `${COMMON}

4컷 만화 정사각형 2x2. 제목: "느려도 괜찮아"
⚠️ 이초록만 등장. 플로키, 플로수니, 펭플로 등장 금지. 보라부키는 4컷 노트 안에서만.

1컷(좌상): 사무실. 이초록이 모니터 앞에서 풀 죽어있음. 모니터에 flow UI+빨간 X "리젝". 옆자리 동료(사람) 모니터에 "승인!".
  이초록: "또 나만 리젝이야..."

2컷(우상): 밤 지하철. 이초록이 핸드폰에 바다거북 다큐 영상.
  핸드폰 자막: "바다거북은 시속 2km로 대양을 건넌다"

3컷(좌하): 이초록이 핸드폰 내리고 미소. 창밖 야경. flow 머그컵(포인트).
  이초록 생각: "느려도... 끝까지 가면 되는 거잖아."
  ⚠️ "느려도" 정확히!

4컷(우하): over-the-shoulder. 노트에 보라부키(초록 바다거북) 그림. 메모: "파이팅"` },

  // ===== EP.03 커버 =====
  { filename: "floki-friends-ep3-cover.png", title: "[S1 EP3 cover]",
    prompt: `${COMMON}

FLOKI FRIENDS EP.03 "낮과 밤" 커버. 정사각형 1:1.

⚠️ 등장 캐릭터: 이초록 + 플로키 + 플로수니. 보라부키는 이미 탄생해서 작게 가능. 펭플로 등장 금지.

사무실 책상. 이초록이 노트를 내려다보고 있음. 노트에서 플로키와 플로수니(핑크 범고래, 리본)가 나란히 살아나듯 나옴. 플로키 하트눈. 배경 왼쪽은 낮(햇살), 오른쪽은 밤(달, 모니터 빛). flow 머그컵 1개.

상단: "FLOKI FRIENDS" + 작게 flow.team 로고
하단: "EP.03 낮과 밤"` },

  // ===== EP.03 만화 =====
  { filename: "floki-friends-ep3-comic.png", title: "[S1 EP3 comic]",
    prompt: `${COMMON}

4컷 만화 정사각형 2x2. 제목: "낮과 밤"
⚠️ 이초록만 등장. 플로수니, 펭플로 등장 금지 (동물 형태로). 플로키는 1컷 노트 안에서만. 플로수니는 4컷 노트 안에서만.

1컷(좌상): over-the-shoulder. 이초록 어깨 너머로 노트. 노트에 플로키(보라 범고래)가 혼자 그려져 있음.
  이초록 생각: "플로키 혼자네... 범고래는 혼자 안 사는데."

2컷(우상): 낮 사무실. 여자 동료(사람)가 밝게 웃으며 이초록에게 커피 건넴. 모니터에 flow UI(포인트 1).
  동료: "힘내요 이초록 씨~"

3컷(좌하): 밤 사무실. 이초록 혼자 야근. 모니터에 flow 메신저 — 동료 메시지: "야근이에요? 제가 도와줄게요."(포인트 2)
  이초록 생각: "...이 사람은 낮에도 밤에도 옆에 있네."

4컷(우하): over-the-shoulder. 노트에 플로키(보라)와 플로수니(핑크, 리본) 나란히. 플로키 하트눈.
  이초록 생각: "범고래는 같이 있어야 범고래지."` },

  // ===== EP.04 커버 =====
  { filename: "floki-friends-ep4-cover.png", title: "[S1 EP4 cover]",
    prompt: `${COMMON}

FLOKI FRIENDS EP.04 "포커페이스" 커버. 정사각형 1:1.

⚠️ 등장 캐릭터: 이초록 + 펭플로. 플로키, 보라부키, 플로수니는 이미 탄생해서 작게 가능.

비 오는 밤 술집 창가. 이초록과 펭플로(흑백 펭귄)가 나란히 앉아있음. 소주잔. 유리창에 빗줄기. 펭플로가 "Good..." 하며 엄지척+눈물. 따뜻한 분위기.

상단: "FLOKI FRIENDS" + 작게 flow.team 로고
하단: "EP.04 포커페이스"` },

  // ===== EP.04 만화 =====
  { filename: "floki-friends-ep4-comic.png", title: "[S1 EP4 comic]",
    prompt: `${COMMON}

4컷 만화 정사각형 2x2. 제목: "포커페이스"
⚠️ 이초록 + 팀장님(사람) 등장. 동물 캐릭터는 4컷 노트 안에서만. 팀장님은 통통 체형+짧은 다리+검은 정장 사람 남자.

1컷(좌상): 사무실 복도. 팀장님(통통, 검은 정장)이 뒤뚱뒤뚱 걸어가는 뒷모습. 펭귄 걸음걸이. 이초록이 뒤에서 봄. 벽에 flow 로고 포스터(포인트 1).
  이초록 생각: "팀장님 걸음걸이... 왜 이렇게 펭귄 같지..."

2컷(우상): 회의 끝. 팀장님이 돌아서며 말함. 옆에 펭귄 실루엣 반투명하게 겹침.
  팀장님: "오늘 월급날이니까 고기 먹으러 가자!"

3컷(좌하): 비 오는 밤 고깃집. 이초록+팀장님 나란히 소주. 창밖 비. 테이블에 flow 머그컵 대신 소주잔+안주.
  팀장님: "이초록 씨... 나도 힘들 때 있어요."

4컷(우하): over-the-shoulder. 노트에 펭플로(흑백 펭귄) 엄지척+눈물. 메모: "겉은 턱시도, 속은 눈물"` },
];

async function main() {
  await login();
  const sheetId = await uploadFile("public/images/flow/floki-friends/floki-friends-unified-sheet.png");

  let ok = 0, fail = 0;
  for (const item of items) {
    const cid = await createChat(item.title);
    if (await generate(cid, item.prompt, item.filename, [sheetId])) ok++;
    else fail++;
    await new Promise(r => setTimeout(r, 3000));
  }
  console.log(`\n📊 완료: 성공 ${ok} / 실패 ${fail}`);
}

main().catch(e => console.error(e.message));
