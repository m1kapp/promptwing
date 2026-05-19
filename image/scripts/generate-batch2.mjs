import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, "../public");
const IMAGES_DIR = path.join(PUBLIC_DIR, "images");

const OPENAI_API_KEY =
  "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";
const MODEL = "gpt-image-2";
const ref = (p) => path.join(PUBLIC_DIR, p);

const prompts = [
  { id: "cn1", filename: "cn1-card-news.png", refImages: [ref("references/flow/logo/flow-logo-purple.png")],
    prompt: '첨부한 로고를 활용하여 AI 회의록 자동 요약 기능을 소개하는 인스타그램 카드뉴스 커버 이미지를 만들어줘. 정사각 1:1.\n\n- 헤드카피: "회의록, 아직도 직접 쓰세요?"\n- 서브카피: "AI가 3초 만에 정리해드립니다"\n- 스타일: 모던 플랫, 깔끔한 그리드\n- 컬러: 퍼플 그라디언트 + 화이트 (첨부 로고 컬러 참조)\n- 정보를 시각적으로 전달하는 아이콘/일러스트 포함\n- 텍스트가 선명하고 읽기 쉽게\n- 하단에 첨부 로고 작게 배치' },
  { id: "yt1", filename: "yt1-thumbnail.png", refImages: [ref("references/flow/logo/flow-logo-purple.png")],
    prompt: '협업툴 생산성 팁 유튜브 썸네일을 만들어줘. 16:9 비율 (1280x720).\n\n- 헤드카피: "이거 모르면 야근 확정"\n- 스타일: 볼드 타이포 + 비비드 컬러, 유튜브 트렌드\n- 노트북 화면에 UI가 보이는 목업 + 화살표/강조 그래픽\n- 텍스트는 크고 굵게, 3초 안에 내용 파악 가능\n- 고대비 컬러로 피드에서 눈에 띄게\n- 우측 하단에 첨부 로고 작게' },
  { id: "as1", filename: "as1-appstore.png", refImages: [ref("references/flow/product/flow-desktop-projects.png"), ref("references/flow/logo/flow-logo-purple.png")],
    prompt: '첨부한 제품 UI 스크린샷과 로고를 활용하여 flow 앱스토어 프로모 이미지를 만들어줘. 세로 비율.\n\n- 핵심 기능: "팀 프로젝트를 한눈에 관리하세요"\n- 스타일: Apple 스타일 클린 프로덕트 샷\n- 스마트폰 디바이스 목업 안에 첨부 UI 화면 표시\n- 기능 설명 텍스트를 깔끔하게 배치\n- 배경: 퍼플에서 핑크 소프트 그라디언트\n- 프리미엄 느낌, 브랜드 컬러 일관성' },
  { id: "tz1", filename: "tz1-teaser.png", refImages: [ref("references/flow/logo/flow-ai-gradient.png")],
    prompt: '첨부한 AI 로고를 활용하여 flow AI 2.0 신제품 티저 이미지를 만들어줘.\n\n- 텍스트: "COMING SOON"\n- 날짜: "2026.07.01"\n- 스타일: 다크 시네마틱, 미스터리한 분위기\n- 제품 실루엣만 살짝 보이게 — 궁금증 유발\n- 빛 입자, 렌즈 플레어, 깊은 그림자\n- 미니멀하되 강렬한 임팩트\n- 하단에 첨부 로고' },
  { id: "ny1", filename: "ny1-yearend-party.png", refImages: [ref("references/flow/logo/flow-wordmark-purple.png")],
    prompt: '첨부한 워드마크를 활용하여 송년회 초대장을 만들어줘.\n\n- 행사명: "2026 flow 송년의 밤"\n- 일시: "2026년 12월 19일 (금) 18:30"\n- 장소: "플로우그라운드 5층 라운지"\n- 스타일: 골드 & 네이비, 럭셔리 호텔 초대장 느낌\n- 컬러: 딥 네이비 + 골드 + 화이트\n- 샴페인 글래스, 별, 골드 리본 장식\n- 중앙에 행사명 크게, 하단에 일시/장소\n- 첨부 워드마크 배치\n- 세로 카드 비율' },
  { id: "sp4", filename: "sp4-sports-day.png", refImages: [ref("references/flow/characters/floki/floki-party.png"), ref("references/flow/logo/flow-logo-purple.png")],
    prompt: '첨부한 마스코트와 로고를 활용하여 사내 체육대회 포스터를 만들어줘.\n\n- 행사명: "2026 flow 한마음 체육대회"\n- 일시: "2026년 10월 17일 (토) 09:00~17:00"\n- 장소: "서울 올림픽공원"\n- 스타일: 스포츠 그래픽, 다이나믹 각도, 볼드 타이포\n- 트로피, 메달, 달리는 실루엣, 스피드 라인\n- 첨부한 캐릭터가 달리는 포즈로 중앙에 배치\n- 하단에 참가 신청 안내 + 첨부 로고\n- A3 세로' },
  { id: "ws1", filename: "ws1-workshop.png", refImages: [ref("references/flow/logo/flow-logo-purple.png")],
    prompt: '첨부한 로고를 활용하여 기술 세미나 초대장을 만들어줘.\n\n- 행사명: "flow Tech Talk #12: AI 시대의 백엔드 아키텍처"\n- 연사: "김민수 CTO · flow.team"\n- 일시: "2026년 7월 10일 (목) 15:00~17:00"\n- 장소: "5층 세미나룸 + 온라인 동시 진행"\n- 스타일: 모던 테크 컨퍼런스, 다크 배경 + 퍼플 그라디언트 악센트\n- 연사 프로필 영역 (이름, 소속, 주제)\n- 하단에 첨부 로고\n- 세로 카드 포맷' },
  { id: "csr1", filename: "csr1-volunteer.png", refImages: [ref("references/flow/characters/flosuni/flosuni-cheer.png")],
    prompt: '첨부한 캐릭터를 활용하여 환경 정화 봉사활동 참여 모집 포스터를 만들어줘.\n\n- 타이틀: "함께 걸으며 줍는 플로깅 DAY"\n- 일시: "2026년 9월 20일 (토) 09:00~12:00"\n- 장소: "한강 여의도공원 일대"\n- 스타일: 따뜻한 일러스트, 자연 친화적 컬러\n- 나무, 지구, 손잡은 사람들 실루엣, 초록 톤\n- 첨부 캐릭터가 응원하는 모습으로 배치\n- 하단에 참여 방법/신청 안내\n- A3 세로' },
  { id: "wb1", filename: "wb1-webinar.png", refImages: [ref("references/flow/logo/flow-logo-purple.png"), ref("references/flow/logo/flow-wordmark-purple.png")],
    prompt: '첨부한 로고와 워드마크를 활용하여 AI 업무 자동화 웨비나 초대 배너를 만들어줘. 가로 1200x628.\n\n- 타이틀: "AI로 반복 업무 80% 줄이는 법"\n- 연사: "이민호 CPO · flow.team"\n- 일시: "2026년 8월 14일 (목) 14:00 KST"\n- CTA: "무료 등록하기 →"\n- 스타일: 프리미엄 테크, 다크 배경 + 퍼플 그라디언트\n- 연사 프로필 영역 (원형 프레임)\n- 하단에 첨부 로고/워드마크 + URL 영역' },
  { id: "thx1", filename: "thx1-thankyou.png", refImages: [ref("references/flow/logo/flow-wordmark-purple.png")],
    prompt: '첨부한 워드마크를 활용하여 VIP 고객 감사 카드를 만들어줘.\n\n- 인사말: "소중한 파트너십에 깊이 감사드립니다"\n- 스타일: 골드 포일 + 엠보싱 느낌, 럭셔리 카드\n- 컬러: 아이보리 + 골드 + 딥 그린\n- 금박 테두리, 엠보싱 텍스처, 미니멀 플로럴\n- 하단에 첨부 워드마크 + 서명 영역\n- 세로 카드 비율, 인쇄 품질' },
  { id: "br1", filename: "br1-brochure.png", refImages: [ref("references/flow/logo/flow-logo-purple.png"), ref("references/flow/logo/flow-wordmark-purple.png")],
    prompt: '첨부한 로고와 워드마크를 활용하여 협업 솔루션 도입 제안서 표지를 만들어줘. 가로 16:9.\n\n- 타이틀: "flow 협업 솔루션 도입 제안서"\n- 서브타이틀: "AI 기반 업무 효율화로 팀 생산성을 혁신합니다"\n- 제출처: "OO기업 경영지원본부"\n- 제출일: "2026년 7월"\n- 스타일: 프리미엄 코퍼레이트, 추상 그래픽 + 클린 타이포\n- 컬러: 딥 퍼플 + 화이트 + 라이트 그레이\n- 하단에 첨부 로고/워드마크' },
  { id: "pk1", filename: "pk1-package-label.png", refImages: [ref("references/flow/logo/flow-logo-purple.png")],
    prompt: '첨부한 로고를 활용하여 프리미엄 음료 보틀 패키지 라벨 디자인 목업을 만들어줘.\n\n- 제품명: "flow ENERGY"\n- 스타일: 미니멀 프리미엄, 여백 활용, 고급 타이포\n- 컬러: 매트 블랙 + 골드 레터링\n- 첨부 로고를 엠보싱 처리, 금박 포인트, 매트 코팅 질감\n- 라벨이 보틀에 부착된 포토리얼 목업\n- 바코드/성분표 영역 포함\n- 프리미엄 제품 촬영 느낌' },
  { id: "st1", filename: "st1-sticker-sheet.png", refImages: [ref("references/flow/package/floki-package.png")],
    prompt: '첨부한 마스코트 캐릭터를 활용하여 귀여운 치비 캐릭터 이모지 스티커 시트를 만들어줘.\n\n- 시트에 9개 스티커 배치\n- 감정/상황: 기쁨, 슬픔, 화남, 졸림, 사랑, 놀람, 열정, 피곤, 축하\n- 각 스티커는 다이컷(윤곽 커팅) 느낌\n- 흰색 테두리 + 약간의 드롭 섀도우\n- 배경: 라이트 그레이 격자 패턴 (투명 표현)\n- 귀엽고 표현력 풍부한 이모지 스타일\n- 정사각 시트 포맷' },
  { id: "mn1", filename: "mn1-cafeteria-menu.png", refImages: [ref("references/flow/logo/flow-logo-purple.png")],
    prompt: '첨부한 로고를 활용하여 사내식당 이번 주 메뉴판을 만들어줘. 가로 A4.\n\n- 메뉴: 월: 김치찌개+돈까스 / 화: 된장찌개+불고기 / 수: 짜장면+탕수육 / 목: 순두부찌개+제육볶음 / 금: 칼국수+모듬튀김\n- 스타일: 따뜻한 일러스트, 손그림 느낌, 식욕을 자극하는\n- 컬러: 크림 베이스 + 오렌지/그린 포인트\n- 요일별로 깔끔하게 구분, 각 메뉴 옆에 음식 아이콘\n- 상단에 "flow 구내식당" + 기간 + 첨부 로고\n- 하단에 영양정보/알레르기 안내 영역' },
  { id: "ob1", filename: "ob1-welcome-card.png", refImages: [ref("references/flow/logo/flow-wordmark-purple.png"), ref("references/flow/characters/floki/floki-hi.png")],
    prompt: '첨부한 워드마크와 마스코트를 활용하여 신입사원 온보딩 웰컴 카드를 만들어줘.\n\n- 메인 메시지: "Welcome to flow! 함께 성장할 여정을 시작합니다"\n- 스타일: 모던 일러스트, 밝고 활기찬\n- 컬러: 화이트 + 퍼플 그라디언트 + 옐로우 포인트\n- 별, 하트, 로켓, 환영 깃발 장식\n- 첨부 캐릭터가 환영하는 모습으로 배치\n- 첨부 워드마크 포함\n- 정사각 카드 포맷' },
  { id: "mg1", filename: "mg1-magazine-cover.png", refImages: [ref("references/flow/logo/flow-wordmark-purple.png")],
    prompt: '첨부한 워드마크를 활용하여 사내 매거진(사보) 여름호 표지를 만들어줘.\n\n- 매거진명: "flow magazine"\n- 커버 스토리: "AI 시대, 우리의 일하는 방식이 바뀌다"\n- 호수: "Vol.24 · 2026 Summer"\n- 스타일: 모던 에디토리얼, Vogue/Monocle 감성\n- 비주얼: 추상적 AI 그래픽 + 사람 실루엣, 미래 감성\n- 에디토리얼 매거진 레이아웃 — 마스트헤드 + 커버라인\n- 세로 A4 비율, 고급 인쇄 품질\n- 첨부 워드마크 배치' },
  { id: "ppt1", filename: "ppt1-presentation.png", refImages: [ref("references/flow/logo/flow-logo-purple.png")],
    prompt: '첨부한 로고를 활용하여 분기 실적 발표 프레젠테이션 커버 슬라이드를 만들어줘. 가로 16:9.\n\n- 타이틀: "Q2 2026 Business Review"\n- 서브타이틀: "성장의 흐름을 이어가다"\n- 발표자: "전략기획팀"\n- 날짜: "2026.07.15"\n- 스타일: 다크 시네마틱, 프리미엄 기업 발표\n- 비주얼: 추상적 빛 줄기 + 기하학 패턴, 깊이감\n- 첨부 로고 배치\n- 시네마틱하고 프로페셔널한 첫 인상' },
  { id: "ny2", filename: "ny2-newyear.png", refImages: [ref("references/flow/logo/flow-wordmark-purple.png")],
    prompt: '첨부한 워드마크를 활용하여 한국 스타일의 2027 새해 인사 카드를 만들어줘.\n\n- 인사말: "새해 복 많이 받으세요"\n- 스타일: 전통+현대 퓨전, 고급스러운\n- 비주얼: 일출, 소나무, 학, 전통 문양\n- 컬러: 레드 + 골드 + 크림\n- 새해의 희망과 감사가 느껴지는 디자인\n- 하단에 첨부 워드마크\n- 세로 카드 비율' },
  { id: "ps1", filename: "ps1-popup-store.png", refImages: [ref("references/flow/logo/flow-logo-purple.png"), ref("references/flow/logo/flow-wordmark-purple.png")],
    prompt: '첨부한 로고와 워드마크를 활용하여 팝업스토어 포스터를 만들어줘.\n\n- 이벤트명: "flow POP-UP: Work, Play, Create"\n- 기간: "2026.09.01 ~ 09.14"\n- 장소: "서울 성수동 어반소스"\n- 스타일: 트렌디 그래픽, 성수동 감성, 대비 강한 타이포\n- 3D 오브제 + 브랜드 컬러 그라디언트 + 볼드 타이포\n- 이벤트명이 압도적으로 크게\n- 하단에 기간/장소 + 첨부 로고\n- A2 세로' },
  { id: "bc1", filename: "bc1-business-card.png", refImages: [ref("references/flow/logo/flow-logo-purple.png"), ref("references/flow/logo/flow-wordmark-purple.png")],
    prompt: '첨부한 로고와 워드마크를 활용하여 Product Manager 명함을 만들어줘. 가로 90x50mm 양면 목업.\n\n- 이름: "이민호"\n- 직함: "Product Manager · flow.team"\n- 연락처: "minho@flow.team · +82 10-1234-5678"\n- 스타일: 미니멀 모던, 여백 활용, 프리미엄\n- 컬러: 화이트 + 퍼플 포인트 + 라이트 그레이\n- 앞면: 이름 + 직함 + 첨부 로고\n- 뒷면: 연락처 + 주소 + QR코드\n- 두꺼운 코튼지, 매트 코팅, 엠보싱 로고 질감\n- 포토리얼 목업' },
];

