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
  console.log("   ❌ 실패:", text.slice(-500));
  return false;
}

async function main() {
  await login();

  // 이초록 + 플로키 레퍼런스 업로드
  const refs = [
    "public/references/flow/package/floki-package.png",
    "public/references/flow/characters/leechorok/leechorok-overtime.png",
    "public/references/flow/characters/leechorok/leechorok-burnout.png",
  ];

  const chatId = await createChat("[EP.1 with refs natural]");
  const fileIds = [];
  for (const r of refs) {
    if (fs.existsSync(r)) fileIds.push(await uploadFile(r));
  }

  const prompt = `첨부한 이미지들은 우리 회사 캐릭터 이모티콘이야. 이 캐릭터들의 디자인과 그림체를 그대로 유지하면서, 아래 장면을 새로 그려줘.

첫 번째 이미지는 "플로키"라는 보라색 범고래 캐릭터의 이모티콘 모음이야.
두 번째, 세 번째 이미지는 "이초록"이라는 직장인 남자 캐릭터의 이모티콘이야.

이 두 캐릭터의 외형, 색상, 선 스타일, 비율을 정확히 유지해서 새로운 한 장의 포스터를 그려줘.

[그려야 할 장면]
웹툰 커버 포스터. 세로 3:4 비율.

밤 늦은 사무실에서 이초록이 책상에 엎드려 잠들어 있어.
책상 위에 서류더미, 모니터, 커피잔이 있고, 이초록 앞 노트에는 플로키 낙서가 그려져 있어.
이초록의 머리 위로 상상의 바다가 펼쳐지면서, 그 바다에서 플로키가 웃으며 헤엄치고 있어.
사무실 아래쪽은 어두운 톤, 위쪽 바다는 보라+블루 톤.

상단에 "FLOKI FRIENDS" 텍스트, 하단에 "EP.01 바다가 보여" 텍스트 넣어줘.`;

  await generate(chatId, prompt, "floki-friends-ep1-cover.png", fileIds);
}

main().catch(e => console.error(e));
