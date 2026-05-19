import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, "../public");
const IMAGES_DIR = path.join(PUBLIC_DIR, "images");
const OPENAI_API_KEY = "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";
const MODEL = "gpt-image-2";

// ── HK이노엔 리소스 매핑 ──
const R = {
  logo: path.join(PUBLIC_DIR, "references/hkinno-n/condition/logo.png"),
  logoWhite: path.join(PUBLIC_DIR, "references/hkinno-n/condition/logo-white.png"),
  wordmark: path.join(PUBLIC_DIR, "references/hkinno-n/logo/hkinnon-logo.png"),
  conditionBottle: path.join(PUBLIC_DIR, "references/hkinno-n/products/condition.png"),
  conditionProduct01: path.join(PUBLIC_DIR, "references/hkinno-n/condition/product-01.png"),
  conditionProduct04: path.join(PUBLIC_DIR, "references/hkinno-n/condition/product-04.png"),
  conditionStick: path.join(PUBLIC_DIR, "references/hkinno-n/condition/stick-plum.jpg"),
  bewantsLogo: path.join(PUBLIC_DIR, "references/hkinno-n/bewants/logo.png"),
  bewantsProduct: path.join(PUBLIC_DIR, "references/hkinno-n/bewants/lifting-cream.png"),
  bewantsCampaign: path.join(PUBLIC_DIR, "references/hkinno-n/bewants/campaign-01.jpg"),
  hutgaesoo: path.join(PUBLIC_DIR, "references/hkinno-n/products/hutgaesoo.png"),
  kcab: path.join(PUBLIC_DIR, "references/hkinno-n/products/kcab.jpg"),
  pharma: path.join(PUBLIC_DIR, "references/hkinno-n/brand/business-pharma.png"),
  health: path.join(PUBLIC_DIR, "references/hkinno-n/brand/business-health.jpg"),
  beauty: path.join(PUBLIC_DIR, "references/hkinno-n/brand/business-beauty.png"),
  rndLab: path.join(PUBLIC_DIR, "references/hkinno-n/brand/rnd-lab-01.png"),
  mainVisual: path.join(PUBLIC_DIR, "references/hkinno-n/condition/main-visual.png"),
  tealog: path.join(PUBLIC_DIR, "references/hkinno-n/logo/brand-tealog.png"),
};

// 존재하는 파일만 필터
const refs = (...keys) => keys.map(k => R[k]).filter(f => fs.existsSync(f));