async function generateImage(item) {
  const hasRefs = item.refImages && item.refImages.length > 0;
  console.log(`\n🎨 [${item.id}] 생성 중... ${item.filename}${hasRefs ? ` (레퍼런스 ${item.refImages.length}개)` : ""}`);

  if (hasRefs) {
    const formData = new FormData();
    formData.append("model", MODEL);
    formData.append("prompt", item.prompt);
    formData.append("size", "1024x1536");
    formData.append("quality", "high");
    for (const refPath of item.refImages) {
      if (!fs.existsSync(refPath)) { console.log(`   ⚠️ 없음: ${path.basename(refPath)}`); continue; }
      formData.append("image[]", new Blob([fs.readFileSync(refPath)], { type: "image/png" }), path.basename(refPath));
    }
    const res = await fetch("https://api.openai.com/v1/images/edits", { method: "POST", headers: { Authorization: `Bearer ${OPENAI_API_KEY}` }, body: formData });
    if (!res.ok) { console.error(`   ❌ ${res.status}: ${(await res.text()).slice(0, 200)}`); return false; }
    return saveImage(await res.json(), item.filename);
  } else {
    const res = await fetch("https://api.openai.com/v1/images/generations", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_API_KEY}` }, body: JSON.stringify({ model: MODEL, prompt: item.prompt, n: 1, size: "1024x1536", quality: "high" }) });
    if (!res.ok) { console.error(`   ❌ ${res.status}: ${(await res.text()).slice(0, 200)}`); return false; }
    return saveImage(await res.json(), item.filename);
  }
}

function saveImage(data, filename) {
  const b64 = data.data?.[0]?.b64_json;
  if (b64) { const buf = Buffer.from(b64, "base64"); fs.writeFileSync(path.join(IMAGES_DIR, filename), buf); console.log(`   ✅ 저장: ${filename} (${(buf.length/1024).toFixed(0)}KB)`); return true; }
  const url = data.data?.[0]?.url;
  if (url) return fetch(url).then(r=>r.arrayBuffer()).then(buf=>{ const b=Buffer.from(buf); fs.writeFileSync(path.join(IMAGES_DIR, filename), b); console.log(`   ✅ 저장: ${filename} (${(b.length/1024).toFixed(0)}KB)`); return true; });
  console.error(`   ❌ 이미지 데이터 없음`); return false;
}

async function main() {
  const ids = process.argv.slice(2).filter(t => t !== "--force");
  const force = process.argv.includes("--force");
  const targets = ids.length > 0 ? prompts.filter(p => ids.includes(p.id)) : prompts;
  console.log(`🪽 Batch 2: ${targets.length}개 이미지 생성 (모델: ${MODEL})`);
  let ok=0, fail=0, skip=0;
  for (const item of targets) {
    if (!force && fs.existsSync(path.join(IMAGES_DIR, item.filename))) { console.log(`⏭️ [${item.id}] 건너뜀`); skip++; continue; }
    try { if (await generateImage(item)) ok++; else fail++; } catch(e) { console.error(`   ❌ ${e.message}`); fail++; }
    await new Promise(r => setTimeout(r, 3000));
  }
  console.log(`\n📊 완료: 성공 ${ok} / 실패 ${fail} / 건너뜀 ${skip}`);
}
main().catch(console.error);
