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
  // ===== 인물 활용 (flow) =====
  { id: "s1", filename: "s1-linkedin-hiring.png",
    refImages: [ref("references/flow/logo/flow-logo-purple.png"), ref("references/flow/logo/flow-wordmark-purple.png"), ref("references/flow/people/model-profile.png"), ref("references/flow/people/model-male-profile.png")],
    prompt: '첨부한 로고, 워드마크, 인물 사진을 활용하여 모던하고 프로페셔널한 채용 포스트 이미지를 만들어줘. 링크드인 피드 비율 (1200x627).\n\n- 첨부한 인물들을 자연스럽게 배치 (밝은 표정, 업무 환경 느낌)\n- 볼드한 타이포: "We\'re Hiring!"\n- 서브 텍스트: "Software Engineer · Product Designer · Data Analyst"\n- 배경: 퍼플에서 핑크로 이어지는 그라디언트, 추상적 기하학 패턴\n- 회사 컬러 강조, 프로페셔널하면서 눈에 띄는 디자인\n- 하단에 첨부 로고/워드마크 영역\n- 텍스트가 선명하고 읽기 쉽게' },

  { id: "mv1", filename: "mv1-mvp-award.png",
    refImages: [ref("references/flow/people/model-male-profile.png"), ref("references/flow/logo/flow-logo-purple.png")],
    prompt: '첨부한 수상자 사진과 로고를 활용하여 분기 MVP 축하 포스터를 만들어줘.\n\n- 수상자: "김민수"\n- 소속: "개발팀"\n- 수상 사유: "Q2 핵심 프로젝트 리딩 및 팀 생산성 200% 향상"\n- 스타일: 프리미엄 어워드, 골드 악센트, 시상식 느낌\n- 컬러: 다크 네이비 + 골드 + 화이트\n- 중앙에 첨부된 수상자 사진을 원형 또는 육각형 프레임으로 배치\n- 트로피/메달 아이콘 + 축하 이펙트 (컨페티, 빛줄기)\n- 상단에 "Q2 MVP" 크게\n- 하단에 수상 사유 + 첨부 로고\n- A3 세로' },

  { id: "li1", filename: "li1-linkedin-cover.png",
    refImages: [ref("references/flow/logo/flow-logo-purple.png"), ref("references/flow/people/ceo-profile.png"), ref("references/flow/people/model-profile.png"), ref("references/flow/people/model-male-profile.png")],
    prompt: '첨부한 로고와 인물 사진 3장을 활용하여 기업 링크드인 페이지 커버 배너를 만들어줘. 가로 1584x396.\n\n- 첨부된 인물 3명을 우측에 자연스럽게 나란히 배치 (밝은 표정, 팀 느낌)\n- 좌측 메시지: "AI로 일하는 방식을 바꿉니다"\n- 스타일: 모던 코퍼레이트, 클린 타이포\n- 배경: 브랜드 퍼플 그라디언트 + 추상적 네트워크 그래픽\n- 좌측에 텍스트 + 첨부 로고\n- 프로페셔널하면서 트렌디한 기업 이미지' },

  { id: "tm1", filename: "tm1-testimonial.png",
    refImages: [ref("references/flow/people/model-profile.png"), ref("references/flow/logo/flow-logo-purple.png")],
    prompt: '첨부한 담당자 사진과 로고를 활용하여 고객 후기 테스티모니얼 카드를 만들어줘. 정사각 1:1.\n\n- 첨부된 인물 사진을 상단에 원형 프로필로 배치\n- 고객사: "ABC 테크놀로지"\n- 담당자: "박지영 팀장"\n- 후기: "flow 도입 후 팀 커뮤니케이션이 완전히 달라졌습니다. 회의 시간이 절반으로 줄었어요."\n- 효과: "업무 효율 47% 향상 · 회의 시간 50% 감소"\n- 큰따옴표로 후기를 감싸서 인용문 느낌\n- 클린 화이트 + 퍼플 포인트\n- 하단에 첨부 로고' },

  { id: "mg1", filename: "mg1-magazine-cover.png",
    refImages: [ref("references/flow/logo/flow-wordmark-purple.png"), ref("references/flow/people/ceo-profile.png")],
    prompt: '첨부한 워드마크와 대표 인물 사진을 활용하여 사내 매거진(사보) 여름호 표지를 만들어줘. 세로 A4.\n\n- 첨부된 인물 사진을 매거진 커버 포트레이트로 크게 배치 (허리 위까지)\n- 매거진명: "flow magazine" (마스트헤드)\n- 커버 스토리: "AI 시대, 우리의 일하는 방식이 바뀌다"\n- 호수: "Vol.24 · 2026 Summer"\n- 모던 에디토리얼, Vogue/Monocle 감성\n- 세로 A4 비율, 고급 인쇄 품질' },

  { id: "ob1", filename: "ob1-welcome-card.png",
    refImages: [ref("references/flow/logo/flow-wordmark-purple.png"), ref("references/flow/characters/floki/floki-hi.png"), ref("references/flow/people/ceo-profile.png")],
    prompt: '첨부한 워드마크, 마스코트 캐릭터, 대표 인물 사진을 활용하여 신입사원 온보딩 웰컴 카드를 만들어줘.\n\n- 대표 인물 사진을 작은 원형으로 우하단에 배치, 옆에 "CEO 이학준" 텍스트\n- 첨부 마스코트 캐릭터가 환영하는 모습으로 좌측에 배치\n- 메인 메시지: "Welcome to flow! 함께 성장할 여정을 시작합니다"\n- 받는 사람: "새로운 플로우어 님"\n- 모던 일러스트, 밝고 활기찬\n- 화이트 + 퍼플 그라디언트 + 옐로우 포인트\n- 별, 하트, 로켓, 환영 깃발 장식\n- 첨부 워드마크 포함\n- 정사각 카드 포맷' },

  // ===== 업종별 신규 프롬프트 =====
  { id: "ec1", filename: "ec1-product-shot.png", refImages: [],
    prompt: '핸드메이드 비누 이커머스 상세페이지용 대표 이미지를 만들어줘. 정사각형 1:1.\n\n- 제품: 라벤더 천연 수제비누, 둥근 형태, 연보라색, 드라이플라워 장식\n- 배경: 흰 대리석 위, 라벤더 꽃잎 흩뿌림, 소프트 자연광\n- 제품이 화면 중앙 60%를 차지\n- 자연스러운 그림자, 고급스러운 라이팅\n- 텍스트 없이 순수 제품 이미지만\n- 포토리얼, 상업 제품 사진 퀄리티' },

  { id: "ec2", filename: "ec2-infographic.png", refImages: [],
    prompt: '건강식품 상세페이지용 성분/스펙 인포그래픽을 만들어줘. 세로 긴 이미지 (800x1200).\n\n- 제품: "프리미엄 멀티비타민"\n- 핵심 성분: 비타민C 1000mg · 아연 15mg · 비타민D 2000IU · 철분 10mg · 프로바이오틱스 100억 CFU\n- 각 성분을 아이콘 + 짧은 설명으로 시각화\n- 숫자/수치는 크고 강조\n- 하단에 인증마크 영역\n- 화이트 배경, 그린 악센트, 클린 플랫 아이콘\n- 모바일에서 읽기 편한 큰 글씨' },

  { id: "ec3", filename: "ec3-thankyou-card.png", refImages: [],
    prompt: '택배 동봉용 감사 카드를 만들어줘. 명함 크기 (90x50mm).\n\n- 앞면: "소중한 선택에 감사드려요 :)"\n- 뒷면: "솔직한 후기를 남겨주시면 다음 주문 시 10% 할인 쿠폰을 보내드려요!"\n- 브랜드명: "마이리틀숍"\n- 크래프트지 느낌, 따뜻한 브라운톤, 미니멀\n- 손글씨 느낌의 감사 문구\n- QR코드 자리\n- 작지만 고급스러운 느낌\n- 인쇄용 CMYK' },

  { id: "cs1", filename: "cs1-beauty-pop.png", refImages: [],
    prompt: '세럼 성분 안내 POP 카드를 만들어줘. A5 세로.\n\n- 제품명: "비타C 브라이트닝 세럼"\n- 핵심 성분: 비타민C 15% · 나이아신아마이드 · 히알루론산 · 알부틴\n- 효능: 톤업 · 잡티 케어 · 광채 부스팅\n- 성분별 아이콘 + 원료 일러스트 (레몬, 분자 구조)\n- 피부 타입 아이콘 (건성/지성/민감성)\n- 화이트 + 오렌지 악센트, 클린 모던, 고급 화장품 느낌\n- 매장 선반에 세울 수 있는 포맷' },

  { id: "cs2", filename: "cs2-before-after.png", refImages: [],
    prompt: '피부 톤업 비포/애프터 안내 포스터를 만들어줘. 세로 A3.\n\n- 시술명: "글루타치온 비타민 필링"\n- 레이아웃: 좌우 분할 (BEFORE / AFTER)\n- BEFORE: 칙칙한 피부톤, 잡티, 고르지 않은 피부결 (일러스트로 표현)\n- AFTER: 맑고 투명한 피부, 균일한 톤, 광채 있는 피부결 (일러스트로 표현)\n- 중앙에 시술 아이콘\n- 하단: 시술 횟수, 주기, 주의사항 요약\n- 클린 화이트 + 로즈골드, 의료 프리미엄\n- 피부과 대기실 부착용' },

  { id: "fd1", filename: "fd1-recipe-card.png", refImages: [],
    prompt: '김치를 활용한 레시피 카드를 만들어줘. 세로 4:5 (인스타 비율).\n\n- 요리명: "바삭 김치전"\n- 재료: 묵은지 200g · 부침가루 1컵 · 물 3/4컵 · 식용유\n- 완성된 김치전 사진이 상단 60% (노릇하게 구워진, 먹음직스러운)\n- 하단에 재료 + 4단계 레시피 (아이콘 포함)\n- 따뜻한 자연광, 나무 테이블, 가정식 감성\n- 브랜드 로고 워터마크 자리\n- 식욕을 돋우는 따뜻한 톤' },

  { id: "fd2", filename: "fd2-tasting-pop.png", refImages: [],
    prompt: '마트 시식코너용 소시지 POP 디자인을 만들어줘. 세로 A4.\n\n- 제품명: "프리미엄 비엔나 소시지"\n- 시식 멘트: "지금 맛보세요! 100% 국내산 돼지고기"\n- 가격: "2,980원 → 1,980원 (오늘만!)"\n- 제품 이미지가 크게, 먹음직스럽게 (구워진 소시지, 김 올라오는)\n- "시식해보세요!" 행동 유도 문구\n- 빨강+노랑 고채도, 활기찬 마트 POP 느낌\n- 멀리서도 읽히는 큰 글씨' },

  { id: "fr1", filename: "fr1-franchise-poster.png", refImages: [],
    prompt: '치킨 프랜차이즈 가맹점 여름 이벤트 포스터를 만들어줘. 세로 A3.\n\n- 이벤트명: "여름 맥주 페어링 페스타"\n- 기간: "2026.06.01 ~ 07.31"\n- 혜택: "치킨 + 생맥주 세트 15,900원 (3,000원 할인)"\n- 바삭한 후라이드 치킨 + 시원한 생맥주잔, 김이 올라오는 비주얼\n- 시원한 블루 + 골드, 여름 축제 느낌, 역동적\n- 멀리서도 눈에 띄는 볼드 타이포\n- 하단에 가맹점 주소/전화번호 커스텀 영역' },

  { id: "fr2", filename: "fr2-menu-board.png", refImages: [],
    prompt: '카페 프랜차이즈 메뉴보드를 만들어줘. 가로 16:9 (TV/사이니지용).\n\n- 카페명: "BREW HOUSE"\n- 메뉴: 아메리카노 4,500 / 카페라떼 5,000 / 바닐라라떼 5,500 / 녹차라떼 5,500 / 카라멜마끼아또 5,500 / 콜드브루 5,000\n- 시즌: "NEW! 제주 한라봉 에이드 5,800"\n- 좌측에 음료 일러스트, 우측에 메뉴+가격 리스트\n- 다크 우드 배경, 따뜻한 조명, 카페 감성\n- 매장 TV에 표시할 수 있는 고해상도' },

  { id: "ph1", filename: "ph1-pharma-poster.png", refImages: [],
    prompt: '고혈압약 복약 안내 포스터를 만들어줘. 세로 A3.\n\n- 약 이름: "아모디핀정 5mg"\n- 복용법: 하루 1회 · 아침 식후 · 물과 함께 · 같은 시간에\n- 주의사항: 자몽주스 금지 · 음주 자제 · 임의 중단 금지 · 어지러움 시 운전 주의\n- 복용 시간/방법을 아이콘으로 시각화 (시계, 물컵, 알약)\n- 먹지 말아야 할 것 경고 아이콘 (자몽에 X 표시)\n- 화이트 + 블루, 의료 신뢰감, 깔끔한 픽토그램\n- 노인도 이해할 수 있는 큰 아이콘\n- 약국 벽면 부착용' },

  { id: "ph2", filename: "ph2-campaign-infographic.png", refImages: [],
    prompt: '고혈압 인식 캠페인 포스터를 만들어줘. 세로 A3.\n\n- 캠페인명: "침묵의 살인자, 고혈압 자가체크"\n- 체크리스트: 두통이 자주 온다 · 뒷목이 뻣뻣하다 · 코피가 자주 난다 · 숨이 쉽게 찬다 · 가족력이 있다\n- 경고 수치: "수축기 140 이상 / 이완기 90 이상 = 고혈압"\n- 자가체크 항목을 인포그래픽으로 (체크박스 스타일)\n- 위험 신호 아이콘 (빨강/노랑/초록 신호등)\n- "해당 항목이 3개 이상이면 전문의 상담" CTA\n- 레드 포인트 + 화이트, 경각심 + 신뢰감\n- 병원 대기실 부착용' },

  { id: "edu1", filename: "edu1-academy-flyer.png", refImages: [],
    prompt: '수학학원 여름방학 특강 모집 전단지를 만들어줘. 세로 A4.\n\n- 학원명: "매쓰플러스 수학학원"\n- 특강명: "여름방학 집중 완성반"\n- 대상: "초등 4~6학년 / 중등 1~2학년"\n- 기간: "2026.07.21 ~ 08.15 (4주 과정)"\n- 혜택: "6/30까지 등록 시 10% 조기등록 할인 + 교재 무료"\n- 상단에 학원명 + 특강명 크게\n- 중앙에 과목별 커리큘럼 요약 (수학 아이콘, 그래프)\n- 하단에 연락처, 주소, QR코드\n- 블루 + 오렌지, 밝고 활기찬, 학습 아이콘\n- 학부모가 신뢰감을 느끼는 디자인' },

  { id: "edu2", filename: "edu2-report-cover.png", refImages: [],
    prompt: '학부모 상담용 학습 리포트 커버를 만들어줘. 세로 A4.\n\n- 학원명: "매쓰플러스 수학학원"\n- 제목: "월간 학습 리포트"\n- 학생: "김민준 · 중등 1학년"\n- 기간: "2026년 5월"\n- 학습 관련 아이콘 (연필, 그래프, 별, 책)\n- 성장 곡선/그래프 모티프\n- 화이트 + 블루 그라디언트, 깔끔한 교육 감성\n- 학부모가 보관하고 싶은 퀄리티\n- 인쇄 + PDF 겸용' },

  { id: "pet1", filename: "pet1-vaccine-poster.png", refImages: [],
    prompt: '강아지 예방접종 스케줄 안내 포스터를 만들어줘. 세로 A3.\n\n- 타이틀: "우리 아이 예방접종 가이드"\n- 스케줄: 6주 종합백신 1차 → 8주 2차 → 10주 3차 → 12주 광견병 → 매년 추가접종\n- 타임라인/캘린더 형태로 시각화\n- 귀여운 강아지 일러스트 (골든리트리버 강아지)\n- 각 접종별 아이콘 (주사기, 방패)\n- 파스텔 톤, 귀여운 일러스트, 따뜻한\n- 하단에 동물병원 이름/전화번호 영역\n- 보호자가 사진 찍어 공유하고 싶은 디자인' },

  { id: "re1", filename: "re1-apartment-flyer.png", refImages: [],
    prompt: '아파트 분양 홍보 전단지를 만들어줘. 세로 A4.\n\n- 단지명: "래미안 포레스트뷰"\n- 위치: "서울 강동구 고덕동 일대"\n- 세대수: "전용 59/84/114㎡ · 총 1,200세대"\n- 분양가: "59㎡ 기준 6.8억~"\n- 입주: "2028년 하반기 예정"\n- 상단에 현대적 아파트 외관, 푸른 하늘, 공원 인접 조감도\n- 핵심 분양 정보 깔끔한 레이아웃\n- 교통/학군/편의시설 아이콘\n- 하단에 중개사 정보 커스텀 영역\n- 골드 + 네이비, 프리미엄 분양 자료' },
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
  console.log(`🪽 People + Industry batch: ${targets.length}개 (${MODEL})`);
  let ok=0,fail=0,skip=0;
  for (const item of targets) {
    if (!force&&fs.existsSync(path.join(IMAGES_DIR,item.filename))) { console.log(`⏭️ [${item.id}] skip`); skip++; continue; }
    try { if (await generateImage(item)) ok++; else fail++; } catch(e) { console.error(`   ❌ ${e.message}`); fail++; }
    await new Promise(r=>setTimeout(r,3000));
  }
  console.log(`\n📊 완료: 성공 ${ok} / 실패 ${fail} / 건너뜀 ${skip}`);
}
main().catch(console.error);
