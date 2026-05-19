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

async function generate(chatId, prompt, outputPath, fileIds) {
  console.log(`\n🎨 ${outputPath}`);
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
  const url = extractUrl(text);
  if (url) {
    const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
    fs.writeFileSync(outputPath, buf);
    console.log(`   ✅ (${(buf.length / 1024).toFixed(0)}KB)`);
    return true;
  }
  console.log("   ❌:", text.slice(-300));
  return false;
}

const items = [
  // ===== flow YACHT 브랜드 시트 =====
  {
    outputPath: "public/images/flow/yacht/flow-yacht-brand-sheet.png",
    title: "[flow YACHT 브랜드 시트]",
    prompt: `첨부한 이미지는 flow.team의 메인 로고야. 이 로고를 기반으로 서브 브랜드 "flow YACHT" 브랜드 시트를 만들어줘.

[flow YACHT 컨셉]
flow.team(AI 협업툴)이 운영하는 프리미엄 팀빌딩 워케이션 서비스.
"일도, 쉼도 함께 흘러가듯" — 요트 위에서 팀과 함께 일하고, 바다에서 영감을 얻는 경험.
타겟: IT 스타트업 팀, 리더십 워크숍, 기업 리트릿

[생성할 이미지: 브랜드 시트 1장]
깨끗한 흰색 배경. 가로 16:9.

상단:
- "flow YACHT" 로고 타이포 — "flow"는 첨부한 로고 스타일 유지(보라색 소문자), "YACHT"는 네이비+골드 세리프체로 고급스럽게
- 부제: "Premium Team Workation by flow.team"

중앙 좌측 — [MOOD] 영역:
- 4개의 무드 사진 스타일 썸네일 (일러스트):
  1. 화이트 요트 위 노트북 작업하는 실루엣
  2. 석양 바다 + 요트 데크에서 와인 토스트
  3. 요트 선실 안 미니 회의 (모니터에 flow UI)
  4. 항구에 정박된 요트 + "flow YACHT" 플래그

중앙 우측 — [BRAND ELEMENTS] 영역:
- 로고 사용 예시: 명함, 승선권 디자인, 유니폼 자수
- 키 비주얼: 요트 옆면에 "flow YACHT" 로고

하단 — [COLOR PALETTE]:
- Navy Deep #0A1628
- Ocean Blue #1B4B7A
- Sunset Gold #D4A853
- Flow Purple #6300B2
- White Foam #F8FAFE
- 각 스와치 아래 HEX 코드

맨 하단: "flow YACHT · Premium Team Workation · flow.team"

[스타일]
- 미니멀 럭셔리 브랜드 가이드라인 문서 느낌
- 플랫 일러스트 + 깔끔한 레이아웃
- 네이비/골드/화이트 톤 중심, flow 보라색은 포인트로`,
  },

  // ===== flow YACHT 키 비주얼 =====
  {
    outputPath: "public/images/flow/yacht/flow-yacht-key-visual.png",
    title: "[flow YACHT 키 비주얼]",
    prompt: `첨부한 이미지는 flow.team의 메인 로고야. 이걸 기반으로 "flow YACHT" 서비스의 메인 키 비주얼을 만들어줘.

[장면]
석양이 지는 지중해풍 바다. 깨끗한 화이트 모던 요트가 잔잔한 수면 위에 떠 있음.
요트 데크에는 4-5명의 팀원들이 노트북과 태블릿으로 작업하면서도 여유로운 표정.
요트 측면에 "flow YACHT" 로고가 세련되게 새겨져 있음.
하늘은 오렌지~퍼플 그라데이션 석양.
물 위에 요트 반사.

[텍스트 배치]
상단: "flow YACHT" (네이비 + 골드)
하단: "일도, 쉼도 함께 흘러가듯" + "flow.team"

[스타일]
- 고급 여행 잡지 광고 느낌
- 시네마틱 라이팅, 따뜻한 골든아워 톤
- 미니멀하면서도 럭셔리한 분위기
- 정사각형 1:1`,
  },

  // ===== flow YACHT 프로그램 안내 =====
  {
    outputPath: "public/images/flow/yacht/flow-yacht-program.png",
    title: "[flow YACHT 프로그램]",
    prompt: `첨부한 이미지는 flow.team 로고야. "flow YACHT" 워케이션 프로그램 안내 인포그래픽을 만들어줘.

[내용 — 1일 프로그램 타임라인]
깨끗한 흰색 배경. 가로 16:9.

상단: "flow YACHT Day Program" 타이틀 + flow YACHT 로고

타임라인 (좌→우, 아이콘+텍스트):

09:00 ⛵ 승선 & 모닝 브리핑
- 아이콘: 요트+커피컵
- "항구 집합, 웰컴 드링크"

10:00 💻 오션 스프린트
- 아이콘: 노트북+파도
- "요트 데크에서 집중 업무 2h"

12:00 🍽️ 시셰프 런치
- 아이콘: 접시+요트
- "선상 코스 요리"

14:00 🏊 프리타임
- 아이콘: 수영+스노클링
- "바다 액티비티 자유시간"

16:00 🧠 팀 리트로스펙티브
- 아이콘: 화이트보드+flow로고
- "석양 보며 회고 미팅"

18:00 🥂 선셋 파티
- 아이콘: 와인잔+석양
- "하선 전 네트워킹"

하단: "flow YACHT · 팀과 함께 흘러가는 하루 · flow.team"

[스타일]
- 미니멀 인포그래픽
- 네이비/골드/화이트 팔레트
- 플랫 아이콘 일러스트
- 고급 리조트 팸플릿 느낌`,
  },

  // ===== flow DAILY 브랜드 시트 =====
  {
    outputPath: "public/images/flow/daily/flow-daily-brand-sheet.png",
    title: "[flow DAILY 브랜드 시트]",
    prompt: `첨부한 이미지는 flow.team의 메인 로고야. 이 로고를 기반으로 서브 브랜드 "flow DAILY" 브랜드 시트를 만들어줘.

[flow DAILY 컨셉]
flow.team(AI 협업툴)이 운영하는 사내 카페 & 샌드위치 브랜드.
"매일의 흐름을 채우는 한 잔" — 오피스 워커들의 에너지를 채워주는 커피와 간편식.
1층 로비 카페 + 모바일 주문(flow 앱 연동) + 점심 샌드위치 구독

[생성할 이미지: 브랜드 시트 1장]
깨끗한 흰색 배경. 가로 16:9.

상단:
- "flow DAILY" 로고 타이포 — "flow"는 첨부한 로고 스타일 유지(보라색 소문자), "DAILY"는 따뜻한 브라운 산세리프 볼드
- 부제: "Office Cafe & Sandwich by flow.team"

중앙 좌측 — [MENU HIGHLIGHT] 영역:
- 4개의 시그니처 메뉴 일러스트:
  1. "Flow Latte" — 라벤더 컬러 라떼 (flow 보라색 활용)
  2. "Sprint Espresso" — 더블 에스프레소 샷
  3. "Daily Sandwich" — 통밀빵 + 아보카도 + 에그
  4. "Retro Cookie" — 보라+골드 아이싱 쿠키

중앙 우측 — [BRAND TOUCHPOINTS] 영역:
- 테이크아웃 컵 디자인 (보라색 flow 로고 + "DAILY")
- 샌드위치 포장지
- 앞치마/유니폼
- 모바일 주문 화면 (flow 앱 스타일)

하단 — [COLOR PALETTE]:
- Espresso Brown #3C2415
- Warm Cream #F5E6D3
- Flow Purple #6300B2
- Avocado Green #6B8E5A
- Bread Gold #D4A853
- 각 스와치 아래 HEX 코드

맨 하단: "flow DAILY · 매일의 흐름을 채우는 한 잔 · flow.team"

[스타일]
- 따뜻하고 미니멀한 카페 브랜딩 가이드 느낌
- 플랫 일러스트 + 정리된 레이아웃
- 브라운/크림/그린 톤 중심, flow 보라색은 포인트로`,
  },

  // ===== flow DAILY 키 비주얼 =====
  {
    outputPath: "public/images/flow/daily/flow-daily-key-visual.png",
    title: "[flow DAILY 키 비주얼]",
    prompt: `첨부한 이미지는 flow.team 로고야. "flow DAILY" 카페의 메인 키 비주얼을 만들어줘.

[장면]
밝고 따뜻한 오피스 빌딩 1층 카페. 큰 통유리 창으로 아침 햇살이 들어옴.
우드+화이트 인테리어. 카운터 뒤 메뉴보드에 "flow DAILY" 로고.
테이크아웃 컵에 보라색 flow 로고. 바리스타가 라떼아트 중.
앞쪽에 노트북 펼쳐놓은 직장인이 커피+샌드위치로 아침 시작.
카운터 옆 디지털 메뉴판에 flow 앱 스타일 UI.

[텍스트 배치]
상단: "flow DAILY" (보라+브라운)
하단: "매일의 흐름을 채우는 한 잔" + "flow.team"

[스타일]
- 따뜻한 카페 인테리어 사진 느낌의 일러스트
- 모닝 라이팅, 따뜻한 톤
- 미니멀하면서도 코지한 분위기
- 정사각형 1:1`,
  },

  // ===== flow DAILY 메뉴보드 =====
  {
    outputPath: "public/images/flow/daily/flow-daily-menu.png",
    title: "[flow DAILY 메뉴]",
    prompt: `첨부한 이미지는 flow.team 로고야. "flow DAILY" 카페 메뉴보드를 만들어줘.

[내용]
깨끗한 크림색 배경. 정사각형 1:1.

상단: "flow DAILY" 로고 + "MENU" (브라운 세리프)

[COFFEE]
- Flow Latte ₩5,500 — 라벤더향 우유 + 에스프레소
- Sprint Shot ₩4,000 — 더블 에스프레소
- Daily Drip ₩4,500 — 핸드드립 오늘의 원두
- Retro Mocha ₩6,000 — 다크초코 + 에스프레소

[SANDWICH]
- Morning Flow ₩7,500 — 통밀 + 아보카도 + 에그 + 루꼴라
- Team Lunch ₩8,500 — 치아바타 + 모짜렐라 + 그릴드치킨
- Sprint Wrap ₩7,000 — 또띠아 + 불고기 + 채소

[DESSERT]
- Purple Cookie ₩3,500 — flow 보라색 아이싱
- Deadline Brownie ₩4,000 — 진한 초코 브라우니

하단: "Order via flow app · 사전주문 시 10% 할인"

[스타일]
- 칠판 느낌 또는 미니멀 카페 메뉴판
- 각 아이템 옆에 작은 일러스트 아이콘
- 브라운/크림/보라 컬러
- 손글씨 느낌의 폰트 (깔끔한 카페 감성)`,
  },
];

async function main() {
  await login();
  const logoFileId = await uploadFile("public/references/flow/logo/flow-logo-purple.png");

  let ok = 0, fail = 0;
  for (const item of items) {
    const cid = await createChat(item.title);
    if (await generate(cid, item.prompt, item.outputPath, [logoFileId])) ok++;
    else fail++;
    await new Promise(r => setTimeout(r, 3000));
  }
  console.log(`\n📊 완료: 성공 ${ok} / 실패 ${fail}`);
}

main().catch(e => console.error(e.message));
