import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, "../public");
const IMAGES_DIR = path.join(PUBLIC_DIR, "images/hkinno-n");
const OPENAI_API_KEY = "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";
const MODEL = "gpt-image-2";

const R = {
  logo: path.join(PUBLIC_DIR, "references/hkinno-n/logo/hkinnon-logo.png"),
  condLogo: path.join(PUBLIC_DIR, "references/hkinno-n/condition/logo.png"),
  condBottle: path.join(PUBLIC_DIR, "references/hkinno-n/products/condition.png"),
  bewantsLogo: path.join(PUBLIC_DIR, "references/hkinno-n/bewants/logo.png"),
  bewantsCream: path.join(PUBLIC_DIR, "references/hkinno-n/bewants/lifting-cream.png"),
  hutgaesoo: path.join(PUBLIC_DIR, "references/hkinno-n/products/hutgaesoo.png"),
  haewon: path.join(PUBLIC_DIR, "references/hkinno-n/people/haewon-profile.png"),
  johancheol: path.join(PUBLIC_DIR, "references/hkinno-n/people/johancheol-condition.png"),
  mainVisual: path.join(PUBLIC_DIR, "references/hkinno-n/condition/main-visual.png"),
};

const prompts = [
  // ===== 마스코트/로고 활용 (HK이노엔 버전) =====
  { id: "p1", filename: "flow-summit-poster-final.png",
    refImages: [R.condLogo, R.condBottle],
    prompt: '첨부한 컨디션 로고와 제품을 활용하여 흑백 잉크 스타일 이벤트 포스터를 만들어줘. 세로 A3 비율.\n\n- 상단에 "CONDITION SUMMIT 2026"을 매우 굵은 압축 고딕 산세리프로 크게 배치\n- 중앙에 첨부 제품을 bold Japanese ink brush style로 재해석하여 그려줘\n- 배경에 세 개의 원이 대각선으로 배치된 모티프\n- 하단에 "서울시 강남구 테헤란로" / "2026.06.25" / "13:00~18:00"\n- black and white, pure solid black ink on white paper only\n- 인쇄 품질, 갤러리급 그래픽 디자인' },

  { id: "p6", filename: "flow-prompthon-poster.png",
    refImages: [R.condLogo, R.condBottle],
    prompt: '첨부한 로고와 제품 이미지를 활용하여 1970s 빈티지 모터스포츠 포스터 스타일의 이벤트 포스터를 만들어줘.\n\n- 에이징된 종이 텍스처, 그레인, 낡은 인쇄 효과\n- 전면에 첨부 제품이 레이싱 모티프와 함께 역동적으로 배치\n- 스피드 라인과 빛 줄기\n- 상단: "BEST CONDITION WINS" 볼드 레트로 타이포\n- 중앙: "2026" 크게\n- 하단: "CONDITION CHALLENGE"\n- 컬러: red, cream, light blue, and black with strong contrast\n- 레트로 에디토리얼 일러스트, 빈티지 프린트 텍스처' },

  { id: "pr1", filename: "fc-flow-jersey.png",
    refImages: [R.logo],
    prompt: '첨부한 로고를 크레스트로 활용하여 축구 유니폼 클로즈업 이미지를 만들어줘. 세로 9:16.\n\n- 상체 부분만, 부드러운 원단 주름과 텍스처\n- 통기성 메쉬 존, 라운드넥, 블루 컬러 스트라이프\n- 가슴 왼쪽에 첨부 로고를 크레스트/엠블럼으로 자수 처리\n- 팀명: "FC inno.N"\n- 배경: 블루-그린 딥 그라디언트, 시네마틱\n- 울트라 리얼리스틱, 포토리얼, 8K' },

  { id: "g1", filename: "floki-mug-mockup.png",
    refImages: [R.condLogo, R.hutgaesoo],
    prompt: '첨부한 로고와 제품 이미지를 활용하여 3D clay render 스타일 머그컵 목업 이미지를 만들어줘.\n\n- 부드러운 점토 질감, 통통한 비율, 파스텔 톤\n- 머그컵에 첨부 로고가 프린트된 모습\n- 옆에 첨부 제품이 귀엽게 미니어처로 배치\n- 배경: 깔끔한 흰색 스튜디오\n- 소프트 스튜디오 라이팅\n- 포토리얼 제품 목업 스타일' },

  // ===== 업종별 (HK이노엔 버전 — 동일 프롬프트, 이미지만 별도 생성) =====
  { id: "ec1", filename: "ec1-product-shot.png", refImages: [],
    prompt: '핸드메이드 비누 이커머스 상세페이지용 대표 이미지를 만들어줘. 정사각형 1:1.\n\n- 제품: 라벤더 천연 수제비누, 둥근 형태, 연보라색, 드라이플라워 장식\n- 배경: 흰 대리석 위, 라벤더 꽃잎 흩뿌림, 소프트 자연광\n- 제품이 화면 중앙 60%\n- 포토리얼, 상업 제품 사진 퀄리티' },

  { id: "ec2", filename: "ec2-infographic.png", refImages: [],
    prompt: '건강식품 상세페이지용 성분/스펙 인포그래픽을 만들어줘. 세로 (800x1200).\n\n- 제품: "프리미엄 멀티비타민"\n- 핵심 성분: 비타민C 1000mg · 아연 15mg · 비타민D 2000IU · 철분 10mg · 프로바이오틱스 100억 CFU\n- 각 성분을 아이콘 + 짧은 설명으로 시각화\n- 화이트 배경, 그린 악센트, 클린 플랫 아이콘' },

  { id: "ec3", filename: "ec3-thankyou-card.png", refImages: [],
    prompt: '택배 동봉용 감사 카드를 만들어줘. 명함 크기.\n\n- "소중한 선택에 감사드려요 :)"\n- "솔직한 후기를 남겨주시면 다음 주문 시 10% 할인 쿠폰을 보내드려요!"\n- 브랜드명: "마이리틀숍"\n- 크래프트지 느낌, 따뜻한 브라운톤, 미니멀\n- 손글씨 느낌, QR코드 자리' },

  { id: "cs1", filename: "cs1-beauty-pop.png", refImages: [R.bewantsLogo, R.bewantsCream],
    prompt: '첨부한 로고와 제품을 활용하여 세럼 성분 안내 POP 카드를 만들어줘. A5 세로.\n\n- 제품명: "비원츠 리프팅 크림"\n- 핵심 성분: 레티놀 0.3% · 펩타이드 · 스쿠알란\n- 효능: 탄력 케어 · 주름 개선 · 영양 부스팅\n- 성분별 아이콘 + 원료 일러스트\n- 화이트 + 핑크 악센트, 클린 모던, 고급 화장품 느낌\n- 매장 선반에 세울 수 있는 포맷' },

  { id: "cs2", filename: "cs2-before-after.png", refImages: [],
    prompt: '피부 톤업 비포/애프터 안내 포스터를 만들어줘. 세로 A3.\n\n- 시술명: "글루타치온 비타민 필링"\n- 좌우 분할 (BEFORE / AFTER)\n- BEFORE: 칙칙한 피부톤 (일러스트)\n- AFTER: 맑고 투명한 피부 (일러스트)\n- 클린 화이트 + 로즈골드, 의료 프리미엄\n- 피부과 대기실 부착용' },

  { id: "fd1", filename: "fd1-recipe-card.png", refImages: [],
    prompt: '김치를 활용한 레시피 카드를 만들어줘. 세로 4:5.\n\n- 요리명: "바삭 김치전"\n- 완성된 김치전이 상단 60%\n- 하단에 재료 + 4단계 레시피\n- 따뜻한 자연광, 나무 테이블, 가정식 감성' },

  { id: "fd2", filename: "fd2-tasting-pop.png", refImages: [],
    prompt: '마트 시식코너용 소시지 POP를 만들어줘. 세로 A4.\n\n- "프리미엄 비엔나 소시지"\n- "지금 맛보세요! 100% 국내산 돼지고기"\n- "2,980원 → 1,980원 (오늘만!)"\n- 빨강+노랑 고채도, 활기찬 마트 POP 느낌' },

  { id: "fr1", filename: "fr1-franchise-poster.png", refImages: [],
    prompt: '치킨 프랜차이즈 가맹점 여름 이벤트 포스터. 세로 A3.\n\n- "여름 맥주 페어링 페스타"\n- "2026.06.01 ~ 07.31"\n- "치킨 + 생맥주 세트 15,900원"\n- 바삭한 후라이드 치킨 + 생맥주\n- 시원한 블루 + 골드, 여름 축제 느낌' },

  { id: "fr2", filename: "fr2-menu-board.png", refImages: [],
    prompt: '카페 프랜차이즈 메뉴보드. 가로 16:9.\n\n- "BREW HOUSE"\n- 아메리카노 4,500 / 카페라떼 5,000 / 바닐라라떼 5,500\n- "NEW! 제주 한라봉 에이드 5,800"\n- 다크 우드 배경, 따뜻한 조명, 카페 감성' },

  { id: "ph1", filename: "ph1-pharma-poster.png", refImages: [R.logo],
    prompt: '첨부한 로고를 활용하여 고혈압약 복약 안내 포스터를 만들어줘. 세로 A3.\n\n- "아모디핀정 5mg"\n- 복용법: 하루 1회 · 아침 식후 · 물과 함께\n- 주의: 자몽주스 금지 · 음주 자제 · 임의 중단 금지\n- 복용 시간/방법 아이콘 시각화\n- 화이트 + 블루, 의료 신뢰감\n- 첨부 로고 하단 배치' },

  { id: "ph2", filename: "ph2-campaign-infographic.png", refImages: [R.logo],
    prompt: '첨부한 로고를 활용하여 고혈압 인식 캠페인 포스터를 만들어줘. 세로 A3.\n\n- "침묵의 살인자, 고혈압 자가체크"\n- 체크리스트: 두통 · 뒷목 뻣뻣 · 코피 · 숨참 · 가족력\n- "수축기 140 이상 = 고혈압"\n- 빨강/노랑/초록 신호등 아이콘\n- 레드 포인트 + 화이트\n- 첨부 로고 하단 배치' },

  { id: "edu1", filename: "edu1-academy-flyer.png", refImages: [],
    prompt: '수학학원 여름방학 특강 모집 전단지. 세로 A4.\n\n- "매쓰플러스 수학학원"\n- "여름방학 집중 완성반"\n- "초등 4~6학년 / 중등 1~2학년"\n- "2026.07.21 ~ 08.15 (4주)"\n- "6/30까지 10% 조기등록 할인 + 교재 무료"\n- 블루 + 오렌지, 밝고 활기찬' },

  { id: "edu2", filename: "edu2-report-cover.png", refImages: [],
    prompt: '학부모 상담용 학습 리포트 커버. 세로 A4.\n\n- "매쓰플러스 수학학원"\n- "월간 학습 리포트"\n- "김민준 · 중등 1학년 · 2026년 5월"\n- 연필, 그래프, 별, 책 아이콘\n- 화이트 + 블루 그라디언트, 교육 감성' },

  { id: "pet1", filename: "pet1-vaccine-poster.png", refImages: [],
    prompt: '강아지 예방접종 스케줄 안내 포스터. 세로 A3.\n\n- "우리 아이 예방접종 가이드"\n- 6주→8주→10주→12주→매년 타임라인\n- 귀여운 강아지 일러스트\n- 파스텔 톤, 따뜻한' },

  { id: "re1", filename: "re1-apartment-flyer.png", refImages: [],
    prompt: '아파트 분양 홍보 전단지. 세로 A4.\n\n- "래미안 포레스트뷰"\n- "서울 강동구 고덕동"\n- "전용 59/84/114㎡ · 총 1,200세대"\n- "59㎡ 기준 6.8억~"\n- 현대적 아파트 외관 조감도\n- 골드 + 네이비, 프리미엄' },
];

