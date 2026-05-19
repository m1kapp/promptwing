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
  console.log(`📎 ${fileName} → ${fileId}`);
  return fileId;
}

/** generated_image SSE 이벤트에서 URL 추출 */
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
  const genMatch = sseText.match(/https?:\/\/[^\s"]+generated-images[^\s"]*/);
  return genMatch?.[0] || null;
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
    console.log(`   🔗 생성 이미지: ${url.slice(0, 80)}...`);
    const imgRes = await fetch(url);
    const buf = Buffer.from(await imgRes.arrayBuffer());
    fs.writeFileSync(`public/images/flow/${filename}`, buf);
    console.log(`   ✅ ${filename} (${(buf.length / 1024).toFixed(0)}KB)`);
  } else {
    console.log("   ❌ generated_image 이벤트 없음");
    console.log("   SSE tail:", text.slice(-400));
  }
}

async function main() {
  await login();
  // 5캐릭터 패키지 시트 전부 업로드 (각 이미지의 역할을 프롬프트에서 명시)
  const fileIds = [];
  fileIds.push(await uploadFile("public/references/flow/package/leechorok-package.png"));
  fileIds.push(await uploadFile("public/references/flow/package/floki-package.png"));
  fileIds.push(await uploadFile("public/references/flow/package/borabuki-package.png"));
  fileIds.push(await uploadFile("public/references/flow/package/flosuni-package.png"));
  fileIds.push(await uploadFile("public/references/flow/package/pengflow-package.png"));

  const chatId = await createChat("[FLOKI FRIENDS 통합 캐릭터 시트]");

  await generate(chatId, `첨부한 5장의 이미지는 각각 다른 캐릭터의 이모티콘 시트야. 각 이미지의 캐릭터 디자인(얼굴, 체형, 색상, 선 스타일, 비율)을 정확히 보존(preserve)하여 새로운 통합 캐릭터 소개 시트 1장을 만들어줘.

[각 이미지의 역할 — 반드시 캐릭터 외형을 정확히 복제]
- Image 1 (subject): "이초록" — 직장인 남자 사람 캐릭터. 이 이미지의 얼굴형, 머리 스타일, 오렌지 넥타이, 베이지 셔츠, 굵은 네이비 아웃라인 스타일을 정확히 유지.
- Image 2 (subject): "플로키" — 보라색 범고래 캐릭터. 이 이미지의 연보라색 둥근 몸, 흰 배, 뾰족 등지느러미, 큰 까만 눈을 정확히 유지.
- Image 3 (subject): "보라부키" — 바다거북 캐릭터. 이 이미지의 연두색 몸, 갈색 등껍질, 노란 배, 분홍 볼을 정확히 유지.
- Image 4 (subject): "플로수니" — 핑크색 범고래 캐릭터. 이 이미지의 핑크 몸, 하늘색 리본, 긴 속눈썹을 정확히 유지.
- Image 5 (subject): "펭플로" — 펭귄 캐릭터. 이 이미지의 흑백 몸, 주황 부리, 주황 발을 정확히 유지.

[생성할 이미지: 통합 캐릭터 소개 시트]
- 깨끗한 흰색 배경
- 상단 중앙: "FLOKI FRIENDS" 로고 (둥글고 귀여운 볼드 산세리프)
- 부제: "사무실 수조 속 바다 친구들"
- 5캐릭터가 나란히 서 있는 정면 단체 포즈:
  - 가운데: 이초록 (가장 크게)
  - 이초록 왼쪽: 플로키, 오른쪽: 플로수니
  - 양 끝: 보라부키(왼), 펭플로(오)
- 각 캐릭터 아래에 한글 이름 라벨
- 하단: "by flow.team"

[preserve — 변경 금지]
- 각 캐릭터의 외형, 색상, 비율, 선 스타일 전부 첨부 이미지와 동일하게
- 2D 플랫 일러스트 스타일 유지
- 굵은 아웃라인 유지

[change — 변경할 것]
- 포즈: 각 이모티콘의 개별 포즈 대신, 전원 정면을 보며 웃고 있는 단체 포즈로 변경
- 배경: 흰색 깨끗한 배경
- 구도: 캐릭터 소개 시트 형식

[비율] 가로 16:9
[품질] 고해상도, 프로페셔널 캐릭터 프로필 시트`, "floki-friends-character-sheet.png", fileIds);
}

main().catch(e => console.error(e));
