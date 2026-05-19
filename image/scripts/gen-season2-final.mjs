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
- 시즌2에서는 5캐릭터 모두 이미 탄생한 상태. 자유롭게 등장 가능.

[flow 브랜드 — 포인트로만, 최대 2곳]
자연스럽게 배경에 녹이되 과하지 않게. 예: flow 머그컵 1개 + 모니터에 flow UI 1개. 그 이상은 넣지 마.

[노트 장면]
노트가 나오는 컷은 over-the-shoulder 앵글 (이초록 어깨 너머에서 노트를 내려다보는 시점).`;

const items = [
  // ===== EP.05 커버 =====
  { filename: "floki-friends-ep5-cover.png", title: "[S2 EP5 cover]",
    prompt: `${COMMON}

FLOKI FRIENDS EP.05 "읽씹" 커버. 정사각형 1:1.

사무실 밤. 이초록이 책상에서 핸드폰을 들고 멍하게 화면을 보고 있음. 핸드폰 화면에 flow 메신저 — 보낸 메시지 아래 "읽음" 표시만 있고 답장이 없음.
뒤에서 플로키가 이초록 어깨에 지느러미를 올리며 위로하고 있음.
창밖은 어두운 밤, 모니터 빛만 은은하게.

상단: "FLOKI FRIENDS" + 작게 flow.team 로고
하단: "EP.05 읽씹"` },

  // ===== EP.05 만화 =====
  { filename: "floki-friends-ep5-comic.png", title: "[S2 EP5 comic]",
    prompt: `${COMMON}

4컷 만화 정사각형 2x2. 제목: "읽씹"

1컷(좌상): 사무실. 이초록이 모니터에서 flow 메신저로 팀장님에게 기획안을 보냄. 말풍선: "팀장님, 기획안 보내드렸습니다!" 모니터에 flow 메신저 UI(포인트 1).
  ⚠️ 이초록 표정: 자신감 있는 미소

2컷(우상): 30분 후. 이초록이 핸드폰을 계속 확인. "읽음" 표시만 떠 있음. 답장 없음.
  이초록: "읽었는데... 왜 답이 없지..."
  ⚠️ 이초록 표정: 불안

3컷(좌하): 2시간 후. 이초록이 책상에 엎드려있음. 핸드폰 화면 여전히 "읽음". 옆에 flow 머그컵(포인트 2). 펭플로가 옆 의자에서 "Good..." 하며 엄지척.
  이초록 생각: "끝났다... 내 직장생활..."

4컷(우하): 팀장님이 갑자기 나타나 이초록 어깨를 톡톡. 팀장님(통통, 검은 정장) 표정 밝음.
  팀장님: "아 그거 너무 좋아서 바로 임원한테 올렸어요! 답장 깜빡했네~"
  이초록: (눈물+감동) "...!!!!"` },

  // ===== EP.06 커버 =====
  { filename: "floki-friends-ep6-cover.png", title: "[S2 EP6 cover]",
    prompt: `${COMMON}

FLOKI FRIENDS EP.06 "월급의 생애" 커버. 정사각형 1:1.

월급날 아침. 이초록이 ATM 앞에서 통장을 들고 활짝 웃고 있음. 통장에서 빛이 남.
바로 옆에 카드 청구서, 월세, 보험료가 유령처럼 줄 서서 기다리고 있음 (코믹하게).
펭플로가 "월급날" 피켓을 들고 춤추고 있음. 보라부키가 계산기를 두드리며 걱정하는 표정.

상단: "FLOKI FRIENDS" + 작게 flow.team 로고
하단: "EP.06 월급의 생애"` },

  // ===== EP.06 만화 =====
  { filename: "floki-friends-ep6-comic.png", title: "[S2 EP6 comic]",
    prompt: `${COMMON}

4컷 만화 정사각형 2x2. 제목: "월급의 생애"

1컷(좌상): 월급날 아침. 이초록이 핸드폰 알림을 보고 환호. 화면에 "급여 입금 완료". 옆에 펭플로가 같이 댄스.
  이초록: "월급이다!!!! 이번 달은 부자다!!!!"
  ⚠️ 이초록+펭플로 모두 최고로 행복한 표정

2컷(우상): 점심시간. 이초록이 핸드폰으로 자동이체 알림을 연달아 받음. "월세 -80만", "보험 -15만", "카드값 -120만", "적금 -30만". 모니터에 flow UI(포인트 1).
  이초록: "...어?"
  ⚠️ 표정이 점점 굳어감

3컷(좌하): 퇴근 후. 이초록이 편의점에서 삼각김밥을 들고 잔고를 확인. 잔고: "12,400원". flow 머그컵을 텀블러처럼 들고 있음(포인트 2).
  이초록: "월급의 생애... 6시간..."

4컷(우하): 보라부키가 이초록 옆에 앉아서 같이 삼각김밥을 먹고 있음. 보라부키도 작은 삼각김밥.
  보라부키: (느릿느릿) "...괜찮아. 다음 달이 또 오잖아."
  이초록: (눈물) "부키야..."` },

  // ===== EP.07 커버 =====
  { filename: "floki-friends-ep7-cover.png", title: "[S2 EP7 cover]",
    prompt: `${COMMON}

