#!/usr/bin/env node
/**
 * PromptWing E2E 이미지 생성기
 * ─────────────────────────────
 * prompts.ts를 직접 파싱하여 변수를 자동 치환하고,
 * referenceImages를 자동 매핑하여 flow-matex2 로컬 API를 통해 이미지를 생성합니다.
 *
 * 사전 조건:
 *   flow-matex2 API 서버가 127.0.0.1:3001 에서 실행 중이어야 합니다.
 *
 * 사용법:
 *   node scripts/generate-e2e.mjs                 # 이미지 없는 프롬프트만 생성
 *   node scripts/generate-e2e.mjs --force          # 전체 재생성
 *   node scripts/generate-e2e.mjs fmcg1 bento1     # 특정 ID만 생성
 *   node scripts/generate-e2e.mjs --dry-run         # 실제 API 호출 없이 미리보기
 *   node scripts/generate-e2e.mjs --list            # 생성 대상 목록만 출력
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, "../public");
// 브랜드별 폴더 (page.tsx에서 /images/${brandId}/ 로 참조)
const BRAND_ID = process.env.BRAND_ID || "flow";
const IMAGES_DIR = path.join(PUBLIC_DIR, "images", BRAND_ID);
const PROMPTS_FILE = path.join(__dirname, "../src/data/prompts.ts");

// flow-matex2 로컬 API
const API_BASE = process.env.API_BASE || "http://127.0.0.1:3001";
const IMAGE_MODEL = "gpt-image-2-plus";
const RATE_LIMIT_MS = 5000;
const BYPASS_USERNAME = process.env.BYPASS_USERNAME || "dellose-matex@yopmail.com";

// 세션 쿠키 (bypass 로그인으로 자동 획득)
let SESSION_COOKIE = process.env.SESSION_COOKIE || "";

// ══════════════════════════════════════════════════
// 1. prompts.ts 파싱
// ══════════════════════════════════════════════════

function parsePromptsFile() {
  const raw = fs.readFileSync(PROMPTS_FILE, "utf-8");
  const promptBlocks = [];
  const blockRegex = /\{\s*\n\s*id:\s*"([^"]+)"[\s\S]*?\n\s*\}/g;
  let match;

  while ((match = blockRegex.exec(raw)) !== null) {
    const block = match[0];
    const id = match[1];
    const title = extractString(block, "title");
    const imageUrl = extractString(block, "imageUrl");
    const prompt = extractString(block, "prompt");
    if (!id || !prompt) continue;

    const filename = imageUrl ? path.basename(imageUrl) : `${id}.png`;
    const refImages = extractReferenceImages(block);
    const defaults = extractDefaultVariables(block);

    promptBlocks.push({ id, title, filename, prompt, refImages, defaults });
  }
  return promptBlocks;
}

function extractString(block, key) {
  const regex = new RegExp(`${key}:\\s*"((?:[^"\\\\]|\\\\.)*)"`);
  const match = block.match(regex);
  if (match) {
    return match[1].replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  }
  return null;
}

function extractReferenceImages(block) {
  const refs = [];
  const refRegex = /url:\s*"([^"]+)".*?label:\s*"([^"]+)"/g;
  const refSection = block.match(/referenceImages:\s*\[([\s\S]*?)\]/);
  if (refSection) {
    let m;
    while ((m = refRegex.exec(refSection[1])) !== null) {
      refs.push({ url: m[1], label: m[2] });
    }
  }
  return refs;
}

function extractDefaultVariables(block) {
  const defaults = {};
  const varRegex = /key:\s*"([^"]+)",\s*default:\s*"((?:[^"\\]|\\.)*)"/g;
  let m;
  while ((m = varRegex.exec(block)) !== null) {
    defaults[m[1]] = m[2].replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  }
  return defaults;
}

function resolveTemplate(template, values) {
  return template.replace(/\{([^}]+)\}/g, (_, key) => values[key] ?? `{${key}}`);
}

// ══════════════════════════════════════════════════
// 2. flow-matex2 API 헬퍼
// ══════════════════════════════════════════════════

const headers = () => ({
  "Content-Type": "application/json",
  ...(SESSION_COOKIE ? { Cookie: SESSION_COOKIE } : {}),
});

/** 파일을 presigned URL로 업로드하고 fileId 반환 */
async function uploadFile(filePath) {
  const fileName = path.basename(filePath);
  const fileBuffer = fs.readFileSync(filePath);
  const fileSize = fileBuffer.length;
  const ext = path.extname(fileName).toLowerCase();
  const contentType = ext === ".png" ? "image/png" : ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "image/png";

  // 1) presigned URL 요청
  const urlRes = await fetch(`${API_BASE}/api/v1/file/upload-url`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ fileName, contentType, fileSize }),
  });

  if (!urlRes.ok) {
    const err = await urlRes.text();
    throw new Error(`파일 업로드 URL 요청 실패 (${urlRes.status}): ${err.slice(0, 200)}`);
  }

  const { uploadUrl, fileId, status } = await urlRes.json();
  if (status !== "success" || !uploadUrl) {
    throw new Error(`파일 업로드 URL 응답 비정상: ${JSON.stringify({ status, fileId })}`);
  }

  // 2) presigned URL에 파일 업로드
  const putRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: fileBuffer,
  });

  if (!putRes.ok) {
    throw new Error(`파일 업로드 실패 (${putRes.status})`);
  }

  console.log(`   📎 업로드: ${fileName} → fileId: ${fileId}`);
  return fileId;
}

