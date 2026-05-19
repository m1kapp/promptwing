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

function extractGeneratedImageUrl(sseText) {
  for (const line of sseText.split("\n")) {
    if (!line.startsWith("data: ")) continue;
    try {
      const data = JSON.parse(line.slice(6));
      if (data.type === "generated_image" && data.imageData?.url) return data.imageData.url;
    } catch {}
  }
  for (const line of sseText.split("\n")) {
    if (!line.startsWith("data: ")) continue;
    try {
      const data = JSON.parse(line.slice(6));
      if (data.type === "tool_result" && data.result?.url) return data.result.url;
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
    fs.writeFileSync(`public/images/flow/${filename}`, buf);
    console.log(`   ✅ ${filename} (${(buf.length / 1024).toFixed(0)}KB)`);
    return true;
  }
  console.log("   ❌ 실패:", text.slice(-300));
  return false;
}

const MASTER_REF = "public/images/flow/floki-friends-character-sheet.png";

const PRESERVE = `[preserve — 캐릭터 외형 변경 금지]
캐릭터 시트의 모든 캐릭터 외형, 색상, 비율, 선 스타일을 정확히 유지.
2D 플랫 일러스트 스타일. 굵은 아웃라인.`;

const items = [
  // ===== 커버 4장 (정사각형) =====
  {
    filename: "floki-friends-ep1-cover.png",
    title: "[EP.1 커버 1:1]",
    prompt: `첨부한 이미지는 "FLOKI FRIENDS" 캐릭터 시트야. 이 캐릭터들의 디자인을 정확히 참고해서 새로운 장면을 그려줘.
${PRESERVE}

[change — 새로 그릴 장면]
FLOKI FRIENDS EP.01 "바다가 보여" 커버.

밤 늦은 사무실. 이초록이 책상에 엎드려 잠들어 있어. 서류더미, 모니터, 커피잔. 노트에 플로키 낙서.
이초록 위로 상상의 바다가 펼쳐지면서 플로키가 활짝 웃으며 헤엄치고 있어.
아래는 어두운 네이비, 위는 보라+블루 바다. 물고기, 산호, 물거품.

상단: "FLOKI FRIENDS"
하단: "EP.01 바다가 보여"
정사각형 1:1 비율.`,
  },
  {
    filename: "floki-friends-ep2-cover.png",
    title: "[EP.2 커버 1:1]",
    prompt: `첨부한 이미지는 "FLOKI FRIENDS" 캐릭터 시트야. 이 캐릭터들의 디자인을 정확히 참고해서 새로운 장면을 그려줘.
${PRESERVE}

[change — 새로 그릴 장면]
FLOKI FRIENDS EP.02 "느려도 괜찮아" 커버.

퇴근길 밤 지하철. 이초록이 의자에 앉아 노트에 보라부키를 그리고 있어.
보라부키가 노트에서 살아나듯 반쯤 나오고, 꽃잎이 흩날려.
이초록은 쓸쓸하지만 미소. 지하철 안은 따뜻한 오렌지, 창밖은 블루 야경.

상단: "FLOKI FRIENDS"
하단: "EP.02 느려도 괜찮아"
정사각형 1:1 비율.`,
  },
  {
    filename: "floki-friends-ep3-cover.png",
    title: "[EP.3 커버 1:1]",
    prompt: `첨부한 이미지는 "FLOKI FRIENDS" 캐릭터 시트야. 이 캐릭터들의 디자인을 정확히 참고해서 새로운 장면을 그려줘.
${PRESERVE}

[change — 새로 그릴 장면]
FLOKI FRIENDS EP.03 "낮과 밤" 커버.

좌우 split-screen. 왼쪽(낮): 플로수니가 기타 치며 웃음, 음표, 꽃, 파스텔 핑크. 오른쪽(밤): 같은 플로수니가 모니터 앞 날카로운 눈으로 타이핑, 다크 퍼플.
가운데에 플로키가 하트눈으로 끼어있어. 아래에 이초록, 보라부키, 펭플로가 작게 구경.

상단: "FLOKI FRIENDS"
하단: "EP.03 낮과 밤"
정사각형 1:1 비율.`,
  },
  {
    filename: "floki-friends-ep4-cover.png",
    title: "[EP.4 커버 1:1]",
    prompt: `첨부한 이미지는 "FLOKI FRIENDS" 캐릭터 시트야. 이 캐릭터들의 디자인을 정확히 참고해서 새로운 장면을 그려줘.
${PRESERVE}

[change — 새로 그릴 장면]
FLOKI FRIENDS EP.04 "포커페이스" 커버.

비 오는 밤 술집 창가. 이초록과 펭플로가 나란히 앉아 있어.
소주병+소주잔. 유리창에 빗줄기. 창밖 가로등.
펭플로가 엄지척 하면서 눈물. 말풍선: "Good..."
이초록은 따뜻한 미소. 실내 앰버 조명, 창밖 블루.

상단: "FLOKI FRIENDS"
하단: "EP.04 포커페이스"
정사각형 1:1 비율.`,
  },

  // ===== 4컷 만화 4장 (정사각형, 2x2 그리드) =====
  {
    filename: "floki-friends-ep1-comic.png",
    title: "[EP.1 4컷 1:1]",
    prompt: `첨부한 이미지는 "FLOKI FRIENDS" 캐릭터 시트야. 이 캐릭터들의 디자인을 정확히 참고해서 4컷 만화를 그려줘.
${PRESERVE}

[4컷 만화 — 정사각형 2x2 그리드, 각 칸에 대사 말풍선]

제목: "바다가 보여" (맨 위 작게)

1컷(좌상): 밤 사무실. 이초록 야근 중. 서류에 "긴급" 포스트잇.
  이초록: "오늘도... 야근이다..."

2컷(우상): 이초록 책상에 엎드려 잠듦. ZzZ. 생각구름에 푸른 바다가 보임.

3컷(좌하): 꿈속 바다. 플로키가 활짝 웃으며 헤엄침. 물고기, 산호.
  플로키: "여기는 자유야~ 같이 놀자!"

4컷(우하): 다음날 아침. 이초록 눈 비비며 노트를 봄. 보라색 범고래 낙서가 그려져 있음.
  이초록: "...이게 뭐지?"

정사각형 1:1 비율. 2x2 그리드.`,
  },
  {
    filename: "floki-friends-ep2-comic.png",
    title: "[EP.2 4컷 1:1]",
    prompt: `첨부한 이미지는 "FLOKI FRIENDS" 캐릭터 시트야. 이 캐릭터들의 디자인을 정확히 참고해서 4컷 만화를 그려줘.
${PRESERVE}

[4컷 만화 — 정사각형 2x2 그리드, 각 칸에 대사 말풍선]

제목: "느려도 괜찮아" (맨 위 작게)

1컷(좌상): 사무실. 이초록이 올린 코드 리뷰에 빨간 X 표시 잔뜩. 모니터에 "리젝".
  이초록: "또 리젝이야..."

2컷(우상): 퇴근 지하철. 이초록이 창밖 야경을 멍하니 봄.
  이초록 생각: "나는 왜 이렇게 느릴까..."

3컷(좌하): 이초록이 노트에 바다거북을 그리고 있음. 거북이가 느릿느릿 바다를 건너는 모습.
  이초록 생각: "느려도... 끝까지 가는 거잖아."

4컷(우하): 보라부키가 노트에서 살아나듯 고개를 내밀며 웃음. 꽃잎 흩날림.
  보라부키: "Hi~"
  이초록: (미소)

정사각형 1:1 비율. 2x2 그리드.`,
  },
  {
    filename: "floki-friends-ep3-comic.png",
    title: "[EP.3 4컷 1:1]",
    prompt: `첨부한 이미지는 "FLOKI FRIENDS" 캐릭터 시트야. 이 캐릭터들의 디자인을 정확히 참고해서 4컷 만화를 그려줘.
${PRESERVE}

[4컷 만화 — 정사각형 2x2 그리드, 각 칸에 대사 말풍선]

제목: "낮과 밤" (맨 위 작게)

1컷(좌상): 낮 사무실. 옆자리 여자 동료가 밝게 웃으며 기타를 치고 있음. 음표 날림.
  이초록 생각: "저 사람은 항상 밝아..."

2컷(우상): 밤 11시. 이초록 야근 중. flow 메신저에 초록불 — 재택인 그녀가 코드를 올림. 깔끔한 코드.
  이초록: "?! 3일 걸릴 걸 반나절에??"

3컷(좌하): 이초록이 노트에 핑크색 범고래를 그림. 리본 달린. 귀여운데 눈이 날카로운.
  이초록 생각: "귀여운데... 무서운 사람..."

4컷(우하): 플로수니를 플로키 옆에 나란히 그려놓음. 둘이 엄지척하는 포즈.
  이초록: "...어울린다."
  (플로키 하트눈)

정사각형 1:1 비율. 2x2 그리드.`,
  },
  {
    filename: "floki-friends-ep4-comic.png",
    title: "[EP.4 4컷 1:1]",
    prompt: `첨부한 이미지는 "FLOKI FRIENDS" 캐릭터 시트야. 이 캐릭터들의 디자인을 정확히 참고해서 4컷 만화를 그려줘.
${PRESERVE}

[4컷 만화 — 정사각형 2x2 그리드, 각 칸에 대사 말풍선]

제목: "포커페이스" (맨 위 작게)

1컷(좌상): 회의실. 팀장님(이초록 시점)이 발표 중. 무표정. 15년째 무표정.
  이초록 생각: "팀장님은 감정이 없는 걸까..."

2컷(우상): 회의 끝. 팀장님이 돌아서며 말함.
  팀장님: "오늘 월급날이니까 고기 먹으러 가자."
  (팀장님 눈이 살짝 반짝)

3컷(좌하): 회식 2차. 비 오는 밤 술집. 팀장님이 창가에서 혼자 소주 한잔.
  이초록이 옆에 앉음.
  팀장님: "이초록 씨, 나도 힘들 때 있어요."

4컷(우하): 이초록이 노트에 펭귄을 그림. 엄지척하면서 우는 펭귄.
  말풍선: "Good..."
  이초록 생각: "포커페이스가 아니었구나..."

정사각형 1:1 비율. 2x2 그리드.`,
  },
];

async function main() {
  await login();
  const masterFileId = await uploadFile(MASTER_REF);

  let success = 0, fail = 0;
  for (const item of items) {
    const chatId = await createChat(item.title);
    if (await generate(chatId, item.prompt, item.filename, [masterFileId])) success++;
    else fail++;
    await new Promise(r => setTimeout(r, 3000));
  }

  console.log(`\n📊 완료: 성공 ${success} / 실패 ${fail}`);
}

main().catch(e => console.error(e));
