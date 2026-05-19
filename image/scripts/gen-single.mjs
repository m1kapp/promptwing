import fs from "fs";
const API = "http://127.0.0.1:3001";
let cookie = "";

const PROMPT_ID = process.argv[2];
if (!PROMPT_ID) { console.error("Usage: node gen-single.mjs <promptId>"); process.exit(1); }

async function login() {
  const res = await fetch(`${API}/api/v1/auth/dev/bypass-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "dellose-matex@yopmail.com" }),
  });
  cookie = (res.headers.getSetCookie?.() || []).map(c => c.split(";")[0]).find(c => c.startsWith("flowai_session=")) || "";
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

// Parse prompts.ts to find the target prompt
function parsePrompt() {
  const src = fs.readFileSync("src/data/prompts.ts", "utf-8");
  // Find the prompt block by id
  const regex = new RegExp(`id: "${PROMPT_ID}"[\\s\\S]*?(?=\\n  \\{\\n    id: "|\\n\\];)`, "m");
  const match = src.match(regex);
  if (!match) { console.error(`Prompt "${PROMPT_ID}" not found`); process.exit(1); }
  const block = match[0];

  // Extract title
  const titleMatch = block.match(/title: "([^"]+)"/);
  const title = titleMatch ? titleMatch[1] : PROMPT_ID;

  // Extract imageUrl
  const imgMatch = block.match(/imageUrl: "([^"]+)"/);
  const imageUrl = imgMatch ? imgMatch[1] : null;

  // Extract prompt
  const promptMatch = block.match(/prompt: ["`]([^`]*)["`]/s) || block.match(/prompt:\s*"((?:[^"\\]|\\.)*)"/s);
  let prompt = "";
  if (promptMatch) {
    prompt = promptMatch[1].replace(/\\n/g, "\n").replace(/\\"/g, '"');
  }

  // Extract variables with defaults
  const varRegex = /key: "([^"]+)", default: "([^"]+)"/g;
  let varMatch;
  while ((varMatch = varRegex.exec(block)) !== null) {
    const [, key, defaultVal] = varMatch;
    prompt = prompt.replaceAll(`{${key}}`, defaultVal);
  }

  // Extract referenceImages
  const refImages = [];
  const refRegex = /url: "([^"]+)", label: "([^"]+)"/g;
  // Only from referenceImages section
  const refSection = block.match(/referenceImages: \[([^\]]*)\]/s);
  if (refSection) {
    let refMatch;
    while ((refMatch = refRegex.exec(refSection[1])) !== null) {
      refImages.push({ url: refMatch[1], label: refMatch[2] });
    }
  }

  return { title, imageUrl, prompt, refImages };
}

async function main() {
  await login();
  const { title, imageUrl, prompt, refImages } = parsePrompt();

  console.log(`📋 ${PROMPT_ID}: ${title}`);
  console.log(`📁 Output: public${imageUrl}`);
  if (refImages.length) console.log(`📎 References: ${refImages.map(r => r.label).join(", ")}`);

  // Upload reference images
  const fileIds = [];
  for (const ref of refImages) {
    const filePath = `public${ref.url}`;
    if (fs.existsSync(filePath)) {
      const fid = await uploadFile(filePath);
      console.log(`   📎 ${ref.label} -> ${fid}`);
      fileIds.push(fid);
    } else {
      console.log(`   ⚠️ ${filePath} not found, skipping`);
    }
  }

  const chatId = await createChat(`[${PROMPT_ID}] ${title}`);
  console.log(`\n🎨 생성 중...`);

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
    const outPath = `public${imageUrl}`;
    fs.writeFileSync(outPath, buf);
    console.log(`✅ ${outPath} (${(buf.length / 1024).toFixed(0)}KB)`);
  } else {
    console.log("❌:", text.slice(-300));
  }
}

main().catch(e => console.error(e.message));