/** SSE 스트림에서 생성된 이미지 URL 추출 */
function extractImageUrlFromSse(text) {
  // 1순위: "generated_image" 타입 SSE 이벤트에서 URL 추출
  for (const line of text.split("\n")) {
    if (!line.startsWith("data: ")) continue;
    try {
      const data = JSON.parse(line.slice(6));
      if (data.type === "generated_image" && data.imageData?.url) {
        return data.imageData.url;
      }
    } catch {}
  }

  // 2순위: "tool_result" 타입에서 URL 추출
  for (const line of text.split("\n")) {
    if (!line.startsWith("data: ")) continue;
    try {
      const data = JSON.parse(line.slice(6));
      if (data.type === "tool_result" && data.result?.url) {
        return data.result.url;
      }
    } catch {}
  }

  // 3순위: generated-images 경로가 포함된 URL 찾기
  const genMatch = text.match(/https?:\/\/[^\s"]+generated-images[^\s"]*/);
  if (genMatch) return genMatch[0];

  // 최후: 아무 이미지 URL
  const anyMatch = text.match(/https?:\/\/[^\s"]+\.(?:png|jpg|jpeg|webp)/i);
  return anyMatch?.[0] || null;
}

// ══════════════════════════════════════════════════
// 3. 이미지 생성 (flow-matex2 agent API)
// ══════════════════════════════════════════════════

/** 채팅방 생성 → conversationId 반환 */
async function createChatting() {
  const res = await fetch(`${API_BASE}/api/v1/chattings`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ title: `[PromptWing] ${new Date().toISOString()}`, type: "general" }),
  });
  if (!res.ok) {
    throw new Error(`채팅방 생성 실패 (${res.status}): ${await res.text()}`);
  }
  const data = await res.json();
  return data.chattingId;
}

async function generateImage(item) {
  const resolvedPrompt = resolveTemplate(item.prompt, item.defaults);

  // 레퍼런스 이미지 업로드
  const fileIds = [];
  for (const ref of item.refImages) {
    const refPath = path.join(PUBLIC_DIR, ref.url);
    if (!fs.existsSync(refPath)) {
      console.log(`   ⚠️  레퍼런스 없음: ${path.basename(refPath)}`);
      continue;
    }
    try {
      const fileId = await uploadFile(refPath);
      fileIds.push(fileId);
    } catch (err) {
      console.log(`   ⚠️  업로드 실패: ${err.message}`);
    }
  }

  console.log(
    `   🔄 Agent API 호출 중... (${resolvedPrompt.length}자, 파일 ${fileIds.length}개)`
  );

  // Agent API 호출 (SSE)
  // 매번 새 채팅방 생성 (e2e 방식)
  const conversationId = await createChatting();
  console.log(`   💬 채팅방 생성: #${conversationId}`);
  const body = {
    query: resolvedPrompt,
    conversationId,
    model: "gpt-5.1-none-reasoning",
    imageModel: IMAGE_MODEL,
    chatType: "general",
    isFirstMessage: true,
    forceOption: "imageGeneration",
    isSecurityMasking: false,
    ...(fileIds.length > 0 ? { fileIds } : {}),
  };

  const res = await fetch(`${API_BASE}/api/v1/agent`, {
    method: "POST",
    headers: {
      ...headers(),
      Accept: "text/event-stream",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`   ❌ 실패 (${res.status}): ${err.slice(0, 300)}`);
    return false;
  }

  // SSE 스트림 전체 읽기
  const sseText = await res.text();

  // 이미지 URL 추출
  const imageUrl = extractImageUrlFromSse(sseText);
  if (!imageUrl) {
    // 디버깅: SSE 응답 일부 출력
    console.error(`   ❌ 이미지 URL을 찾을 수 없음`);
    console.error(`   📄 SSE 응답 (마지막 500자): ${sseText.slice(-500)}`);
    return false;
  }

  // 이미지 다운로드 및 저장
  console.log(`   ⬇️  이미지 다운로드 중...`);
  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) {
    console.error(`   ❌ 이미지 다운로드 실패 (${imgRes.status})`);
    return false;
  }

  const buffer = Buffer.from(await imgRes.arrayBuffer());
  fs.writeFileSync(path.join(IMAGES_DIR, item.filename), buffer);
  console.log(`   ✅ 저장: ${item.filename} (${(buffer.length / 1024).toFixed(0)}KB)`);
  return true;
}

