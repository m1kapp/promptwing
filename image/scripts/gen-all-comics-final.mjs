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

const COMMON = `첨부한 이미지는 "FLOKI FRIENDS + flow 브랜드" 통합 레퍼런스 시트야.

[preserve — 반드시 유지]
- 캐릭터 외형: 시트의 5캐릭터 디자인 정확히 유지
- flow 브랜드: 시트의 BRAND IN SCENE 섹션을 참고하여 장면에 자연스럽게 flow 로고/UI 배치
- 스타일: 2D 플랫 일러스트, 굵은 아웃라인
- 이초록: 짧은 검은 머리 성인 남자, 오렌지 넥타이

[flow 브랜드 배치 규칙 — 매 에피소드 필수]
- 사무실 장면: 모니터에 flow 앱 UI 화면, 머그컵에 flow 로고
- 회의실 장면: 화이트보드 또는 스크린에 flow 로고
- 메신저 장면: flow 메신저 UI (시트의 메신저 디자인 참고)
- 최소 2곳 이상에 flow 브랜드가 자연스럽게 보여야 함

[노트에 그리는 장면 규칙]
- 노트가 나오는 컷은 over-the-shoulder 앵글 (이초록 어깨 너머에서 노트를 내려다보는 시점)
- 이초록의 뒷머리/어깨가 프레임 하단에 보이고 노트가 중앙~상단에 보이는 구도
- 노트 속 캐릭터는 캐릭터 시트와 동일한 디자인`;

