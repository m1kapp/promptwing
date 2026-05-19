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
  console.log("   ❌ 실패:", text.slice(-300));
  return false;
}

// 기존 이모지 아트 스타일 공통 지시문
const STYLE_GUIDE = `
[아트 스타일 — 매우 중요]
첨부한 레퍼런스 이모지 이미지의 아트 스타일을 정확히 따라야 한다:
- 굵고 깔끔한 검정/네이비 아웃라인
- 단순한 플랫 컬러 (그라디언트 없음, 그림자 최소)
- 2D 일러스트레이션 (절대 3D 렌더링 아님)
- 한국 카카오톡 이모티콘 스타일
- 캐릭터 비율과 디자인을 레퍼런스와 동일하게 유지
- 이초록: 통통한 체형, 회색 단발머리, 오렌지 넥타이, 베이지 셔츠, 회색 바지, 네이비 아웃라인
- 배경도 심플하게: 단색 또는 간단한 일러스트 배경
- 절대 포토리얼, 3D, 시네마틱 스타일 금지
- 세로 비율 (3:4)
`;

const episodes = [
  {
    filename: "floki-friends-ep1-cover.png",
    title: "[EP.1 v2]",
    refs: ["public/references/flow/characters/leechorok/leechorok-overtime.png", "public/references/flow/characters/leechorok/leechorok-burnout.png", "public/references/flow/characters/floki/floki-hi.png"],
    prompt: `FLOKI FRIENDS EP.01 커버 일러스트.
제목: "바다가 보여"

[장면]
밤 늦은 사무실. 이초록(첨부한 레퍼런스의 직장인 남자 캐릭터)이 책상에 엎드려 잠들어 있다.
서류와 모니터가 있는 책상, 창밖은 달과 별이 보이는 밤.
이초록의 머리 위로 상상의 바다가 물결처럼 펼쳐지고,
그 바다 안에서 보라색 범고래 플로키(첨부한 레퍼런스의 보라색 캐릭터)가 "Hi~" 하며 헤엄치고 있다.
사무실과 바다가 자연스럽게 이어지는 몽환적 구도.

상단 텍스트: "FLOKI FRIENDS"
하단 텍스트: "EP.01 바다가 보여"
${STYLE_GUIDE}`,
  },
  {
    filename: "floki-friends-ep2-cover.png",
    title: "[EP.2 v2]",
    refs: ["public/references/flow/characters/leechorok/leechorok-crowded-subway.png", "public/references/flow/characters/leechorok/leechorok-life-is-bitter.png", "public/references/flow/characters/borabuki/borabuki-hi.png"],
    prompt: `FLOKI FRIENDS EP.02 커버 일러스트.
제목: "느려도 괜찮아"

[장면]
퇴근길 지하철 안. 이초록(첨부한 레퍼런스의 직장인 남자 캐릭터)이 지하철 의자에 앉아 노트를 펼치고 있다.
노트 위에 초록색 바다거북(보라부키 — 첨부한 레퍼런스의 거북이 캐릭터)을 그리고 있는 중.
보라부키가 노트에서 살아나듯 살짝 튀어나오며 꽃잎이 흩날린다.
이초록은 쓸쓸하지만 미소 짓는 표정.
창밖으로 도시 야경이 흐르고 있다.

상단 텍스트: "FLOKI FRIENDS"
하단 텍스트: "EP.02 느려도 괜찮아"
${STYLE_GUIDE}`,
  },
  {
    filename: "floki-friends-ep3-cover.png",
    title: "[EP.3 v2]",
    refs: ["public/references/flow/characters/flosuni/flosuni-guitar.png", "public/references/flow/characters/flosuni/flosuni-dark-typing.png", "public/references/flow/characters/flosuni/flosuni-floki-best.png"],
    prompt: `FLOKI FRIENDS EP.03 커버 일러스트.
제목: "낮과 밤"

[장면]
세로 화면을 좌우로 반 나눈 split-screen 구도.

왼쪽(낮): 밝은 사무실. 핑크색 범고래 플로수니(첨부한 레퍼런스의 핑크 캐릭터)가 하늘색 리본을 달고 기타를 치며 밝게 웃고 있다. 햇살, 음표, 꽃 장식. 발랄한 분위기.

오른쪽(밤): 어두운 방. 같은 플로수니가 모니터 앞에서 날카로운 반쯤 감긴 눈으로 타이핑 중. 화면 빛만 비추는 차갑고 날카로운 분위기.

가운데 경계선에 보라색 범고래 플로키가 작게 끼어서 양쪽을 번갈아 보고 있다 (하트 눈).

상단 텍스트: "FLOKI FRIENDS"
하단 텍스트: "EP.03 낮과 밤"
하단 작게: "귀엽다고 만만하게 보면 안 돼."
${STYLE_GUIDE}`,
  },
  {
    filename: "floki-friends-ep4-cover.png",
    title: "[EP.4 v2]",
    refs: ["public/references/flow/characters/leechorok/leechorok-hoesik-idol.png", "public/references/flow/characters/pengflow/pengflow-rain-drink.png", "public/references/flow/characters/pengflow/pengflow-good-cry.png"],
    prompt: `FLOKI FRIENDS EP.04 커버 일러스트.
제목: "포커페이스"

[장면]
비 오는 밤, 술집 창가.
이초록(첨부한 레퍼런스의 직장인 남자 캐릭터)과 펭귄 캐릭터 펭플로(첨부한 레퍼런스의 흑백 펭귄)가 나란히 창가에 앉아 있다.
테이블 위에 소주병과 소주잔 두 개.
유리창에 빗줄기가 흐르고 있다.
펭플로는 엄지척을 하면서 눈물을 흘리고 있다 — 말풍선 "Good..."
이초록은 놀란 듯 따뜻하게 미소 짓고 있다.
전체적으로 따뜻하면서 쓸쓸한 분위기.

상단 텍스트: "FLOKI FRIENDS"
하단 텍스트: "EP.04 포커페이스"
하단 작게: "포커페이스인 줄 알았는데, 참고 있었을 뿐이었다."
${STYLE_GUIDE}`,
  },
];

async function main() {
  await login();

  for (const ep of episodes) {
    const chatId = await createChat(ep.title);
    const fileIds = [];
    for (const ref of ep.refs) {
      if (fs.existsSync(ref)) {
        fileIds.push(await uploadFile(ref));
      }
    }
    await generate(chatId, ep.prompt, ep.filename, fileIds);
    await new Promise(r => setTimeout(r, 3000));
  }

  console.log("\n📊 완료!");
}

main().catch(e => console.error(e));
