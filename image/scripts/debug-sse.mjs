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
    body: JSON.stringify({ title: "[SSE debug]", type: "general" }),
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

async function main() {
  await login();

  const fileIds = [];
  fileIds.push(await uploadFile("public/references/flow/package/floki-package.png"));
  fileIds.push(await uploadFile("public/references/flow/characters/leechorok/leechorok-overtime.png"));

  const chatId = await createChat();
  console.log("chatId:", chatId);

  const prompt = `첨부한 이미지들은 우리 회사 캐릭터 이모티콘이야. 이 캐릭터들의 디자인과 그림체를 참고해서 새로운 장면을 그려줘.

첫 번째 이미지는 "플로키" 보라색 범고래 캐릭터 이모티콘 모음이고, 두 번째 이미지는 "이초록" 직장인 남자 캐릭터야.

이 캐릭터들이 함께 사무실에서 야근하는 장면을 그려줘. 이초록은 책상에서 자고 있고, 플로키가 옆에서 담요를 덮어주고 있는 따뜻한 장면. 세로 3:4 비율.`;

  console.log("\n🔄 Agent 호출 중...\n");

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

  // SSE 전체 내용을 파일로 저장
  fs.writeFileSync("/tmp/sse-debug.txt", text);
  console.log(`📄 SSE 전체 응답 저장: /tmp/sse-debug.txt (${(text.length / 1024).toFixed(1)}KB)\n`);

  // 모든 URL 추출
  const allUrls = text.match(/https?:\/\/[^\s")\]\\]+/g) || [];
  console.log(`🔗 발견된 URL ${allUrls.length}개:`);
  allUrls.forEach((u, i) => {
    const isImage = /\.(png|jpg|jpeg|webp)/i.test(u);
    const isS3 = u.includes("s3.") || u.includes("amazonaws");
    const isLocal = u.includes("127.0.0.1") || u.includes("localhost");
    console.log(`  ${i}: ${isImage ? "🖼️" : "🔗"} ${isS3 ? "[S3]" : isLocal ? "[LOCAL]" : "[EXT]"} ${u.slice(0, 120)}`);
  });

  // "image" 관련 SSE 이벤트 찾기
  console.log("\n📨 이미지 관련 SSE 이벤트:");
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes("image") || line.includes("generated") || line.includes("file_url") || line.includes("storage")) {
      console.log(`  L${i}: ${line.slice(0, 200)}`);
    }
  }

  // data: 이벤트 중 JSON 파싱해서 이미지 관련 데이터 찾기
  console.log("\n📦 이미지 데이터가 포함된 SSE 메시지:");
  for (const line of lines) {
    if (!line.startsWith("data: ")) continue;
    try {
      const data = JSON.parse(line.slice(6));
      if (data.type === "image" || data.image || data.imageUrl || data.generatedImage || data.fileUrl || data.type === "tool_result") {
        console.log(`  ${JSON.stringify(data).slice(0, 300)}`);
      }
    } catch {}
  }
}

main().catch(e => console.error(e));