// ── 59개 프롬프트 (HK이노엔 맥락) ──
const prompts = [
  // Batch 1 (19개)
  { id: "p1", refs: refs("conditionBottle", "logo"), prompt: "첨부한 제품 이미지를 활용하여 black and white, pure solid black ink on white paper only 이벤트 포스터를 만들어줘. 세로 A3 비율. 상단에 \"HK이노엔 HEALTH SUMMIT 2026\"을 매우 굵은 압축 고딕 산세리프로 크게 배치. 중앙에 첨부 제품을 bold Japanese ink brush style로 재해석하여 그려줘. 배경에 세 개의 원이 대각선으로 배치된 화살표 모티프. 하단 정보: 왼쪽 \"서울시 중구 을지로 HK이노엔 본사\", 오른쪽 \"2026.06.25\" 큰 세리프체. 구분선 아래 중앙 \"건강한 미래를 만듭니다\". 맨 아래 \"HK inno.N\". 인쇄 품질, 갤러리급 그래픽 디자인." },
  { id: "p6", refs: refs("conditionBottle", "logo"), prompt: "첨부한 제품 이미지를 활용하여 1970s 빈티지 모터스포츠 포스터 스타일의 사내 프롬프트 경진대회 포스터를 만들어줘.\n\n- 에이징된 종이 텍스처, 그레인, 스크래치, 낡은 인쇄 효과\n- 전면에 첨부 제품이 레이싱 테마로 역동적 배치\n- 배경에 스피드 라인과 빛 줄기\n- 상단: \"BEST PROMPT WINS\" 볼드 레트로 타이포\n- 중앙: \"2026\" 크게\n- 하단: \"HK이노엔 PROMPTHON\"\n- 컬러: red, cream, light blue, black\n- 맨 하단: \"HK inno.N\" 빈티지 스폰서 느낌" },
  { id: "pr1", refs: refs("logo", "wordmark"), prompt: "첨부한 로고를 크레스트로 활용하여 축구 유니폼 클로즈업 이미지를 만들어줘. 세로 9:16 월페이퍼 포맷.\n\n- 상체 부분만, 부드러운 원단 주름과 디테일한 텍스처\n- 가슴 왼쪽에 첨부 로고를 크레스트/엠블럼으로 자수 처리\n- 팀명: \"FC HK이노엔\"\n- 배경: 그린+화이트 딥 그라디언트, 시네마틱\n- 울트라 리얼리스틱, 8K, 시네마틱 프로덕트 포토그래피" },
  { id: "g1", refs: refs("conditionBottle"), prompt: "첨부한 제품을 3D clay render로 재해석하여 머그컵 목업 이미지를 만들어줘.\n\n- 부드러운 점토 질감, 통통한 비율, 파스텔 톤\n- 머그컵에 제품 캐릭터가 자연스럽게 프린트된 모습\n- 배경: 깔끔한 흰색 스튜디오, 미니멀\n- 조명: 소프트 스튜디오 라이팅\n- 포토리얼 제품 목업 스타일" },
  { id: "s1", refs: refs("logo", "wordmark"), prompt: "첨부한 로고와 워드마크를 활용하여 모던하고 프로페셔널한 채용 포스트 이미지를 만들어줘. 링크드인 피드 비율 (1200x627).\n\n- 볼드한 타이포: \"We're Hiring!\"\n- 서브: \"R&D Researcher · Product Manager · Data Scientist\"\n- 배경: 그린에서 블루로 이어지는 그라디언트\n- 첨부 로고 배치, 바이오헬스 기업 느낌\n- 텍스트가 선명하고 읽기 쉽게" },
  { id: "s2", refs: refs("logo", "rndLab"), prompt: "첨부한 로고와 연구소 사진을 참고하여 봄 테마의 사내 인트라넷 메인 배너를 만들어줘. 가로 1920x480 비율.\n\n- 밝고 생기있는, 새로운 시작 분위기\n- 벚꽃, 새싹, 나비, 파스텔 톤\n- 바이오헬스 기업에 어울리는 프로페셔널한 느낌\n- 첨부 로고 우측 하단 배치" },
  { id: "c1", refs: refs("wordmark"), prompt: "첨부한 워드마크를 활용하여 한국 추석 인사 카드를 만들어줘.\n\n- 스타일: 수채화 일러스트, 전통과 현대의 조화\n- 메인 비주얼: 보름달, 송편, 한복 실루엣\n- 인사말: \"풍요로운 한가위 되세요\"\n- 보내는 곳: 하단에 첨부 워드마크 배치\n- 컬러: 골드, 딥레드, 크림\n- 세로 카드 비율, 인쇄 가능 품질" },
  { id: "g2", refs: refs("logo"), prompt: "첨부한 로고가 화이트 세라믹 머그컵에 프린트된 포토리얼 목업 이미지를 만들어줘.\n\n- 첨부 로고를 풀컬러 전사 프린트로 머그컵 중앙에 적용\n- 배경: 깔끔한 흰 배경, 미니멀 제품 촬영\n- 도자기 광택, 소재감이 느껴지게\n- 울트라 리얼리스틱, 제품 카탈로그 품질" },
  { id: "s3", refs: refs(), prompt: "텀블러의 UGC(유저 생성 콘텐츠) 스타일 사진을 만들어줘.\n\n- 아이폰으로 찍은 듯한 자연스러운 느낌\n- 카페 테이블 위, 커피와 함께, 손이 살짝 보이는 구도\n- 약간의 모션 블러, 자연광, 생활감 있는 구도\n- 인스타그램 피드에 자연스럽게 섞이는 느낌\n- 세로 4:5 비율" },
  { id: "i1", refs: refs("logo", "wordmark"), prompt: "첨부한 로고와 워드마크를 활용하여 Q2 실적 요약 인포그래픽 카드를 만들어줘.\n\n- 핵심 수치: \"매출 +32% YoY\"\n- 서브: \"케이캡 글로벌 매출 1,200억 · 컨디션 시장점유율 1위 · 비원츠 글로벌 진출\"\n- 스타일: 모던 미니멀, 플랫 디자인\n- 컬러: 그린 + 화이트 (HK이노엔 브랜드 컬러)\n- 상단에 첨부 로고\n- 정사각 1:1 카드 포맷" },
  { id: "sf1", refs: refs(), prompt: "제약 공장 안전 교육 포스터를 만들어줘.\n\n- 메인 메시지: \"보호장갑 미착용 시 작업 불가\"\n- 스타일: 볼드 플랫 일러스트, 심플하고 강렬한\n- 보호장갑을 착용한 작업자 일러스트 + 경고 삼각형 아이콘\n- 경고 컬러: 노랑 + 검정\n- A3 세로 포맷" },
  { id: "b1", refs: refs("conditionBottle", "bewantsProduct"), prompt: "첨부한 제품 이미지를 활용하여 사내 직원 생일 축하 카드를 만들어줘.\n\n- 받는 사람: \"민호\" 님\n- 스타일: 수채화 일러스트, 파스텔 톤\n- 첨부 제품들이 선물처럼 배치된 느낌\n- 메시지: \"생일 축하합니다! 올해도 빛나는 한 해 되세요\"\n- 보내는 곳: \"피플팀 드림\"\n- 케이크, 풍선, 컨페티\n- 정사각 카드 포맷" },
  { id: "sp1", refs: refs("logo", "rndLab"), prompt: "첨부한 로고와 연구소 사진을 참고하여 5층 사무실 공간 안내도(플로어맵)를 만들어줘.\n\n- 미니멀 플랫 일러스트, 아이소메트릭 느낌\n- 포함할 공간: 연구실 A·B·C, 라운지, 탕비실, 회의실, 클린룸\n- 각 공간에 아이콘 + 한글 라벨\n- 컬러: 화이트 베이스 + 그린/그레이 구역 구분\n- 상단에 \"R&D센터 5층 안내도\" + 첨부 로고\n- A3 가로" },
  { id: "sp2", refs: refs("logo"), prompt: "사무실 조명 스위치 패널에 부착할 공간 라벨을 만들어줘.\n\n- 스위치 4개에 대응하는 라벨\n- 1-연구실A, 2-복도, 3-라운지, 4-탕비실\n- 미니멀 픽토그램, 볼드 넘버링\n- 고대비, 직관적" },
  { id: "sp3", refs: refs("logo"), prompt: "첨부한 로고를 활용하여 회의실 도어사인을 만들어줘.\n\n- 회의실명: \"INNO\"\n- 수용 인원: 8명\n- 장비: 모니터, 화이트보드, 화상회의 카메라\n- 다크 배경 + 화이트 타이포\n- 첨부 로고 우측 상단 배치\n- A5 세로" },
  { id: "cp1", refs: refs("logo"), prompt: "첨부한 로고를 활용하여 정보보안 사내 캠페인 슬로건 포스터를 만들어줘.\n\n- 슬로건: \"당신의 비밀번호, 안전한가요?\"\n- 서브: \"2단계 인증을 활성화하세요. 의약품 데이터를 지키는 첫걸음.\"\n- 볼드 타이포그래피 중심, 모던 그래픽 포스터\n- 자물쇠 + 방패 모티프\n- 다크 네이비 + 일렉트릭 블루 + 화이트\n- 하단에 첨부 로고 + \"정보보안팀\"\n- A3 세로" },
  { id: "cp2", refs: refs("wordmark"), prompt: "첨부한 워드마크를 활용하여 사무실 벽면 타이포그래피 아트 포스터를 만들어줘.\n\n- 메인 텍스트: \"Innovate New & Next\"\n- 모던 스위스 타이포그래피, Helvetica 감성\n- 순수 블랙 텍스트 on 오프화이트 배경\n- 하단 구석에 첨부 워드마크\n- 세로 2:3 비율, 갤러리급" },
  { id: "fl1", refs: refs("logo", "conditionBottle"), prompt: "첨부한 로고와 제품을 활용하여 신규 복지 제도 사내 안내 전단지를 만들어줘.\n\n- 타이틀: \"자기계발비 지원 시작!\"\n- 핵심 내용: \"월 10만원 지원 · 도서/강의/자격증 가능 · 영수증 제출 시 익월 급여 반영\"\n- 적용: \"2026년 6월 1일부터\"\n- 밝고 친근한 플랫 디자인\n- 화이트 베이스 + 그린 포인트\n- 하단에 첨부 로고\n- A4 세로" },
  { id: "fl2", refs: refs("logo", "kcab"), prompt: "첨부한 로고와 제품 이미지를 활용하여 케이캡 글로벌 진출 사내 런칭 광고 포스터를 만들어줘.\n\n- 헤드카피: \"건강한 미래가 시작됩니다\"\n- 서브: \"케이캡, 미국 FDA 3상 완료. 글로벌 시장을 향한 새로운 도약\"\n- 첨부 제품 이미지를 디바이스 목업처럼 중앙 배치\n- Apple 스타일 프리미엄 마케팅\n- 하단에 첨부 로고 + \"글로벌사업본부\"\n- A3 세로" },
  // Batch 2 (20개)
  { id: "cn1", refs: refs("logo", "conditionProduct04"), prompt: "첨부한 로고와 제품을 활용하여 컨디션 제로 스파클링 신제품을 소개하는 인스타그램 카드뉴스 커버를 만들어줘. 정사각 1:1.\n\n- 헤드카피: \"제로 슈거, 제로 걱정\"\n- 서브: \"컨디션 제로 스파클링 신규 출시\"\n- 모던 플랫, 깔끔한 그리드\n- 첨부 제품 이미지 배치\n- 하단에 첨부 로고" },
  { id: "yt1", refs: refs("logo", "conditionBottle"), prompt: "첨부한 로고와 제품을 활용하여 숙취해소 팁 유튜브 썸네일을 만들어줘. 16:9.\n\n- 헤드카피: \"이거 모르면 다음날 후회합니다\"\n- 볼드 타이포 + 비비드 컬러\n- 첨부 제품 클로즈업 + 강조 그래픽\n- 우측 하단에 첨부 로고" },
  { id: "as1", refs: refs("logo"), prompt: "첨부한 로고를 활용하여 이노엔몰 앱스토어 프로모 이미지를 만들어줘. 세로.\n\n- 핵심: \"건강을 한눈에 관리하세요\"\n- 스마트폰 디바이스 목업\n- 배경: 그린에서 블루 소프트 그라디언트\n- 첨부 로고 포함\n- 프리미엄 느낌" },
  { id: "tz1", refs: refs("logo"), prompt: "첨부한 로고를 활용하여 신제품 티저 이미지를 만들어줘.\n\n- 텍스트: \"COMING SOON\"\n- 날짜: \"2026.07.01\"\n- 다크 시네마틱, 미스터리\n- 제품 실루엣만 살짝 — 궁금증 유발\n- 빛 입자, 렌즈 플레어\n- 하단에 첨부 로고" },
  { id: "ny1", refs: refs("wordmark"), prompt: "첨부한 워드마크를 활용하여 송년회 초대장을 만들어줘.\n\n- 행사명: \"2026 HK이노엔 송년의 밤\"\n- 일시: \"2026년 12월 19일 (금) 18:30\"\n- 장소: \"청주 본사 대강당\"\n- 골드 & 네이비, 럭셔리\n- 샴페인 글래스, 별, 골드 리본\n- 첨부 워드마크 배치\n- 세로 카드" },
  { id: "sp4", refs: refs("logo"), prompt: "첨부한 로고를 활용하여 사내 체육대회 포스터를 만들어줘.\n\n- 행사명: \"2026 HK이노엔 한마음 체육대회\"\n- 일시: \"2026년 10월 17일 (토)\"\n- 장소: \"청주 종합운동장\"\n- 스포츠 그래픽, 다이나믹, 볼드 타이포\n- 트로피, 메달, 스피드 라인\n- 하단에 첨부 로고\n- A3 세로" },
  { id: "ws1", refs: refs("logo"), prompt: "첨부한 로고를 활용하여 기술 세미나 초대장을 만들어줘.\n\n- 행사명: \"HK이노엔 R&D Talk #8: AI 신약개발의 미래\"\n- 연사: \"김박사 CTO · HK이노엔 R&D센터\"\n- 일시: \"2026년 7월 10일 15:00~17:00\"\n- 장소: \"R&D센터 세미나룸\"\n- 다크 배경 + 그린 그라디언트 악센트\n- 하단에 첨부 로고" },
  { id: "csr1", refs: refs("logo"), prompt: "첨부한 로고를 활용하여 환경 정화 봉사활동 참여 모집 포스터를 만들어줘.\n\n- 타이틀: \"함께 걸으며 줍는 플로깅 DAY\"\n- 일시: \"2026년 9월 20일 (토)\"\n- 장소: \"청주 무심천 일대\"\n- 따뜻한 일러스트, 자연 친화적 컬러\n- 하단에 첨부 로고 + \"ESG경영팀\"\n- A3 세로" },
  { id: "wb1", refs: refs("logo", "wordmark"), prompt: "첨부한 로고와 워드마크를 활용하여 웨비나 초대 배너를 만들어줘. 가로 1200x628.\n\n- 타이틀: \"AI 신약개발 트렌드 2026\"\n- 연사: \"이박사 CSO · HK이노엔\"\n- 일시: \"2026년 8월 14일 (목) 14:00\"\n- CTA: \"무료 등록하기 →\"\n- 다크 배경 + 그린 그라디언트\n- 하단에 첨부 로고/워드마크" },
  { id: "thx1", refs: refs("wordmark"), prompt: "첨부한 워드마크를 활용하여 VIP 고객 감사 카드를 만들어줘.\n\n- 인사말: \"소중한 파트너십에 깊이 감사드립니다\"\n- 골드 포일 + 엠보싱 느낌\n- 아이보리 + 골드 + 딥 그린\n- 하단에 첨부 워드마크\n- 세로 카드 비율" },
  { id: "br1", refs: refs("logo", "wordmark"), prompt: "첨부한 로고와 워드마크를 활용하여 바이오헬스 솔루션 제안서 표지를 만들어줘. 가로 16:9.\n\n- 타이틀: \"HK이노엔 바이오헬스 솔루션 제안서\"\n- 서브: \"글로벌 바이오헬스 기업의 혁신 파이프라인\"\n- 프리미엄 코퍼레이트, 추상 그래픽\n- 딥 그린 + 화이트\n- 하단에 첨부 로고/워드마크" },
  { id: "pk1", refs: refs("logo", "conditionBottle"), prompt: "첨부한 로고와 제품을 활용하여 프리미엄 음료 보틀 패키지 라벨 디자인 목업을 만들어줘.\n\n- 제품명: \"CONDITION ZERO\"\n- 미니멀 프리미엄, 여백 활용\n- 매트 블랙 + 골드 레터링\n- 첨부 로고 엠보싱 처리\n- 포토리얼 목업" },
  { id: "st1", refs: refs("conditionBottle"), prompt: "첨부한 제품 캐릭터를 활용하여 귀여운 치비 이모지 스티커 시트를 만들어줘.\n\n- 9개 스티커: 기쁨, 슬픔, 화남, 졸림, 사랑, 놀람, 열정, 피곤, 축하\n- 다이컷 느낌, 흰색 테두리\n- 배경: 라이트 그레이 격자 패턴\n- 정사각 시트" },
  { id: "mn1", refs: refs("logo"), prompt: "첨부한 로고를 활용하여 사내식당 이번 주 메뉴판을 만들어줘. 가로 A4.\n\n- 월: 김치찌개+돈까스 / 화: 된장찌개+불고기 / 수: 짜장면+탕수육 / 목: 순두부찌개+제육볶음 / 금: 칼국수+모듬튀김\n- 따뜻한 일러스트, 손그림 느낌\n- 크림 베이스 + 그린 포인트\n- 상단에 \"HK이노엔 구내식당\" + 첨부 로고" },
  { id: "ob1", refs: refs("wordmark", "conditionBottle"), prompt: "첨부한 워드마크와 제품을 활용하여 신입사원 온보딩 웰컴 카드를 만들어줘.\n\n- 메인: \"Welcome to HK이노엔! 건강한 미래를 함께 만들어요\"\n- 밝고 활기찬 일러스트\n- 첨부 제품이 웰컴 기프트처럼 배치\n- 첨부 워드마크 포함\n- 정사각 카드" },
  { id: "mg1", refs: refs("wordmark"), prompt: "첨부한 워드마크를 활용하여 사보 여름호 표지를 만들어줘. 세로 A4.\n\n- 매거진명: \"INNO magazine\"\n- 커버 스토리: \"글로벌 신약, 세계를 향한 도약\"\n- 호수: \"Vol.24 · 2026 Summer\"\n- 모던 에디토리얼, Vogue 감성\n- 추상적 바이오 그래픽 + 연구원 실루엣\n- 첨부 워드마크 배치" },
  { id: "ppt1", refs: refs("logo"), prompt: "첨부한 로고를 활용하여 분기 실적 발표 프레젠테이션 커버를 만들어줘. 가로 16:9.\n\n- 타이틀: \"Q2 2026 Business Review\"\n- 서브: \"글로벌 바이오헬스의 새로운 장\"\n- 다크 시네마틱\n- 추상적 빛 줄기 + 기하학 패턴\n- 첨부 로고 배치" },
  { id: "ny2", refs: refs("wordmark"), prompt: "첨부한 워드마크를 활용하여 2027 새해 인사 카드를 만들어줘.\n\n- 인사말: \"새해 복 많이 받으세요\"\n- 전통+현대 퓨전\n- 일출, 소나무, 학, 전통 문양\n- 레드 + 골드 + 크림\n- 하단에 첨부 워드마크\n- 세로 카드" },
  { id: "ps1", refs: refs("logo", "wordmark"), prompt: "첨부한 로고와 워드마크를 활용하여 HK이노엔 헬스케어 팝업스토어 포스터를 만들어줘.\n\n- 이벤트명: \"INNO POP-UP: Health, Beauty, Life\"\n- 기간: \"2026.09.01 ~ 09.14\"\n- 장소: \"서울 성수동\"\n- 트렌디 그래픽, 볼드 타이포\n- 3D 오브제 + 브랜드 컬러 그라디언트\n- A2 세로" },
  { id: "bc1", refs: refs("logo", "wordmark"), prompt: "첨부한 로고와 워드마크를 활용하여 R&D Researcher 명함을 만들어줘. 가로 90x50mm 양면.\n\n- 이름: \"이민호\"\n- 직함: \"R&D Researcher · HK inno.N\"\n- 연락처: \"minho@inno-n.com\"\n- 미니멀 모던, 화이트 + 그린 포인트\n- 앞면: 이름 + 직함 + 첨부 로고\n- 뒷면: 연락처 + QR코드\n- 포토리얼 목업" },
  // Batch 3 (20개)
  { id: "mv1", refs: refs("logo"), prompt: "첨부한 로고를 활용하여 분기 MVP 축하 포스터를 만들어줘.\n\n- 수상자: \"김민수\"\n- 소속: \"R&D센터\"\n- 수상 사유: \"케이캡 글로벌 3상 성공 기여\"\n- 프리미엄 어워드, 골드 악센트\n- 다크 네이비 + 골드 + 화이트\n- 트로피/메달 + 축하 이펙트\n- 하단에 첨부 로고\n- A3 세로" },
  { id: "ct1", refs: refs("wordmark"), prompt: "첨부한 워드마크를 활용하여 교육 수료증을 만들어줘.\n\n- 제목: \"GMP 품질관리 교육 수료증\"\n- 수여자: \"이민호\"\n- 내용: \"위 사람은 GMP 품질관리 교육 과정을 성실히 이수하였기에 이 증서를 수여합니다\"\n- 발급일: \"2026년 7월 25일\"\n- 발급기관: 첨부 워드마크 + \"교육팀\"\n- 금박 보더, 월계수 리스\n- 가로 A4" },
  { id: "cl1", refs: refs("logo"), prompt: "첨부한 로고 컬러를 참고하여 축구 동호회 엠블럼을 만들어줘.\n\n- 동호회명: \"FC INNO\"\n- 유럽 축구 클럽 크레스트\n- 축구공 + 방패 + 별 + 2020\n- 그린 + 골드 + 화이트\n- 정사각" },
  { id: "li1", refs: refs("wordmark", "kcab"), prompt: "첨부한 워드마크와 제품을 활용하여 기업 링크드인 커버 배너를 만들어줘. 가로 1584x396.\n\n- 메시지: \"건강한 미래를 만듭니다\"\n- 모던 코퍼레이트, 그라디언트\n- 첨부 제품 이미지 우측 배치\n- 좌측에 메시지 + 첨부 워드마크" },
  { id: "es1", refs: refs("logo"), prompt: "첨부한 로고를 활용하여 이메일 시그니처 프로모 배너를 만들어줘. 가로 600x100.\n\n- 메시지: \"케이캡 글로벌 3상 성공! 자세히 보기\"\n- CTA: \"보도자료 →\"\n- 미니멀 플랫, 화이트 배경 + 그린 CTA\n- 첨부 로고 포함" },
  { id: "nl1", refs: refs("logo"), prompt: "첨부한 로고를 활용하여 여름 테마 사내 뉴스레터 헤더를 만들어줘. 가로 600x200.\n\n- 뉴스레터명: \"INNO weekly\"\n- 호수: \"Vol.48 · 2026년 7월\"\n- 해변, 야자수, 시원한 블루 톤\n- 첨부 로고 포함" },
  { id: "pc1", refs: refs("logo"), prompt: "첨부한 로고를 활용하여 바이오헬스 팟캐스트 커버 아트를 만들어줘. 정사각.\n\n- 채널명: \"INNO cast\"\n- 서브: \"바이오헬스의 미래를 말하다\"\n- 모던 그래픽, 다크 배경\n- 마이크 + 음파 + 그린 그라디언트\n- 첨부 로고 포함" },
  { id: "bf1", refs: refs("wordmark"), prompt: "첨부한 워드마크를 활용하여 블랙프라이데이 프로모션 배너를 만들어줘. 가로 1200x628.\n\n- 헤드카피: \"BLACK FRIDAY DEAL\"\n- 할인: \"이노엔몰 전 제품 50% OFF\"\n- 기간: \"11.24 ~ 11.30\"\n- 블랙 + 골드 + 레드\n- 첨부 워드마크 포함" },
  { id: "cp3", refs: refs("logo", "conditionBottle"), prompt: "첨부한 로고와 제품을 활용하여 사내 카페 음료 쿠폰을 만들어줘.\n\n- 혜택: \"아메리카노 1잔 무료\"\n- 유효기간: \"2026.12.31까지\"\n- 골드 포일 + 프리미엄 바우처\n- 첨부 로고 포함\n- 가로 카드 비율" },
  { id: "tm1", refs: refs("logo"), prompt: "첨부한 로고를 활용하여 고객 후기 테스티모니얼 카드를 만들어줘. 정사각 1:1.\n\n- 고객사: \"서울대학교병원\"\n- 담당자: \"박교수\"\n- 후기: \"케이캡 처방 후 위식도역류 환자 만족도가 크게 향상되었습니다\"\n- 효과: \"환자 만족도 92% · 처방 편의성 1위\"\n- 클린 화이트 + 그린 포인트\n- 하단에 첨부 로고" },
  { id: "pz1", refs: refs("logo", "wordmark"), prompt: "첨부한 로고와 워드마크를 활용하여 올핸즈 미팅 포토존 백드롭을 만들어줘.\n\n- 이벤트명: \"HK이노엔 ALL HANDS 2026 H2\"\n- 프리미엄 미디어월\n- 딥 그린 + 화이트 그라디언트\n- 첨부 로고가 45도 반복 배치\n- 정사각" },
  { id: "wp1", refs: refs("logo"), prompt: "첨부한 로고를 활용하여 여름 테마 데스크톱 월페이퍼를 만들어줘. 가로 2560x1440.\n\n- 미니멀 그라디언트, 차분한\n- 쿨 블루 + 그린 + 민트 웨이브 패턴\n- 중앙 여백\n- 은은하게 첨부 로고 워터마크" },
  { id: "bx1", refs: refs("conditionBottle", "logo"), prompt: "첨부한 제품과 로고를 활용하여 배송 박스 언박싱 디자인을 만들어줘.\n\n- 메시지: \"Welcome to HK이노엔! 건강한 시작.\"\n- 외부 크래프트 + 내부 그린 그라디언트\n- 첨부 제품 + 브랜드 패턴\n- 개봉 순간의 설렘" },
  { id: "ar1", refs: refs("logo", "wordmark"), prompt: "첨부한 로고와 워드마크를 활용하여 HK이노엔 2025 연간 리포트 표지를 만들어줘. 세로 A4.\n\n- 타이틀: \"Annual Report 2025\"\n- 서브: \"Innovate New & Next\"\n- 프리미엄 코퍼레이트\n- 추상적 빛 흐름 + 바이오 네트워크 그래픽\n- 딥 그린 + 화이트 + 실버\n- 첨부 로고/워드마크 + 연도 크게" },
  { id: "rn1", refs: refs("logo", "kcab"), prompt: "첨부한 로고와 제품을 활용하여 케이캡 v2.0 릴리즈 노트 커버를 만들어줘. 가로 16:9.\n\n- 버전: \"K-CAB 2.0\"\n- 하이라이트: \"미국 FDA 3상 완료 · 유럽 허가 신청 · 신규 적응증 추가\"\n- 다크 배경 + 네온 악센트\n- 버전 넘버 3D + 기능 아이콘 플로팅\n- 첨부 로고 포함" },
  { id: "og1", refs: refs("logo", "conditionBottle"), prompt: "첨부한 로고와 제품을 활용하여 이노엔몰 고객 온보딩 가이드 커버를 만들어줘. 세로 A4.\n\n- 타이틀: \"이노엔몰 시작 가이드\"\n- 서브: \"건강한 쇼핑, 3분이면 충분합니다\"\n- 친근한 플랫 일러스트\n- 첨부 제품이 안내하는 느낌\n- 첨부 로고 + 브랜드 컬러" },
  { id: "wf1", refs: refs("logo"), prompt: "첨부한 로고를 활용하여 방문객 WiFi 안내 카드를 만들어줘.\n\n- WiFi: \"HKINNON-GUEST\"\n- 비밀번호: \"welcome2innoN!\"\n- 추가 안내: \"화장실: 복도 좌측 · 음료: 라운지 이용\"\n- 미니멀 모던, 다크 배경 + 화이트 텍스트\n- 첨부 로고 포함" },
  { id: "pk2", refs: refs("logo"), prompt: "첨부한 로고를 활용하여 주차장 B1 안내 사인을 만들어줘.\n\n- 층수: \"B1\" 초대형\n- 컬러코드: 그린\n- 산업적 모던, 고대비\n- 첨부 로고 작게 포함\n- 세로 사인" },
  { id: "em1", refs: refs(), prompt: "R&D센터 5층 비상 대피도를 만들어줘.\n\n- 비상구 2곳, 소화기 4곳, 소화전 2곳, 클린룸(진입 제한)\n- 대피 경로: 녹색 화살표\n- \"YOU ARE HERE\" 현재 위치\n- 국제 표준 픽토그램, 고대비\n- A3 가로" },
  { id: "cf1", refs: refs("logo"), prompt: "첨부한 로고를 활용하여 사내 카페 메뉴보드를 만들어줘.\n\n- 카페명: \"INNO café\"\n- 메뉴: 아메리카노 ₩2,000 / 카페라떼 ₩2,500 / 바닐라라떼 ₩3,000 / 녹차라떼 ₩3,000\n- 시즌: \"☀️ 콜드브루 피치티 ₩3,500\"\n- 칠판 스타일, 쵸크 레터링\n- 첨부 로고 포함\n- 세로" },
];

