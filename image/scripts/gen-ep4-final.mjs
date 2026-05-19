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
  console.log(`📎 ${fileName} -> ${fileId}`);
  return fileId;
}

async function main() {
  await login();
  const fid = await uploadFile("public/images/flow/floki-friends/floki-friends-character-sheet.png");
  const cid = await createChat("[EP.4 final]");

  const prompt = `첨부한 이미지는 FLOKI FRIENDS 캐릭터 시트야. 이 캐릭터들의 디자인을 정확히 참고해서 4컷 만화를 그려줘.

[preserve] 캐릭터 시트의 모든 캐릭터 외형 유지. 2D 플랫 일러스트. 굵은 아웃라인. 이초록은 반드시 짧은 검은 머리 성인 남자.

[4컷 만화 — 정사각형 2x2 그리드]

제목: "포커페이스"

1컷(좌상): 사무실 복도. 팀장님(통통한 체형, 짧은 다리, 검은 정장)이 뒤뚱뒤뚱 걸어가는 뒷모습. 걸음걸이가 딱 펭귄처럼. 이초록(오렌지 넥타이)이 뒤에서 보고 있음.
이초록 생각 구름: "팀장님 걸음걸이... 왜 이렇게 펭귄 같지..."

2컷(우상): 회의 끝. 팀장님(같은 통통 남자, 검은 정장)이 돌아서며 말함. 팀장님 옆으로 펭귄 실루엣이 반투명하게 겹침. 이초록 놀란 표정.
팀장님 말풍선: "오늘 월급날이니까 고기 먹으러 가자!"

3컷(좌하): 비 오는 밤 술집. 이초록(오렌지 넥타이)과 팀장님(검은 정장, 통통) 나란히 소주. 창밖 비.
팀장님 말풍선: "이초록 씨... 나도 힘들 때 있어요."

4컷(우하): 위에서 내려다보는 시점. 이초록의 손과 노트만 보임. 노트에 엄지척하며 우는 펭귄 그림. 옆에 메모: "겉은 턱시도, 속은 눈물"

정사각형 1:1. 2x2 그리드.
팀장님 체형 핵심: 통통+짧은 다리+뒤뚱걸음 = 펭귄 연상.
4컷 모두 이초록은 사람(오렌지 넥타이), 팀장님도 사람(검은 정장). 펭귄은 노트 안에만.`;

  console.log("🎨 EP.04 생성 중...");

  const res = await fetch(`${API}/api/v1/agent`, {
    method: "POST",
    signal: AbortSignal.timeout(300000),
    headers: { "Content-Type": "application/json", Cookie: cookie, Accept: "text/event-stream" },
    body: JSON.stringify({
      query: prompt,
      conversationId: cid,
      model: "gpt-5.1-none-reasoning",
      imageModel: "gpt-image-2-plus",
      chatType: "general",
      isFirstMessage: true,
      forceOption: "imageGeneration",
      isSecurityMasking: false,
      fileIds: [fid],
    }),
  });

  const text = await res.text();
  for (const line of text.split("\n")) {
    if (!line.startsWith("data: ")) continue;
    try {
      const d = JSON.parse(line.slice(6));
      if (d.type === "generated_image" && d.imageData?.url) {
        const ir = await fetch(d.imageData.url);
        const buf = Buffer.from(await ir.arrayBuffer());
        fs.writeFileSync("public/images/flow/floki-friends/floki-friends-ep4-comic.png", buf);
        console.log(`✅ ep4 saved (${Math.round(buf.length / 1024)}KB)`);
        return;
      }
    } catch {}
  }
  console.log("❌ failed:", text.slice(-400));
}

main().catch(e => console.error(e.message));
