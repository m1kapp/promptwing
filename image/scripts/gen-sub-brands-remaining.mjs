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
