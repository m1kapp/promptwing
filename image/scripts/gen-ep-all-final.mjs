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

// 마스터 레퍼런스: 방금 만든 통합 캐릭터 시트
const MASTER_REF = "public/images/flow/floki-friends-character-sheet.png";

const PRESERVE = `[preserve — 캐릭터 외형 변경 금지]
첨부한 캐릭터 시트(Image 1)의 모든 캐릭터 외형을 정확히 유지해야 합니다:
- 이초록: 사람 남자, 오렌지 넥타이, 베이지 셔츠, 회색 바지, 짧은 검은 머리
- 플로키: 보라색 범고래, 흰 배, 뾰족 등지느러미
- 보라부키: 연두색 바다거북, 갈색 등껍질, 분홍 볼
- 플로수니: 핑크색 범고래, 하늘색 리본
- 펭플로: 흑백 펭귄, 주황 부리와 발
- 선 스타일, 색상, 비율 전부 캐릭터 시트와 동일하게
- 2D 플랫 일러스트 스타일 유지`;

const episodes = [
  {
    filename: "floki-friends-ep1-cover.png",
    title: "[EP.1]",
    prompt: `첨부한 이미지는 "FLOKI FRIENDS" 캐릭터 시트야. 이 캐릭터들의 디자인을 정확히 참고(reference, subject)해서 새로운 장면을 그려줘.

${PRESERVE}

[change — 새로 그릴 장면]
FLOKI FRIENDS EP.01 "바다가 보여" 웹툰 커버 포스터.

밤 늦은 사무실. 이초록이 책상에 엎드려 잠들어 있어.
책상에 서류더미, 모니터, 커피잔. 노트에 플로키 낙서가 그려져 있어.
이초록의 머리 위로 상상의 바다가 펼쳐지면서 플로키가 활짝 웃으며 헤엄치고 있어.
사무실 아래쪽은 어두운 네이비 톤, 위쪽 바다는 보라+블루 톤.
물고기, 산호, 물거품 등 바다 요소.

상단: "FLOKI FRIENDS" 텍스트
하단: "EP.01 바다가 보여"

세로 3:4 비율.`,
  },
  {
    filename: "floki-friends-ep2-cover.png",
    title: "[EP.2]",
    prompt: `첨부한 이미지는 "FLOKI FRIENDS" 캐릭터 시트야. 이 캐릭터들의 디자인을 정확히 참고(reference, subject)해서 새로운 장면을 그려줘.

${PRESERVE}

[change — 새로 그릴 장면]
FLOKI FRIENDS EP.02 "느려도 괜찮아" 웹툰 커버 포스터.

퇴근길 밤 지하철 안. 창밖으로 도시 야경이 흐르고 있어.
이초록이 지하철 의자에 앉아 무릎 위 노트에 보라부키를 그리고 있어.
노트에서 보라부키가 살아나듯 반쯤 튀어나오고, 주변에 꽃잎 2-3개가 흩날려.
이초록은 약간 쓸쓸하지만 미소를 짓고 있어.
지하철 안은 따뜻한 오렌지 조명, 창밖은 어두운 블루 톤.
다른 승객은 실루엣으로 간단히.

상단: "FLOKI FRIENDS" 텍스트
하단: "EP.02 느려도 괜찮아"

세로 3:4 비율.`,
  },
  {
    filename: "floki-friends-ep3-cover.png",
    title: "[EP.3]",
    prompt: `첨부한 이미지는 "FLOKI FRIENDS" 캐릭터 시트야. 이 캐릭터들의 디자인을 정확히 참고(reference, subject)해서 새로운 장면을 그려줘.

${PRESERVE}

[change — 새로 그릴 장면]
FLOKI FRIENDS EP.03 "낮과 밤" 웹툰 커버 포스터.

화면을 좌우로 반 나눈 split-screen 구도.

왼쪽(낮): 밝은 사무실. 플로수니가 기타를 치며 눈 감고 행복하게 웃고 있어. 음표, 꽃, 햇살. 밝은 파스텔 핑크 톤.

오른쪽(밤): 어두운 방. 같은 플로수니가 모니터 앞에서 날카로운 반쯤 감긴 눈으로 타이핑 중. 모니터 빛만 비춤. 다크 퍼플 톤.

가운데 경계에 플로키가 작게 하트 눈으로 끼어있어.
아래쪽에 이초록, 보라부키, 펭플로가 작게 구경하고 있어.

상단: "FLOKI FRIENDS" 텍스트
하단: "EP.03 낮과 밤"

세로 3:4 비율.`,
  },
  {
    filename: "floki-friends-ep4-cover.png",
    title: "[EP.4]",
    prompt: `첨부한 이미지는 "FLOKI FRIENDS" 캐릭터 시트야. 이 캐릭터들의 디자인을 정확히 참고(reference, subject)해서 새로운 장면을 그려줘.

${PRESERVE}

[change — 새로 그릴 장면]
FLOKI FRIENDS EP.04 "포커페이스" 웹툰 커버 포스터.

비 오는 밤. 작은 술집 창가.
이초록과 펭플로가 나란히 창가 바 의자에 앉아 있어.
테이블에 소주병과 소주잔 두 개.
유리창에 빗줄기가 흐르고, 창밖은 어둡고 가로등 빛이 번져.

펭플로가 한쪽 날개로 엄지척 하면서 큰 눈에서 눈물이 주르륵.
말풍선: "Good..."
이초록은 따뜻하게 미소 짓고 있어.

실내는 따뜻한 앰버/오렌지 조명, 창밖은 차가운 블루.

상단: "FLOKI FRIENDS" 텍스트
하단: "EP.04 포커페이스"

세로 3:4 비율.`,
  },
];

async function main() {
  await login();

  // 마스터 레퍼런스 업로드 (한 번만)
  console.log("📎 마스터 캐릭터 시트 업로드");
  const masterFileId = await uploadFile(MASTER_REF);

  for (const ep of episodes) {
    const chatId = await createChat(ep.title);
    await generate(chatId, ep.prompt, ep.filename, [masterFileId]);
    await new Promise(r => setTimeout(r, 3000));
  }

  console.log("\n📊 완료!");
}

main().catch(e => console.error(e));