async function generateImage(item) {
  const hasRefs = item.refImages && item.refImages.length > 0;
  console.log(`\n🎨 [${item.id}] 생성 중... ${item.filename}${hasRefs ? ` (ref ${item.refImages.length})` : ""}`);
  if (hasRefs) {
    const fd = new FormData(); fd.append("model", MODEL); fd.append("prompt", item.prompt); fd.append("size", "1024x1536"); fd.append("quality", "high");
    for (const r of item.refImages) { if (!fs.existsSync(r)) { console.log(`   ⚠️ ref 없음: ${r}`); continue; } fd.append("image[]", new Blob([fs.readFileSync(r)], {type:"image/png"}), path.basename(r)); }
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
  console.log(`🪽 HK이노엔 누락분: ${targets.length}개 (${MODEL})`);
  let ok=0,fail=0,skip=0;
  for (const item of targets) {
    if (!force&&fs.existsSync(path.join(IMAGES_DIR,item.filename))) { console.log(`⏭️ [${item.id}] skip`); skip++; continue; }
    try { if (await generateImage(item)) ok++; else fail++; } catch(e) { console.error(`   ❌ ${e.message}`); fail++; }
    await new Promise(r=>setTimeout(r,3000));
  }
  console.log(`\n📊 완료: 성공 ${ok} / 실패 ${fail} / 건너뜀 ${skip}`);
}
main().catch(console.error);
