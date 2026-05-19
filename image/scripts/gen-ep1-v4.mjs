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

const prompt = `한국 카카오톡 이모티콘 스타일의 2D 플랫 일러스트 웹툰 커버를 그려줘.

제목: "FLOKI FRIENDS EP.01 바다가 보여"

[장면]
밤 늦은 사무실. 아래쪽은 어두운 사무실, 위쪽으로 갈수록 환상의 바다가 펼쳐지는 초현실 구도.

사무실 영역: 서류더미와 모니터가 있는 책상. 한 직장인 남자 캐릭터가 책상에 엎드려 잠들어 있다.
- 이 남자 캐릭터(이초록): 통통한 체형, 짧은 회색 머리, 오렌지색 넥타이, 베이지 셔츠, 회색 바지. 굵은 네이비색 아웃라인. 플랫 컬러. 눈 감고 잠든 표정. 코앞 노트에는 범고래 낙서가 그려져 있다.

바다 영역: 이초록 머리 위로 보라+블루 바다가 펼쳐진다. 작은 물고기들, 물거품, 빛줄기.
그 바다에서 범고래 캐릭터가 활짝 웃으며 헤엄치고 있다.
- 이 범고래 캐릭터(플로키): 둥근 보라색(연보라 #B8A9E8) 범고래. 둥근 큰 머리, 작은 뾰족한 등지느러미, 흰색 배, 큰 까만 동그란 눈, 분홍 입으로 활짝 웃는 얼굴. 볼에 흰색 동그란 하이라이트. 짧은 지느러미 팔. 전체적으로 아기자기하고 통통한 비율.

[스타일 — 매우 중요]
- 한국 카카오톡 이모티콘과 동일한 2D 플랫 스타일
- 굵고 깔끔한 아웃라인 (네이비 또는 검정)
- 단순한 플랫 컬러 채색 (그라디언트 최소)
- 귀엽고 단순한 캐릭터 비율
- 절대 3D 렌더링, 포토리얼, 시네마틱 스타일 금지
- 선은 깨끗하고, 색은 밝고, 전체적으로 귀여운 느낌

[텍스트]
- 상단에 "FLOKI FRIENDS" (둥글고 귀여운 볼드 산세리프, 흰색 또는 밝은 색)
- 하단에 "EP.01 바다가 보여" (깔끔한 한글 타이포)

[비율] 세로 3:4 포스터
[배경색] 사무실 부분은 어두운 네이비(#1a1a3e), 바다 부분은 보라+블루 그라디언트`;

async function main() {
  await login();
  const chatId = await createChat("[EP.1 flat style]");
  await generate(chatId, prompt, "floki-friends-ep1-cover.png");
}

main().catch(e => console.error(e));
