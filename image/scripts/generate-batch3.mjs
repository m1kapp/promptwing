import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, "../public");
const IMAGES_DIR = path.join(PUBLIC_DIR, "images");
const OPENAI_API_KEY = "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";
const MODEL = "gpt-image-2";
const ref = (p) => path.join(PUBLIC_DIR, p);

const prompts = [
  { id: "mv1", filename: "mv1-mvp-award.png", refImages: [ref("references/flow/logo/flow-logo-purple.png")],
    prompt: '첨부한 로고를 활용하여 분기 MVP 축하 포스터를 만들어줘.\n\n- 수상자: "김민수"\n- 소속: "개발팀"\n- 수상 사유: "Q2 핵심 프로젝트 리딩 및 팀 생산성 200% 향상"\n- 스타일: 프리미엄 어워드, 골드 악센트, 시상식 느낌\n- 컬러: 다크 네이비 + 골드 + 화이트\n- 중앙에 수상자 프로필 프레임 (원형)\n- 트로피/메달 아이콘 + 축하 이펙트\n- 상단에 "Q2 MVP" 크게\n- 하단에 첨부 로고\n- A3 세로' },
  { id: "ct1", filename: "ct1-certificate.png", refImages: [ref("references/flow/logo/flow-wordmark-purple.png")],
    prompt: '첨부한 워드마크를 활용하여 교육 수료증을 만들어줘.\n\n- 제목: "AI 활용 실무 교육 수료증"\n- 수여자: "이민호"\n- 내용: "위 사람은 AI 활용 실무 교육 과정을 성실히 이수하였기에 이 증서를 수여합니다"\n- 발급일: "2026년 7월 25일"\n- 발급기관: 하단에 첨부 워드마크 + "교육팀"\n- 스타일: 클래식 프리미엄, 금박 테두리, 세리프 타이포\n- 금박 보더, 월계수 리스, 엠보싱 씰 스탬프\n- 가로 A4' },
  { id: "cl1", filename: "cl1-club-emblem.png", refImages: [ref("references/flow/logo/flow-logo-purple.png")],
    prompt: '첨부한 로고 컬러를 참고하여 축구 동호회 엠블럼/로고를 만들어줘.\n\n- 동호회명: "FC flow"\n- 스타일: 유럽 축구 클럽 크레스트, 전통적 + 모던\n- 축구공 + 방패 + 별 + 설립연도 2020\n- 컬러: 퍼플 + 골드 + 화이트\n- 방패/크레스트 형태의 엠블럼\n- 유니폼 프린트 가능한 벡터 느낌\n- 정사각 포맷' },
  { id: "li1", filename: "li1-linkedin-cover.png", refImages: [ref("references/flow/logo/flow-wordmark-purple.png"), ref("references/flow/product/flow-desktop-projects.png")],
    prompt: '첨부한 워드마크와 제품 UI를 활용하여 기업 링크드인 페이지 커버 배너를 만들어줘. 가로 1584x396.\n\n- 메시지: "AI로 일하는 방식을 바꿉니다"\n- 스타일: 모던 코퍼레이트, 그라디언트 + 클린 타이포\n- 추상적 네트워크 그래픽 + 브랜드 퍼플 그라디언트\n- 좌측에 메시지 텍스트, 우측에 여백\n- 첨부 워드마크 포함' },
  { id: "es1", filename: "es1-email-sig.png", refImages: [ref("references/flow/logo/flow-logo-purple.png")],
    prompt: '첨부한 로고를 활용하여 이메일 시그니처 하단 프로모 배너를 만들어줘. 가로 600x100.\n\n- 메시지: "무료 웨비나: AI로 업무 시간 80% 절약하기"\n- CTA: "지금 등록 →"\n- 좌측에 아이콘, 중앙에 메시지, 우측에 CTA 버튼\n- 미니멀 플랫, 원라인 레이아웃\n- 화이트 배경 + 퍼플 CTA 버튼\n- 첨부 로고 작게 포함' },
  { id: "nl1", filename: "nl1-newsletter.png", refImages: [ref("references/flow/logo/flow-logo-purple.png")],
    prompt: '첨부한 로고를 활용하여 여름 테마 사내 뉴스레터 헤더 이미지를 만들어줘. 가로 600x200.\n\n- 뉴스레터명: "flow weekly"\n- 호수: "Vol.48 · 2026년 7월"\n- 해변, 야자수, 선글라스, 시원한 블루 톤\n- 밝고 활기찬, 계절감 있는 일러스트\n- 첨부 로고 포함\n- 이메일에서 잘 보이는 밝은 디자인' },
  { id: "pc1", filename: "pc1-podcast.png", refImages: [ref("references/flow/logo/flow-logo-purple.png")],
    prompt: '첨부한 로고를 활용하여 테크/비즈니스 팟캐스트 커버 아트를 만들어줘. 정사각 3000x3000.\n\n- 채널명: "flow cast"\n- 서브타이틀: "AI 시대의 일하는 법"\n- 모던 그래픽, 볼드 타이포, 다크 배경\n- 마이크 아이콘 + 음파 그래픽 + 퍼플 그라디언트\n- 작은 썸네일에서도 읽히는 디자인\n- 첨부 로고 포함' },
  { id: "bf1", filename: "bf1-promo-banner.png", refImages: [ref("references/flow/logo/flow-wordmark-purple.png")],
    prompt: '첨부한 워드마크를 활용하여 블랙프라이데이 프로모션 배너를 만들어줘. 가로 1200x628.\n\n- 헤드카피: "BLACK FRIDAY DEAL"\n- 할인 정보: "전 요금제 50% OFF"\n- 기간: "11.24 ~ 11.30 (7일간)"\n- CTA: "지금 바로 시작하기 →"\n- 블랙 + 골드 + 레드, 럭셔리 세일 느낌\n- 할인율이 크고 강렬하게\n- 첨부 워드마크 포함' },
  { id: "cp3", filename: "cp3-coupon.png", refImages: [ref("references/flow/logo/flow-logo-purple.png")],
    prompt: '첨부한 로고를 활용하여 사내 카페 음료 쿠폰/바우처를 만들어줘.\n\n- 혜택: "아메리카노 1잔 무료"\n- 유효기간: "2026.12.31까지"\n- 코드: "FLOW-2026-COFFEE"\n- 골드 포일 + 엠보싱, 프리미엄 바우처\n- 크림 + 골드 + 딥 퍼플\n- 점선 커팅 라인, QR코드 영역\n- 첨부 로고 포함\n- 가로 카드 비율' },
  { id: "tm1", filename: "tm1-testimonial.png", refImages: [ref("references/flow/logo/flow-logo-purple.png")],
    prompt: '첨부한 로고를 활용하여 고객 후기 테스티모니얼 카드를 만들어줘. 정사각 1:1.\n\n- 고객사: "ABC 테크놀로지"\n- 담당자: "박지영 팀장"\n- 후기: "flow 도입 후 팀 커뮤니케이션이 완전히 달라졌습니다. 회의 시간이 절반으로 줄었어요."\n- 효과: "업무 효율 47% 향상 · 회의 시간 50% 감소"\n- 클린 화이트 + 퍼플 포인트\n- 큰따옴표 인용문 느낌\n- 하단에 첨부 로고' },
  { id: "pz1", filename: "pz1-photozone.png", refImages: [ref("references/flow/logo/flow-logo-purple.png"), ref("references/flow/logo/flow-wordmark-purple.png")],
    prompt: '첨부한 로고와 워드마크를 활용하여 올핸즈 미팅 포토존 백드롭 디자인을 만들어줘.\n\n- 이벤트명: "flow ALL HANDS 2026 H2"\n- 프리미엄 미디어월, 은은한 로고 패턴\n- 딥 퍼플 + 핑크 그라디언트\n- 첨부 로고가 45도 각도로 반복 배치, 은은한 엠보싱\n- 사진 촬영 시 인물이 돋보이는 배경\n- 정사각 포맷' },
  { id: "wp1", filename: "wp1-wallpaper.png", refImages: [ref("references/flow/logo/flow-logo-purple.png")],
    prompt: '첨부한 로고를 활용하여 여름 테마 데스크톱 월페이퍼를 만들어줘. 가로 2560x1440.\n\n- 미니멀 그라디언트, 차분하고 세련된\n- 시원한 블루-퍼플 그라디언트 + 은은한 웨이브 패턴\n- 컬러: 쿨 블루 + 퍼플 + 민트\n- 중앙에 여백 (아이콘과 겹치지 않게)\n- 은은하게 첨부 로고 워터마크\n- 눈이 편안하고 오래 봐도 질리지 않는 디자인' },
  { id: "bx1", filename: "bx1-unboxing.png", refImages: [ref("references/flow/package/floki-package.png"), ref("references/flow/logo/flow-logo-purple.png")],
    prompt: '첨부한 마스코트와 로고를 활용하여 제품 배송 박스 언박싱 디자인을 만들어줘.\n\n- 메시지: "Welcome to flow! Your journey starts here."\n- 미니멀 프리미엄, 내부만 컬러풀\n- 외부 크래프트 + 내부 퍼플 그라디언트\n- 환영 메시지 + 첨부 캐릭터 + 브랜드 패턴\n- 개봉 순간의 설렘을 주는 디자인\n- 첨부 로고 자연스럽게 포함' },
  { id: "ar1", filename: "ar1-annual-report.png", refImages: [ref("references/flow/logo/flow-logo-purple.png"), ref("references/flow/logo/flow-wordmark-purple.png")],
    prompt: '첨부한 로고와 워드마크를 활용하여 flow 2025 연간 리포트 표지를 만들어줘. 세로 A4.\n\n- 타이틀: "Annual Report 2025"\n- 서브타이틀: "흐름을 만들다, 미래를 연결하다"\n- 프리미엄 코퍼레이트, 추상 아트 + 클린 타이포\n- 추상적 빛 흐름 + 네트워크 연결 그래픽\n- 컬러: 딥 퍼플 + 화이트 + 실버\n- 첨부 로고/워드마크 + 연도 크게\n- 인쇄 품질' },
  { id: "rn1", filename: "rn1-release-note.png", refImages: [ref("references/flow/logo/flow-logo-purple.png"), ref("references/flow/product/flow-task-list.png")],
    prompt: '첨부한 로고와 제품 UI를 활용하여 flow v2.5 릴리즈 노트 커버를 만들어줘. 가로 16:9.\n\n- 버전: "v2.5"\n- 하이라이트: "AI 대시보드 · 실시간 번역 · 다크모드"\n- 테크 프로덕트, 다크 배경 + 네온 악센트\n- 버전 넘버 3D 렌더 + 기능 아이콘 플로팅\n- 첨부 로고 포함' },
  { id: "og1", filename: "og1-onboarding-guide.png", refImages: [ref("references/flow/logo/flow-logo-purple.png"), ref("references/flow/characters/flosuni/flosuni-hi.png")],
    prompt: '첨부한 로고와 마스코트를 활용하여 flow 고객 온보딩 가이드 커버를 만들어줘. 세로 A4.\n\n- 타이틀: "flow 시작 가이드"\n- 서브타이틀: "5분이면 충분합니다"\n- 친근한 플랫 일러스트, 밝고 따뜻한\n- 사람들이 협업하는 일러스트 + 체크리스트 아이콘\n- 첨부 캐릭터가 안내하는 모습으로 배치\n- 첨부 로고 + 브랜드 컬러' },
  { id: "wf1", filename: "wf1-wifi-card.png", refImages: [ref("references/flow/logo/flow-logo-purple.png")],
    prompt: '첨부한 로고를 활용하여 사무실 방문객 WiFi 안내 카드를 만들어줘.\n\n- WiFi: "flow-guest"\n- 비밀번호: "welcome2flow!"\n- 추가 안내: "화장실: 복도 좌측 · 음료: 라운지 자유 이용"\n- 미니멀 모던, 다크 배경 + 화이트 텍스트\n- WiFi 아이콘 + QR코드\n- 첨부 로고 포함\n- 회의실 테이블 텐트 크기' },
  { id: "pk2", filename: "pk2-parking-sign.png", refImages: [ref("references/flow/logo/flow-logo-purple.png")],
    prompt: '첨부한 로고를 활용하여 주차장 B1 안내 사인을 만들어줘.\n\n- 층수: "B1" 초대형으로\n- 컬러코드: 블루\n- 대형 넘버, 산업적 모던, 고대비\n- 화살표로 출구/엘리베이터 방향\n- 차, 엘리베이터, 비상구 아이콘\n- 첨부 로고 작게 포함\n- 세로 사인 (60x90cm)\n- 어두운 주차장에서도 가독성 확보' },
  { id: "em1", filename: "em1-evacuation.png", refImages: [],
    prompt: '5층 비상 대피도를 만들어줘.\n\n- 평면도에 비상구 2곳, 소화기 4곳, 소화전 2곳, 대피 공간, 엘리베이터(사용금지 표시)\n- 대피 경로: 주 출입구 → 복도 → 비상계단 A (좌측) 또는 비상계단 B (우측)\n- "YOU ARE HERE" 현재 위치 표시\n- 비상구까지 녹색 화살표, 소화기 빨간색 아이콘\n- 국제 표준 픽토그램, 깔끔한 플랫 디자인, 고대비\n- 범례 포함\n- A3 가로' },
  { id: "cf1", filename: "cf1-cafe-menu.png", refImages: [ref("references/flow/logo/flow-logo-purple.png")],
    prompt: '첨부한 로고를 활용하여 사내 카페 메뉴보드를 만들어줘.\n\n- 카페명: "flow café"\n- 메뉴: 아메리카노 ₩2,000 / 카페라떼 ₩2,500 / 바닐라라떼 ₩3,000 / 녹차라떼 ₩3,000 / 카푸치노 ₩2,500\n- 시즌 메뉴: "☀️ 콜드브루 피치티 ₩3,500 · 망고 스무디 ₩3,500"\n- 칠판 스타일, 쵸크 레터링 + 손그림 일러스트\n- 다크 그린 + 화이트/옐로우 쵸크\n- 시즌 메뉴에 NEW 표시\n- 첨부 로고 포함\n- 세로 포맷' },
];