// ══════════════════════════════════════════════════
// 4. 메인 실행
// ══════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);
  const forceRegenerate = args.includes("--force");
  const dryRun = args.includes("--dry-run");
  const listOnly = args.includes("--list");
  const ids = args.filter((a) => !a.startsWith("--"));

  console.log("📖 prompts.ts 파싱 중...");
  const allPrompts = parsePromptsFile();
  console.log(`   총 ${allPrompts.length}개 프롬프트 발견\n`);

  let targets =
    ids.length > 0
      ? allPrompts.filter((p) => ids.includes(p.id))
      : allPrompts;

  if (!forceRegenerate && !listOnly) {
    targets = targets.filter((p) => {
      const exists = fs.existsSync(path.join(IMAGES_DIR, p.filename));
      if (exists) console.log(`⏭️  [${p.id}] 이미 존재 — 건너뜀`);
      return !exists;
    });
  }

  if (listOnly) {
    console.log(`\n📋 생성 대상 목록 (${targets.length}개):\n`);
    for (const t of targets) {
      const exists = fs.existsSync(path.join(IMAGES_DIR, t.filename));
      const refs = t.refImages.length;
      const vars = Object.keys(t.defaults).length;
      console.log(
        `  ${exists ? "✅" : "⬜"} [${t.id}] ${t.title || t.filename}` +
          ` — 레퍼런스 ${refs}개, 변수 ${vars}개`
      );
    }
    console.log(`\n  ⬜ = 이미지 없음 | ✅ = 이미지 있음`);
    return;
  }

  // API 서버 연결 + bypass 로그인
  if (!dryRun) {
    try {
      // 1) bypass 로그인으로 세션 쿠키 획득
      console.log(`🔑 로그인 중... (${BYPASS_USERNAME})`);
      const loginRes = await fetch(`${API_BASE}/api/v1/auth/dev/bypass-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: BYPASS_USERNAME }),
        redirect: "manual",
      });

      if (!loginRes.ok) {
        const err = await loginRes.text();
        console.error(`❌ bypass 로그인 실패 (${loginRes.status}): ${err.slice(0, 200)}`);
        console.error(`   → flow-matex2 API 서버가 실행 중인지 확인하세요`);
        process.exit(1);
      }

      // set-cookie 헤더에서 세션 쿠키 추출
      const setCookies = loginRes.headers.getSetCookie?.() || [];
      const sessionCookie = setCookies
        .map((c) => c.split(";")[0])
        .find((c) => c.startsWith("flowai_session="));
      if (sessionCookie) {
        SESSION_COOKIE = sessionCookie;
      }

      const loginData = await loginRes.json();
      console.log(`✅ 로그인 성공: ${loginData.username} (userId: ${loginData.userId})`);
    } catch (err) {
      console.error(`❌ flow-matex2 API 서버(${API_BASE})에 연결할 수 없습니다.`);
      console.error(`   → flow-matex2 API를 먼저 실행하세요`);
      process.exit(1);
    }
  }

  console.log(`\n🪽 PromptWing E2E 이미지 생성기 (flow-matex2 Agent API)`);
  console.log(`   API: ${API_BASE}`);
  console.log(`   이미지 모델: ${IMAGE_MODEL}`);
  console.log(`   대상: ${targets.length}개`);
  console.log(`   강제 재생성: ${forceRegenerate}`);
  console.log(`   드라이런: ${dryRun}`);

  if (targets.length === 0) {
    console.log("\n✨ 모든 이미지가 이미 존재합니다!");
    return;
  }

  let success = 0;
  let fail = 0;

  for (const item of targets) {
    if (dryRun) {
      const resolved = resolveTemplate(item.prompt, item.defaults);
      console.log(`\n🔍 [${item.id}] ${item.title}`);
      console.log(`   파일: ${item.filename}`);
      console.log(`   레퍼런스: ${item.refImages.map((r) => r.label).join(", ") || "없음"}`);
      console.log(`   변수: ${JSON.stringify(item.defaults).slice(0, 200)}...`);
      console.log(`   프롬프트 (${resolved.length}자): ${resolved.slice(0, 150)}...`);
      success++;
      continue;
    }

    console.log(`\n🎨 [${item.id}] ${item.title || item.filename}`);

    try {
      if (await generateImage(item)) success++;
      else fail++;
    } catch (err) {
      console.error(`   ❌ 에러: ${err.message}`);
      fail++;
    }

    await new Promise((r) => setTimeout(r, RATE_LIMIT_MS));
  }

  console.log(
    `\n📊 완료: ${dryRun ? "드라이런 " : ""}성공 ${success} / 실패 ${fail}`
  );
}

main().catch(console.error);