FLOKI FRIENDS EP.07 "보라부키는 괜찮지 않다" 커버. 정사각형 1:1.

비 오는 퇴근길. 보라부키(초록 바다거북)가 큰 서류 더미를 등에 지고 느릿느릿 걸어가고 있음.
우산도 없이 비를 맞고 있지만 표정은 "괜찮아요" 미소. 하지만 눈가에 살짝 눈물.
이초록이 뒤에서 뛰어오며 우산을 씌워주려 하고 있음.
빗방울이 떨어지는 도시 거리. 가로등 불빛.

상단: "FLOKI FRIENDS" + 작게 flow.team 로고
하단: "EP.07 보라부키는 괜찮지 않다"` },

  // ===== EP.07 만화 =====
  { filename: "floki-friends-ep7-comic.png", title: "[S2 EP7 comic]",
    prompt: `${COMMON}

4컷 만화 정사각형 2x2. 제목: "보라부키는 괜찮지 않다"

⚠️ 이 에피소드의 주인공은 보라부키(초록 바다거북). 이초록은 조연.
⚠️ 보라부키의 캐릭터: 느리지만 묵묵히 일하는 성실파. 항상 "괜찮아요"라고 하지만 실은 힘든 타입.

1컷(좌상): 사무실. 동료들이 퇴근 준비. 보라부키가 책상에 서류 산더미. 동료(사람)가 "부키 씨 이것도 부탁해요~" 하며 서류 추가. 모니터에 flow UI(포인트 1).
  보라부키: "...네, 괜찮아요."
  ⚠️ 보라부키 미소지만 눈 밑에 다크서클

2컷(우상): 밤 사무실. 보라부키 혼자 야근. 느릿느릿 타이핑. 시계는 밤 11시. 책상에 flow 머그컵(포인트 2).
  보라부키 생각: "느려서 미안해... 그래도 끝까지는 할게."

3컷(좌하): 보라부키가 화장실 거울 앞에서 혼자 눈물을 닦고 있음. 거울 속 보라부키 표정은 지쳐있음.
  보라부키: "괜찮아, 괜찮아..."
  ⚠️ 진짜 힘든 순간. 감정적인 컷.

4컷(우하): 이초록이 야근하는 보라부키 옆에 와서 앉음. 따뜻한 코코아 두 잔을 내려놓음. 아무 말 없이 옆에서 같이 일하기 시작.
  이초록: "나도 좀 남을게. 같이 하자."
  보라부키: (눈물 글썽) "...초록 씨..."` },

  // ===== EP.08 커버 =====
  { filename: "floki-friends-ep8-cover.png", title: "[S2 EP8 cover]",
    prompt: `${COMMON}

FLOKI FRIENDS EP.08 "칼퇴의 조건" 커버. 정사각형 1:1. 시즌2 피날레.

정시 퇴근 시각 6시. 사무실 시계가 정확히 18:00.
이초록이 가방을 메고 문 앞에 서 있음. 뒤에서 석양 빛이 들어옴.
플로키, 플로수니, 보라부키, 펭플로 4캐릭터가 이초록 주변에서 "칼퇴 축하!" 분위기로 꽃가루를 뿌리며 축하.
뒤쪽 모니터들은 모두 깔끔하게 정리된 flow 태스크 리스트 — 전부 완료 체크.

상단: "FLOKI FRIENDS" + 작게 flow.team 로고
하단: "EP.08 칼퇴의 조건"` },

  // ===== EP.08 만화 =====
  { filename: "floki-friends-ep8-comic.png", title: "[S2 EP8 comic]",
    prompt: `${COMMON}

4컷 만화 정사각형 2x2. 제목: "칼퇴의 조건" (시즌2 피날레)

1컷(좌상): 오후 5시. 이초록이 모니터에서 flow 태스크 리스트를 확인. 마지막 태스크 하나 남음. "Q2 리포트 최종 제출". 모니터에 flow UI(포인트 1).
  이초록: "이것만 끝내면... 오늘은... 칼퇴다."
  ⚠️ 눈에 불꽃이 타오르는 표정

2컷(우상): 이초록이 미친 속도로 타이핑. 키보드에서 불꽃이 튀는 이펙트. 주변 동료들이 놀라서 봄. 플로키가 응원 깃발을 흔들고 있음.
  동료: "이초록 씨 오늘 왜 이렇게 빨라..."
  이초록: "방해하지 마세요."

3컷(좌하): 5시 58분. 이초록이 엔터키를 힘차게 누름. 모니터: "제출 완료 ✓". 의자에서 벌떡 일어남. flow 머그컵(포인트 2)을 깔끔히 씻어 놓음.
  이초록: "끝."

4컷(우하): 6시 정각. 이초록이 사무실 문을 나서며 뒤돌아봄. 석양 빛. 뒤에서 플로키, 플로수니, 보라부키, 펭플로가 손을 흔들고 있음.
  이초록: (미소) "내일 봐, 친구들."
  하단에 작게: "FLOKI FRIENDS Season 2 END"` },
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