async function generateImage(item) {
  const hasRefs = item.refs.length > 0;
  console.log(`\n🎨 [${item.id}] 생성 중...${hasRefs ? ` (ref ${item.refs.length})` : ""}`);
  if (hasRefs) {
    const fd = new FormData(); fd.append("model", MODEL); fd.append("prompt", item.prompt); fd.append("size", "1024x1536"); fd.append("quality", "high");
    for (const r of item.refs) { fd.append("image[]", new Blob([fs.readFileSync(r)], {type:"image/png"}), path.basename(r)); }
    const res = await fetch("https://api.openai.com/v1/images/edits", { method:"POST", headers:{Authorization:`Bearer ${OPENAI_API_KEY}`}, body:fd });
    if (!res.ok) { console.error(`   ❌ ${res.status}: ${(await res.text()).slice(0,200)}`); return false; }
    return save(await res.json(), item.id);
  } else {
    const res = await fetch("https://api.openai.com/v1/images/generations", { method:"POST", headers:{"Content-Type":"application/json",Authorization:`Bearer ${OPENAI_API_KEY}`}, body:JSON.stringify({model:MODEL,prompt:item.prompt,n:1,size:"1024x1536",quality:"high"}) });
    if (!res.ok) { console.error(`   ❌ ${res.status}: ${(await res.text()).slice(0,200)}`); return false; }
    return save(await res.json(), item.id);
  }
}
function save(data, id) {
  const outDir = path.join(IMAGES_DIR, "hkinno-n");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, {recursive:true});
  // 원래 flow 파일명과 동일하게 저장 (page.tsx에서 brandId+filename으로 매칭)
  const flowFiles = fs.readdirSync(path.join(IMAGES_DIR, "flow")).filter(f => f.startsWith(id + "-") || f.startsWith(id + "."));
  const filename = flowFiles[0] || `${id}.png`;
  const b = data.data?.[0]?.b64_json; if (b) { const buf=Buffer.from(b,"base64"); fs.writeFileSync(path.join(outDir,filename),buf); console.log(`   ✅ ${filename} (${(buf.length/1024).toFixed(0)}KB)`); return true; }
  const u = data.data?.[0]?.url; if (u) return fetch(u).then(r=>r.arrayBuffer()).then(buf=>{const bf=Buffer.from(buf);fs.writeFileSync(path.join(outDir,filename),bf);console.log(`   ✅ ${filename} (${(bf.length/1024).toFixed(0)}KB)`);return true;});
  return false;
}

