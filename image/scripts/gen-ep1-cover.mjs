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

async function createChat() {
  const res = await fetch(`${API}/api/v1/chattings`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ title: "[FLOKI FRIENDS EP.1 Cover]", type: "general" }),
  });
  const data = await res.json();
  console.log("chatting:", data.chattingId);
  return data.chattingId;
}

async function generate(chatId) {
  const prompt = `FLOKI FRIENDS Episode 1 커버 아트를 제작해줘.

제목: "바다가 보여"
부제: FLOKI FRIENDS EP.01

[장면]
밤 늦은 사무실. 책상 위 서류더미, 모니터 불빛만 남은 어두운 공간.
오렌지 넥타이를 한 통통한 직장인 남자(이초록)가 의자에 기대앉아 눈을 감고 있다.
그의 노트 위에는 보라색 범고래 낙서가 그려져 있다.

이초록의 머리 위/주변으로 상상의 바다가 펼쳐진다 —
어두운 사무실이 푸른 바다와 경계 없이 섞이는 초현실 구도.
그 바다 속에서 보라색 범고래(플로키)가 자유롭게 헤엄치며 이초록을 향해 웃고 있다.
플로키는 둥근 보라색 몸체에 흰 배, 작은 뾰족 등지느러미, 큰 까만 눈, 분홍 입을 가진 귀여운 범고래 캐릭터.

[스타일]
- 한국 웹툰/일러스트 감성
- 따뜻하면서 약간 쓸쓸한 무드
- 사무실(현실)과 바다(상상)의 경계가 녹아드는 초현실 구도
- 부드러운 수채화 느낌 + 깔끔한 라인
- 감성적인 색감: 사무실은 어두운 네이비/그레이, 바다는 보라+블루 그라디언트
- 세로 포스터 비율 (3:4)

[텍스트]
상단: "FLOKI FRIENDS" 로고 타이포 (둥글고 귀여운 산세리프)
하단: "EP.01 바다가 보여"
우측 하단 작게: "사무실이라는 수조 안에서, 이초록은 바다를 만들었다."

[품질]
고해상도, 프리미엄 웹툰 커버 아트, 감성적이면서 상업적 퀄리티.
실제 웹툰 플랫폼에 올라갈 수 있는 수준.`;

  console.log("generating...", prompt.length, "chars");

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

  // URL 추출
  const urls = [];
  const patterns = [
    /https?:\/\/[^\s")\]]+\.(?:png|jpg|jpeg|webp)/gi,
    /"url"\s*:\s*"(https?:\/\/[^"]+)"/g,
    /"src"\s*:\s*"(https?:\/\/[^"]+)"/g,
  ];
  for (const p of patterns) {
    for (const m of text.matchAll(p)) {
      urls.push(m[1] || m[0]);
    }
  }

  console.log("found urls:", urls.length);

  if (urls.length > 0) {
    const imgUrl = urls[urls.length - 1];
    console.log("downloading:", imgUrl.slice(0, 100));
    const imgRes = await fetch(imgUrl);
    const buf = Buffer.from(await imgRes.arrayBuffer());
    const outPath = "public/images/flow/floki-friends-ep1-cover.png";
    fs.writeFileSync(outPath, buf);
    console.log(`✅ 저장: ${outPath} (${(buf.length / 1024).toFixed(0)}KB)`);
  } else {
    console.log("❌ 이미지 URL 없음");
    console.log("SSE tail:", text.slice(-800));
  }
}

async function main() {
  await login();
  const chatId = await createChat();
  await generate(chatId);
}

main().catch(e => console.error(e));