const items = [
  {
    filename: "floki-friends-ep1-comic.png",
    title: "[EP.1 final]",
    prompt: `${COMMON}

[4컷 만화 — 정사각형 2x2 그리드]
제목: "바다가 보여"

1컷(좌상): 회의실. 팀장님(통통, 검은 정장)이 화이트보드 앞에서 발표. 화이트보드에 범고래 그림과 "협업"이라는 글씨. 화이트보드 구석에 flow 로고. 이초록이 뒤에서 "범고래...?" 생각.
  팀장님: "우리 팀도 범고래처럼 협업을 잘해야 합니다."
  이초록 생각 구름: "범고래...?"

2컷(우상): 이초록이 회의 중 몰래 핸드폰으로 범고래 사냥 검색. 화면에 범고래 무리가 백상아리를 팀으로 사냥하는 영상. 책상에 flow 로고 머그컵.
  이초록: "혼자 못 이기는 걸 같이 이기네...!"

3컷(좌하): 이초록이 고개를 들어 팀 동료들을 돌아봄.
  이초록 생각 구름: "우리도... 할 수 있을까."

4컷(우하): over-the-shoulder 앵글. 이초록 어깨 너머로 노트를 내려다봄. 노트에 플로키(보라 범고래, 캐릭터 시트 디자인 그대로) 그림. 메모: "협업의 천재"

정사각형 1:1.`,
  },
  {
    filename: "floki-friends-ep2-comic.png",
    title: "[EP.2 final]",
    prompt: `${COMMON}

[4컷 만화 — 정사각형 2x2 그리드]
제목: "느려도 괜찮아"

1컷(좌상): 사무실. 이초록이 모니터 앞에서 풀 죽어있음. 모니터에 flow 앱 UI + 빨간 X "리젝". 옆자리 동료 모니터에 초록 체크 "승인!". 책상에 flow 머그컵.
  이초록: "또 나만 리젝이야..."

2컷(우상): 퇴근길 밤 지하철. 이초록이 핸드폰을 보고 있음. 핸드폰 화면에 바다거북이 바다를 헤엄치는 다큐 영상.
  핸드폰 자막: "바다거북은 시속 2km로 대양을 건넌다"

3컷(좌하): 이초록이 핸드폰을 내리고 미소. 창밖 야경.
  이초록 생각 구름: "느려도... 끝까지 가면 되는 거잖아."
  ⚠️ 반드시 "느려도" 정확히!

4컷(우하): over-the-shoulder 앵글. 이초록 어깨 너머로 노트. 노트에 보라부키(초록 바다거북, 캐릭터 시트 디자인 그대로) 그림. 메모: "파이팅"

정사각형 1:1.`,
  },
  {
    filename: "floki-friends-ep3-comic.png",
    title: "[EP.3 final]",
    prompt: `${COMMON}

[4컷 만화 — 정사각형 2x2 그리드]
제목: "낮과 밤"

1컷(좌상): over-the-shoulder 앵글. 이초록 어깨 너머로 노트를 내려다봄. 노트에 플로키(보라 범고래)가 혼자 그려져 있음. 책상에 flow 머그컵.
  이초록 생각 구름: "플로키 혼자네... 범고래는 혼자 안 사는데."

2컷(우상): 낮 사무실. 여자 동료(사람, 단정한 차림)가 밝게 웃으며 이초록에게 커피를 건넴.
  동료: "힘내요 이초록 씨~"

3컷(좌하): 밤 사무실. 이초록 혼자 야근 중. 모니터에 flow 메신저 UI — 동료 메시지: "야근이에요? 제가 도와줄게요." 코드가 올라옴. flow 메신저 UI는 시트의 메신저 디자인 참고.
  이초록 생각 구름: "...이 사람은 낮에도 밤에도 옆에 있네."

4컷(우하): over-the-shoulder 앵글. 이초록 어깨 너머로 노트. 노트에 플로키(보라)와 플로수니(핑크, 리본)가 나란히 그려져 있음. 플로키 하트눈. 반짝임.
  이초록 생각 구름: "범고래는 같이 있어야 범고래지."

정사각형 1:1.`,
  },
  {
    filename: "floki-friends-ep4-comic.png",
    title: "[EP.4 final]",
    prompt: `${COMMON}

[4컷 만화 — 정사각형 2x2 그리드]
제목: "포커페이스"

⚠️ 팀장님: 통통한 체형, 짧은 다리, 검은 정장. 뒤뚱뒤뚱 걸음걸이가 펭귄을 닮은 사람 남자.
⚠️ 이초록과 팀장님 둘 다 사람. 동물 캐릭터가 대체하면 안 됨.

1컷(좌상): 사무실 복도. 팀장님(통통, 짧은 다리, 검은 정장)이 뒤뚱뒤뚱 걸어가는 뒷모습. 딱 펭귄 걸음걸이. 이초록이 뒤에서 보고 있음. 복도 벽에 flow 로고 포스터.
  이초록 생각 구름: "팀장님 걸음걸이... 왜 이렇게 펭귄 같지..."

2컷(우상): 회의 끝. 팀장님이 돌아서며 말함. 팀장님 옆으로 펭귄 실루엣이 반투명하게 겹침. 이초록 놀란 표정. 뒤에 모니터에 flow 앱 UI.
  팀장님: "오늘 월급날이니까 고기 먹으러 가자!"

3컷(좌하): 비 오는 밤 술집. 이초록(오렌지 넥타이)과 팀장님(검은 정장, 통통) 나란히 소주. 창밖 비. 테이블에 소주병+잔+안주.
  팀장님: "이초록 씨... 나도 힘들 때 있어요."

4컷(우하): over-the-shoulder 앵글. 이초록 어깨 너머로 노트. 노트에 펭플로(흑백 펭귄, 캐릭터 시트 디자인 그대로)가 엄지척하며 우는 그림. 메모: "겉은 턱시도, 속은 눈물"

정사각형 1:1.`,
  },
];

async function main() {
  await login();
  console.log("📎 통합 시트 업로드");
  const sheetFileId = await uploadFile("public/images/flow/floki-friends/floki-friends-unified-sheet.png");

  let success = 0, fail = 0;
  for (const item of items) {
    const chatId = await createChat(item.title);
    if (await generate(chatId, item.prompt, item.filename, [sheetFileId])) success++;
    else fail++;
    await new Promise(r => setTimeout(r, 3000));
  }

  console.log(`\n📊 완료: 성공 ${success} / 실패 ${fail}`);
}

main().catch(e => console.error(e.message));