async function main() {
  const ids = process.argv.slice(2).filter(t=>t!=="--force"); const force = process.argv.includes("--force");
  const targets = ids.length > 0 ? prompts.filter(p => ids.includes(p.id)) : prompts;
  const outDir = path.join(IMAGES_DIR, "hkinno-n");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, {recursive:true});

  // 이미 생성된 것 스킵
  const todo = targets.filter(item => {
    const flowFiles = fs.readdirSync(path.join(IMAGES_DIR, "flow")).filter(f => f.startsWith(item.id + "-") || f.startsWith(item.id + "."));
    const filename = flowFiles[0] || `${item.id}.png`;
    if (!force && fs.existsSync(path.join(outDir, filename))) { console.log(`⏭️ [${item.id}] skip`); return false; }
    return true;
  });

  console.log(`🏢 HK이노엔 브랜드 이미지 생성: ${todo.length}개 남음 (순차, ${MODEL})`);
  let ok=0, fail=0;

  for (const item of todo) {
    try {
      const result = await generateImage(item);
      if (result) ok++;
      else fail++;
    } catch(e) {
      console.error(`   ❌ [${item.id}] 에러: ${e.message}`);
      fail++;
    }
    await new Promise(r => setTimeout(r, 3000));
  }
  console.log(`\n📊 완료: 성공 ${ok} / 실패 ${fail}`);
}
main().catch(console.error);
