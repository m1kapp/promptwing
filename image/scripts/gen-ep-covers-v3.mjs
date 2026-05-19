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

async function generate(chatId, prompt, filename, fileIds = []) {
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
      ...(fileIds.length > 0 ? { fileIds } : {}),
    }),
  });

  const text = await res.text();
  const urls = [];
  for (const p of [/https?:\/\/[^\s")\]]+\.(?:png|jpg|jpeg|webp)/gi, /"url"\s*:\s*"(https?:\/\/[^"]+)"/g]) {
    for (const m of text.matchAll(p)) urls.push(m[1] || m[0]);
  }

  if (urls.length > 0) {
    const imgRes = await fetch(urls[urls.length - 1]);
    const buf = Buffer.from(await imgRes.arrayBuffer());
    fs.writeFileSync(`public/images/flow/${filename}`, buf);
    console.log(`   ✅ ${filename} (${(buf.length / 1024).toFixed(0)}KB)`);
    return true;
  }
  console.log("   ❌ 실패:", text.slice(-400));
  return false;
}

const REF_INSTRUCTION = `[중요: 첨부 이미지 사용 방법]
첨부된 이미지들은 캐릭터 디자인 레퍼런스(reference)입니다.
이 이미지들을 편집(edit)하지 마세요.
이 이미지들의 캐릭터 디자인, 아트 스타일, 색상, 선 스타일을 참고(reference)하여 완전히 새로운 장면을 그려야 합니다.
referenceImages의 role은 "style"과 "subject"로 설정하세요.

[아트 스타일]
- 첨부된 이모티콘과 동일한 2D 플랫 일러스트 스타일
- 굵고 깔끔한 네이비/검정 아웃라인
- 단순한 플랫 컬러 (그라디언트 없음)
- 한국 카카오톡 이모티콘 스타일
- 절대 3D, 포토리얼, 시네마틱 스타일 금지
- 캐릭터 외형을 레퍼런스와 동일하게 유지

`;

const episodes = [
  {
    filename: "floki-friends-ep1-cover.png",
    title: "[EP.1 v3]",
    refs: [
      "public/references/flow/characters/leechorok/leechorok-overtime.png",
      "public/references/flow/characters/leechorok/leechorok-burnout.png",
      "public/references/flow/characters/floki/floki-hi.png",
      "public/references/flow/package/floki-package.png",
    ],
    prompt: REF_INSTRUCTION + `FLOKI FRIENDS EP.01 커버 일러스트를 새로 그려주세요.
제목: "바다가 보여"

[장면 구성]
밤 늦은 사무실. 첨부 레퍼런스의 이초록 캐릭터(오렌지 넥타이 직장인)가 책상에 엎드려 잠들어 있다.
서류더미, 모니터, 커피잔이 있는 책상.
이초록의 위쪽으로 상상의 바다가 펼쳐지며, 그 바다에서 첨부 레퍼런스의 플로키(보라색 범고래 캐릭터)가 "Hi~" 하며 헤엄치고 있다.
사무실 아래쪽은 어두운 톤, 위쪽 바다는 보라+블루 톤으로 자연스럽게 전환.

상단 텍스트: "FLOKI FRIENDS"
하단 텍스트: "EP.01 바다가 보여"

세로 3:4 비율 포스터. 첨부 이모티콘과 동일한 플랫 일러스트 스타일로.`,
  },
  {
    filename: "floki-friends-ep2-cover.png",
    title: "[EP.2 v3]",
    refs: [
      "public/references/flow/characters/leechorok/leechorok-crowded-subway.png",
      "public/references/flow/characters/leechorok/leechorok-life-is-bitter.png",
      "public/references/flow/characters/borabuki/borabuki-hi.png",
      "public/references/flow/package/borabuki-package.png",
    ],
    prompt: REF_INSTRUCTION + `FLOKI FRIENDS EP.02 커버 일러스트를 새로 그려주세요.
제목: "느려도 괜찮아"

[장면 구성]
퇴근길 지하철 안. 첨부 레퍼런스의 이초록 캐릭터(오렌지 넥타이 직장인)가 지하철 의자에 앉아 노트를 펼치고 초록색 바다거북을 그리고 있다.
노트에서 첨부 레퍼런스의 보라부키(초록색 바다거북, 갈색 등껍질, 분홍 볼)가 살아나듯 나오며 작은 꽃잎이 흩날린다.
이초록은 약간 쓸쓸하지만 미소를 짓고 있다.
창밖으로 도시 야경이 흐르는 밤.

상단 텍스트: "FLOKI FRIENDS"
하단 텍스트: "EP.02 느려도 괜찮아"

세로 3:4 비율 포스터. 첨부 이모티콘과 동일한 플랫 일러스트 스타일로.`,
  },
  {
    filename: "floki-friends-ep3-cover.png",
    title: "[EP.3 v3]",
    refs: [
      "public/references/flow/characters/flosuni/flosuni-guitar.png",
      "public/references/flow/characters/flosuni/flosuni-dark-typing.png",
      "public/references/flow/characters/flosuni/flosuni-floki-best.png",
      "public/references/flow/characters/floki/floki-love.png",
    ],
    prompt: REF_INSTRUCTION + `FLOKI FRIENDS EP.03 커버 일러스트를 새로 그려주세요.
제목: "낮과 밤"

[장면 구성]
세로 화면을 좌우로 반 나눈 split-screen 구도.

왼쪽(낮): 밝은 사무실. 첨부 레퍼런스의 플로수니(핑크색 범고래, 하늘색 리본)가 기타를 치며 밝게 웃고 있다. 햇살, 음표, 꽃 장식. 발랄한 분위기.

오른쪽(밤): 어두운 방. 같은 플로수니가 모니터 앞에서 날카로운 반쯤 감긴 눈으로 타이핑 중. 모니터 빛만 비추는 차가운 분위기.

가운데 경계에 첨부 레퍼런스의 플로키(보라색 범고래)가 작게 하트 눈으로 끼어있다.

상단 텍스트: "FLOKI FRIENDS"
하단 텍스트: "EP.03 낮과 밤"

세로 3:4 비율 포스터. 첨부 이모티콘과 동일한 플랫 일러스트 스타일로.`,
  },
  {
    filename: "floki-friends-ep4-cover.png",
    title: "[EP.4 v3]",
    refs: [
      "public/references/flow/characters/leechorok/leechorok-hoesik-idol.png",
      "public/references/flow/characters/pengflow/pengflow-rain-drink.png",
      "public/references/flow/characters/pengflow/pengflow-good-cry.png",
      "public/references/flow/characters/pengflow/pengflow-dance.png",
    ],
    prompt: REF_INSTRUCTION + `FLOKI FRIENDS EP.04 커버 일러스트를 새로 그려주세요.
제목: "포커페이스"

[장면 구성]
비 오는 밤. 술집 창가.
첨부 레퍼런스의 이초록 캐릭터(오렌지 넥타이 직장인)와 첨부 레퍼런스의 펭플로(흑백 펭귄, 주황 부리와 발)가 나란히 창가에 앉아 있다.
테이블 위에 소주병과 소주잔 두 개.
유리창에 빗줄기가 흐르고 있다.
펭플로는 엄지척을 하면서 눈물을 흘리고 있다 — 말풍선 "Good..."
이초록은 따뜻하게 미소 짓고 있다.
따뜻한 실내 조명 + 창밖 비.

상단 텍스트: "FLOKI FRIENDS"
하단 텍스트: "EP.04 포커페이스"

세로 3:4 비율 포스터. 첨부 이모티콘과 동일한 플랫 일러스트 스타일로.`,
  },
];

async function main() {
  await login();

  for (const ep of episodes) {
    const chatId = await createChat(ep.title);
    const fileIds = [];
    for (const ref of ep.refs) {
      if (fs.existsSync(ref)) fileIds.push(await uploadFile(ref));
    }
    await generate(chatId, ep.prompt, ep.filename, fileIds);
    await new Promise(r => setTimeout(r, 3000));
  }

  console.log("\n📊 완료!");
}

main().catch(e => console.error(e));
