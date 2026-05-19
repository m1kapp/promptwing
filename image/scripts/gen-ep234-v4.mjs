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

async function generate(chatId, prompt, filename) {
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

const CHAR_DESC = `
[캐릭터 외형 가이드 — 모든 캐릭터를 이 설명대로 그려야 함]

이초록: 사람. 통통한 체형, 짧은 회색 머리, 오렌지색 넥타이, 베이지 셔츠, 회색 바지, 갈색 구두. 굵은 네이비색 아웃라인. 둥글고 귀여운 얼굴.

플로키: 보라색 범고래. 둥근 연보라색(#B8A9E8) 몸체, 흰색 배, 작은 뾰족한 등지느러미, 큰 까만 동그란 눈, 분홍 입, 볼에 흰색 하이라이트. 짧은 지느러미 팔. 통통하고 아기자기한 비율.

보라부키: 바다거북. 연두색 몸, 갈색 등껍질, 노란 배, 분홍 볼, 큰 까만 눈, 머리 위에 짧은 머리카락 몇 가닥.

플로수니: 핑크색 범고래. 플로키와 같은 체형이지만 핑크색(#F2B8D6). 머리에 하늘색 리본, 긴 속눈썹, 분홍 볼. 플로키의 여자친구.

펭플로: 펭귄. 클래식한 흑백 펭귄, 주황색 부리, 주황색 발, 둥근 몸, 큰 까만 눈.

[스타일 — 매우 중요]
- 한국 카카오톡 이모티콘과 동일한 2D 플랫 스타일
- 굵고 깔끔한 아웃라인 (네이비 또는 검정)
- 단순한 플랫 컬러 채색 (그라디언트 최소, 배경에만 허용)
- 귀엽고 단순한 캐릭터 비율
- 절대 3D 렌더링, 포토리얼, 시네마틱 스타일 금지
`;

const episodes = [
  {
    filename: "floki-friends-ep2-cover.png",
    title: "[EP.2 flat]",
    prompt: `한국 카카오톡 이모티콘 스타일의 2D 플랫 일러스트 웹툰 커버를 그려줘.

제목: "FLOKI FRIENDS EP.02 느려도 괜찮아"
${CHAR_DESC}
[장면]
퇴근길 밤 지하철 안. 창밖으로 도시의 불빛이 흐르고 있다.

이초록(오렌지 넥타이 직장인)이 지하철 의자에 앉아 무릎 위에 노트를 펼치고 있다.
노트 위에 초록색 바다거북(보라부키)을 그리고 있는 중. 연필을 쥔 손.
표정은 약간 쓸쓸하지만 입꼬리가 올라간 미소.

노트에서 보라부키가 살아나듯 반쯤 튀어나오고 있다 — 꽃잎이 보라부키 주변에 2-3개 흩날림.
보라부키는 이초록을 올려다보며 웃고 있다.

지하철 내부는 따뜻한 오렌지 조명, 창밖은 어두운 도시 야경(파란 톤).
다른 승객들은 실루엣으로 간단히 처리.

[텍스트]
- 상단: "FLOKI FRIENDS" (둥글고 귀여운 볼드 산세리프, 흰색)
- 하단: "EP.02 느려도 괜찮아"
- 하단 작게: "느려도 끝까지 가는 건, 바다거북이 증명했다."

[비율] 세로 3:4`,
  },
  {
    filename: "floki-friends-ep3-cover.png",
    title: "[EP.3 flat]",
    prompt: `한국 카카오톡 이모티콘 스타일의 2D 플랫 일러스트 웹툰 커버를 그려줘.

제목: "FLOKI FRIENDS EP.03 낮과 밤"
${CHAR_DESC}
[장면]
세로 화면을 좌우로 반 나눈 split-screen 구도. 가운데에 지그재그 또는 물결 경계선.

왼쪽(낮): 밝고 따뜻한 사무실. 플로수니(핑크색 범고래, 하늘색 리본)가 기타를 치며 눈을 감고 행복하게 웃고 있다. 배경에 음표, 작은 꽃, 햇살. 밝은 파스텔 핑크+크림 톤.

오른쪽(밤): 어두운 방. 같은 플로수니가 모니터 앞에 앉아 날카로운 반쯤 감긴 눈으로 타이핑 중. 모니터 빛만 얼굴에 비침. 화면에 코드가 보임. 차갑고 다크 퍼플 톤.

가운데 경계선 위에 플로키(보라색 범고래)가 작게 끼어서 두 세계를 번갈아보며 하트 눈(♥) 표정.

[텍스트]
- 상단: "FLOKI FRIENDS" (둥글고 귀여운 볼드 산세리프)
- 하단: "EP.03 낮과 밤"
- 하단 작게: "귀엽다고 만만하게 보면 안 돼."

[비율] 세로 3:4`,
  },
  {
    filename: "floki-friends-ep4-cover.png",
    title: "[EP.4 flat]",
    prompt: `한국 카카오톡 이모티콘 스타일의 2D 플랫 일러스트 웹툰 커버를 그려줘.

제목: "FLOKI FRIENDS EP.04 포커페이스"
${CHAR_DESC}
[장면]
비 오는 밤. 작은 술집 창가 자리.

이초록(오렌지 넥타이 직장인)과 펭플로(흑백 펭귄)가 나란히 창가 바 의자에 앉아 있다.
테이블 위에 초록색 소주병과 소주잔 두 개. 안주 접시.
유리창에 빗줄기가 흐르고 있다. 창밖은 어두운 파란 톤, 가로등 불빛이 번져 보인다.

펭플로가 한쪽 지느러미로 엄지척을 하면서 큰 눈에서 눈물이 주르륵 흐르고 있다.
말풍선: "Good..."

이초록은 놀란 듯 눈이 동그래졌다가 따뜻하게 미소 짓고 있다.
한 손에 소주잔을 들고 있다.

전체 분위기: 쓸쓸하면서 따뜻한. 실내는 따뜻한 오렌지/앰버 조명, 창밖은 차가운 블루.

[텍스트]
- 상단: "FLOKI FRIENDS" (둥글고 귀여운 볼드 산세리프)
- 하단: "EP.04 포커페이스"
- 하단 작게: "포커페이스인 줄 알았는데, 참고 있었을 뿐이었다."

[비율] 세로 3:4`,
  },
];

async function main() {
  await login();
  for (const ep of episodes) {
    const chatId = await createChat(ep.title);
    await generate(chatId, ep.prompt, ep.filename);
    await new Promise(r => setTimeout(r, 3000));
  }
  console.log("\n📊 완료!");
}

main().catch(e => console.error(e));
