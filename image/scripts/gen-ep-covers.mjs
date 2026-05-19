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
  const data = await res.json();
  return data.chattingId;
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
  for (const p of [
    /https?:\/\/[^\s")\]]+\.(?:png|jpg|jpeg|webp)/gi,
    /"url"\s*:\s*"(https?:\/\/[^"]+)"/g,
  ]) {
    for (const m of text.matchAll(p)) urls.push(m[1] || m[0]);
  }

  if (urls.length > 0) {
    const imgRes = await fetch(urls[urls.length - 1]);
    const buf = Buffer.from(await imgRes.arrayBuffer());
    const outPath = `public/images/flow/${filename}`;
    fs.writeFileSync(outPath, buf);
    console.log(`   ✅ 저장: ${filename} (${(buf.length / 1024).toFixed(0)}KB)`);
    return true;
  }
  console.log("   ❌ 실패");
  console.log("   SSE:", text.slice(-300));
  return false;
}

const episodes = [
  {
    filename: "floki-friends-ep2-cover.png",
    title: "[FLOKI FRIENDS EP.2]",
    prompt: `FLOKI FRIENDS Episode 2 커버 아트를 제작해줘.

제목: "느려도 괜찮아"
부제: FLOKI FRIENDS EP.02

[장면]
퇴근길 지하철 안. 창밖으로 도시의 불빛이 흐르고 있다.
오렌지 넥타이의 통통한 직장인 남자(이초록)가 지하철 의자에 앉아 노트를 펼치고 있다.
노트 위에 초록색 바다거북을 그리고 있는 중.
표정은 약간 쓸쓸하지만 미소가 번지고 있다.

노트에서 그려지고 있는 바다거북(보라부키)이 살아 움직이듯 노트 밖으로 나오려 한다.
보라부키는 연두색 몸, 갈색 등껍질, 노란 배, 분홍 볼을 가진 귀여운 바다거북 캐릭터.
작은 꽃잎들이 보라부키 주변에 흩날린다.

[스타일]
- 한국 웹툰/일러스트 감성
- 따뜻하고 위로가 되는 무드
- 지하철(현실)에서 노트(상상)로 이어지는 연출
- 전체적으로 따뜻한 톤: 오렌지+연두+크림
- 세로 포스터 비율 (3:4)

[텍스트]
상단: "FLOKI FRIENDS" 로고 타이포
하단: "EP.02 느려도 괜찮아"
하단 작게: "느려도 끝까지 가는 건, 바다거북이 증명했다."

[품질]
고해상도, 프리미엄 웹툰 커버 아트, 감성적이면서 상업적 퀄리티.`,
  },
  {
    filename: "floki-friends-ep3-cover.png",
    title: "[FLOKI FRIENDS EP.3]",
    prompt: `FLOKI FRIENDS Episode 3 커버 아트를 제작해줘.

제목: "낮과 밤"
부제: FLOKI FRIENDS EP.03

[장면]
화면이 세로로 반으로 나뉜 구도.

왼쪽 반(낮): 밝은 사무실. 핑크색 범고래 캐릭터(플로수니)가 하늘색 리본을 달고 밝게 웃으며 동료들과 있다. 기타를 치거나 발표하는 발랄한 모습. 햇살이 들어오는 따뜻한 분위기.

오른쪽 반(밤): 어두운 방. 모니터 빛만 비치는 공간. 같은 플로수니가 날카로운 눈빛으로 키보드를 타이핑하고 있다. 코드가 화면에 흐른다. 눈이 반쯤 감기고 집중한 모습. 차갑고 날카로운 분위기.

가운데에 보라색 범고래(플로키)가 두 세계 사이에서 살짝 엿보고 있다 — 플로수니의 두 모습을 모두 좋아한다는 표정.

플로키: 둥근 보라색 범고래, 흰 배, 뾰족 등지느러미, 큰 까만 눈
플로수니: 둥근 핑크색 범고래, 하늘색 리본, 긴 속눈썹, 분홍 볼

[스타일]
- 한국 웹툰/일러스트 감성
- 대비가 있는 split-screen 구도
- 왼쪽은 따뜻한 파스텔, 오른쪽은 차가운 다크 톤
- 세로 포스터 비율 (3:4)

[텍스트]
상단: "FLOKI FRIENDS" 로고 타이포
하단: "EP.03 낮과 밤"
하단 작게: "귀엽다고 만만하게 보면 안 돼."

[품질]
고해상도, 프리미엄 웹툰 커버 아트, 감성적이면서 상업적 퀄리티.`,
  },
  {
    filename: "floki-friends-ep4-cover.png",
    title: "[FLOKI FRIENDS EP.4]",
    prompt: `FLOKI FRIENDS Episode 4 커버 아트를 제작해줘.

제목: "포커페이스"
부제: FLOKI FRIENDS EP.04

[장면]
비 오는 밤. 회식 후 2차 술집 창가.
빗줄기가 유리창을 타고 흐른다.

창가 자리에 오렌지 넥타이의 직장인(이초록)과 흑백 펭귄 캐릭터(펭플로)가 나란히 앉아 있다.
이초록은 실제 사람, 펭플로는 이초록의 상상 속 캐릭터 — 하지만 이 장면에서는 마치 진짜 옆에 앉아 있는 것처럼.

펭플로는 평소의 포커페이스가 아니라, 엄지척을 하면서 눈물을 흘리고 있다.
"Good..." 이라고 말하는데 울고 있는 표정.
이초록은 그런 펭플로를 보며 놀란 듯 따뜻한 미소를 짓는다.

테이블 위에 소주잔 두 개. 창밖 빗소리가 들리는 듯한 분위기.

펭플로: 클래식한 흑백 펭귄, 주황 부리, 주황 발, 둥근 몸

[스타일]
- 한국 웹툰/일러스트 감성
- 쓸쓸하면서 따뜻한, 감정적인 무드
- 비 오는 밤의 감성: 블루+앰버 조명
- 유리창 빗물 반사, 따뜻한 실내 조명
- 세로 포스터 비율 (3:4)

[텍스트]
상단: "FLOKI FRIENDS" 로고 타이포
하단: "EP.04 포커페이스"
하단 작게: "포커페이스인 줄 알았는데, 참고 있었을 뿐이었다."

[품질]
고해상도, 프리미엄 웹툰 커버 아트, 감성적이면서 상업적 퀄리티.
실제 웹툰 플랫폼에 올라갈 수 있는 수준.`,
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