async function generateImage(item) {
  const hasRefs = item.refImages && item.refImages.length > 0;
  console.log(`\n🎨 [${item.id}] 생성 중... ${item.filename}${hasRefs ? ` (ref ${item.refImages.length})` : ""}`);
  if (hasRefs) {
    const fd = new FormData(); fd.append("model", MODEL); fd.append("prompt", item.prompt); fd.append("size", "1024x1536"); fd.append("quality", "high");
    for (const r of item.refImages) { if (!fs.existsSync(r)) continue; fd.append("image[]", new Blob([fs.readFileSync(r)], {type:"image/png"}), path.basename(r)); }
    const res = await fetch("https://api.openai.com/v1/images/edits", { method:"POST", headers:{Authorization:`Bearer ${OPENAI_API_KEY}`}, body:fd });
    if (!res.ok) { console.error(`   ❌ ${res.status}: ${(await res.text()).slice(0,200)}`); return false; }
    return save(await res.json(), item.filename);
  } else {
    const res = await fetch("https://api.openai.com/v1/images/generations", { method:"POST", headers:{"Content-Type":"application/json",Authorization:`Bearer ${OPENAI_API_KEY}`}, body:JSON.stringify({model:MODEL,prompt:item.prompt,n:1,size:"1024x1536",quality:"high"}) });
    if (!res.ok) { console.error(`   ❌ ${res.status}: ${(await res.text()).slice(0,200)}`); return false; }
    return save(await res.json(), item.filename);
  }
}
function save(data, fn) {
  const b = data.data?.[0]?.b64_json; if (b) { const buf=Buffer.from(b,"base64"); fs.writeFileSync(path.join(IMAGES_DIR,fn),buf); console.log(`   ✅ 저장: ${fn} (${(buf.length/1024).toFixed(0)}KB)`); return true; }
  const u = data.data?.[0]?.url; if (u) return fetch(u).then(r=>r.arrayBuffer()).then(buf=>{const b=Buffer.from(buf);fs.writeFileSync(path.join(IMAGES_DIR,fn),b);console.log(`   ✅ 저장: ${fn} (${(b.length/1024).toFixed(0)}KB)`);return true;});
  return false;
}
async function main() {
  const ids=process.argv.slice(2).filter(t=>t!=="--force"); const force=process.argv.includes("--force");
  const targets=ids.length>0?prompts.filter(p=>ids.includes(p.id)):prompts;
  console.log(`🪽 Batch 3: ${targets.length}개 (${MODEL})`);
  let ok=0,fail=0,skip=0;
  for (const item of targets) {
    if (!force&&fs.existsSync(path.join(IMAGES_DIR,item.filename))) { console.log(`⏭️ [${item.id}] skip`); skip++; continue; }
    try { if (await generateImage(item)) ok++; else fail++; } catch(e) { console.error(`   ❌ ${e.message}`); fail++; }
    await new Promise(r=>setTimeout(r,3000));
  }
  console.log(`\n📊 완료: 성공 ${ok} / 실패 ${fail} / 건너뜀 ${skip}`);
}
main().catch(console.error);
