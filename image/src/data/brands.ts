export interface BrandResource {
  key: string;
  label: string;
  url: string;
  category: string;
  /** "color" → 컬러 스와치, "font" → 폰트 샘플, 기본 → 이미지 */
  type?: "color" | "font";
  /** type="color" 일 때 hex 값 */
  hex?: string;
  /** type="font" 일 때 폰트 패밀리 */
  fontFamily?: string;
  /** type="font" 일 때 굵기 */
  fontWeight?: number;
}

export interface Brand {
  id: string;
  name: string;
  displayName: string;
  description: string;
  color: string;
  resources: BrandResource[];
}

export const brands: Brand[] = [
  {
    id: "flow",
    name: "flow",
    displayName: "flow.team",
    description: "AI 기반 B2B 협업툴",
    color: "purple",
    resources: [
      // ── 컬러 팔레트 ──
      { key: "colorPrimary", label: "Primary Purple", url: "", category: "컬러 팔레트", type: "color", hex: "#a855f7" },
      { key: "colorPrimaryDark", label: "Deep Purple", url: "", category: "컬러 팔레트", type: "color", hex: "#7c3aed" },
      { key: "colorPrimaryLight", label: "Light Purple", url: "", category: "컬러 팔레트", type: "color", hex: "#c084fc" },
      { key: "colorAccent", label: "Accent Blue", url: "", category: "컬러 팔레트", type: "color", hex: "#3b82f6" },
      { key: "colorBlack", label: "Black", url: "", category: "컬러 팔레트", type: "color", hex: "#18181b" },
      { key: "colorGray", label: "Gray 500", url: "", category: "컬러 팔레트", type: "color", hex: "#71717a" },
      { key: "colorLightGray", label: "Gray 100", url: "", category: "컬러 팔레트", type: "color", hex: "#f4f4f5" },
      { key: "colorWhite", label: "White", url: "", category: "컬러 팔레트", type: "color", hex: "#ffffff" },
      // ── 폰트 가이드 ──
      { key: "fontHeading", label: "Heading · Pretendard Bold", url: "", category: "폰트 가이드", type: "font", fontFamily: "Pretendard, sans-serif", fontWeight: 700 },
      { key: "fontBody", label: "Body · Pretendard Regular", url: "", category: "폰트 가이드", type: "font", fontFamily: "Pretendard, sans-serif", fontWeight: 400 },
      { key: "fontCaption", label: "Caption · Pretendard Medium", url: "", category: "폰트 가이드", type: "font", fontFamily: "Pretendard, sans-serif", fontWeight: 500 },
      { key: "fontMono", label: "Code · JetBrains Mono", url: "", category: "폰트 가이드", type: "font", fontFamily: "JetBrains Mono, monospace", fontWeight: 400 },
      // ── 로고 ──
      { key: "mainLogo", label: "메인 로고 (퍼플)", url: "/references/flow/logo/flow-logo-purple.webp", category: "로고" },
      { key: "monoLogo", label: "모노 로고", url: "/references/flow/logo/flow-logo-mono.webp", category: "로고" },
      { key: "wordmark", label: "워드마크", url: "/references/flow/logo/flow-wordmark-purple.webp", category: "로고" },
      { key: "aiLogo", label: "AI 로고 (그라디언트)", url: "/references/flow/logo/flow-ai-gradient.webp", category: "로고" },
      // ── 아이콘 ──
      { key: "iconsMulticolor", label: "아이콘 (멀티컬러)", url: "/references/flow/icons/flow-icons-multicolor.webp", category: "아이콘" },
      { key: "iconsFilled", label: "아이콘 (채움)", url: "/references/flow/icons/flow-icons-filled.webp", category: "아이콘" },
      { key: "iconsLine", label: "아이콘 (라인)", url: "/references/flow/icons/flow-icons-line.webp", category: "아이콘" },
      // ── 캐릭터 시트 ──
      { key: "flokiSheet", label: "플로키 캐릭터 시트", url: "/references/flow/package/floki-package.webp", category: "캐릭터 시트" },
      { key: "flosuniSheet", label: "플로수니 캐릭터 시트", url: "/references/flow/package/flosuni-package.webp", category: "캐릭터 시트" },
      { key: "borabukiSheet", label: "보라부키 캐릭터 시트", url: "/references/flow/package/borabuki-package.webp", category: "캐릭터 시트" },
      { key: "leechorokSheet", label: "이초록 캐릭터 시트", url: "/references/flow/package/leechorok-package.webp", category: "캐릭터 시트" },
      { key: "pengflowSheet", label: "펭플로 캐릭터 시트", url: "/references/flow/package/pengflow-package.webp", category: "캐릭터 시트" },
      // ── 플로키 ──
      { key: "flokiHi", label: "플로키 인사", url: "/references/flow/characters/floki/floki-hi.webp", category: "플로키" },
      { key: "flokiParty", label: "플로키 파티", url: "/references/flow/characters/floki/floki-party.webp", category: "플로키" },
      { key: "flokiThumbsup", label: "플로키 엄지척", url: "/references/flow/characters/floki/floki-thumbsup.webp", category: "플로키" },
      { key: "flokiIdea", label: "플로키 아이디어", url: "/references/flow/characters/floki/floki-idea.webp", category: "플로키" },
      { key: "flokiCoffee", label: "플로키 커피", url: "/references/flow/characters/floki/floki-coffee.webp", category: "플로키" },
      { key: "flokiLove", label: "플로키 사랑", url: "/references/flow/characters/floki/floki-love.webp", category: "플로키" },
      { key: "flokiShocked", label: "플로키 놀람", url: "/references/flow/characters/floki/floki-shocked.webp", category: "플로키" },
      { key: "flokiSorry", label: "플로키 미안", url: "/references/flow/characters/floki/floki-sorry.webp", category: "플로키" },
      { key: "flokiThanks", label: "플로키 감사", url: "/references/flow/characters/floki/floki-thanks.webp", category: "플로키" },
      { key: "flokiLaugh", label: "플로키 웃음", url: "/references/flow/characters/floki/floki-laugh.webp", category: "플로키" },
      { key: "flokiPlease", label: "플로키 부탁", url: "/references/flow/characters/floki/floki-please.webp", category: "플로키" },
      { key: "flokiSleeping", label: "플로키 잠자기", url: "/references/flow/characters/floki/floki-sleeping.webp", category: "플로키" },
      { key: "flokiLeavingWork", label: "플로키 퇴근", url: "/references/flow/characters/floki/floki-leaving-work.webp", category: "플로키" },
      { key: "flokiSwim", label: "플로키 수영", url: "/references/flow/characters/floki/floki-summer-swim.webp", category: "플로키" },
      { key: "flokiRain", label: "플로키 비", url: "/references/flow/characters/floki/floki-rain-1.webp", category: "플로키" },
      // ── 플로수니 ──
      { key: "flosuniHi", label: "플로수니 인사", url: "/references/flow/characters/flosuni/flosuni-hi.webp", category: "플로수니" },
      { key: "flosuniCheer", label: "플로수니 응원", url: "/references/flow/characters/flosuni/flosuni-cheer.webp", category: "플로수니" },
      { key: "flosuniCongrats", label: "플로수니+플로키 축하", url: "/references/flow/characters/flosuni/flosuni-floki-congrats.webp", category: "플로수니" },
      { key: "flosuniPerfect", label: "플로수니 퍼펙트", url: "/references/flow/characters/flosuni/flosuni-perfect.webp", category: "플로수니" },
      { key: "flosuniPresentation", label: "플로수니 발표", url: "/references/flow/characters/flosuni/flosuni-presentation.webp", category: "플로수니" },
      { key: "flosuniStudying", label: "플로수니 공부", url: "/references/flow/characters/flosuni/flosuni-studying.webp", category: "플로수니" },
      { key: "flosuniSuperhero", label: "플로수니 슈퍼히어로", url: "/references/flow/characters/flosuni/flosuni-superhero.webp", category: "플로수니" },
      { key: "flosuniGuitar", label: "플로수니 기타", url: "/references/flow/characters/flosuni/flosuni-guitar.webp", category: "플로수니" },
      { key: "flosuniYes", label: "플로수니 예스", url: "/references/flow/characters/flosuni/flosuni-yes.webp", category: "플로수니" },
      { key: "flosuniAngry", label: "플로수니 화남", url: "/references/flow/characters/flosuni/flosuni-angry.webp", category: "플로수니" },
      // ── 보라부키 ──
      { key: "borabukiHi", label: "보라부키 인사", url: "/references/flow/characters/borabuki/borabuki-hi.webp", category: "보라부키" },
      { key: "borabukiShock", label: "보라부키 놀람", url: "/references/flow/characters/borabuki/borabuki-omg-shock.webp", category: "보라부키" },
      { key: "borabukiFighting", label: "보라부키 파이팅", url: "/references/flow/characters/borabuki/borabuki-fighting.webp", category: "보라부키" },
      { key: "borabukiPerfect", label: "보라부키 퍼펙트", url: "/references/flow/characters/borabuki/borabuki-perfect.webp", category: "보라부키" },
      { key: "borabukiCheer", label: "보라부키 응원", url: "/references/flow/characters/borabuki/borabuki-cheer.webp", category: "보라부키" },
      { key: "borabukiCheers", label: "보라부키 건배", url: "/references/flow/characters/borabuki/borabuki-cheers-beer.webp", category: "보라부키" },
      { key: "borabukiProud", label: "보라부키 뿌듯", url: "/references/flow/characters/borabuki/borabuki-proud.webp", category: "보라부키" },
      { key: "borabukiRunning", label: "보라부키 달리기", url: "/references/flow/characters/borabuki/borabuki-running.webp", category: "보라부키" },
      { key: "borabukiGood", label: "보라부키 좋아요", url: "/references/flow/characters/borabuki/borabuki-good.webp", category: "보라부키" },
      { key: "borabukiBye", label: "보라부키 안녕", url: "/references/flow/characters/borabuki/borabuki-bye.webp", category: "보라부키" },
      // ── 이초록 ──
      { key: "leechorokTaskDone", label: "이초록 업무완료", url: "/references/flow/characters/leechorok/leechorok-task-done.webp", category: "이초록" },
      { key: "leechorokThumbsup", label: "이초록 엄지척", url: "/references/flow/characters/leechorok/leechorok-neb-thumbsup.webp", category: "이초록" },
      { key: "leechorokPayday", label: "이초록 월급날", url: "/references/flow/characters/leechorok/leechorok-payday.webp", category: "이초록" },
      { key: "leechorokCoffee", label: "이초록 커피", url: "/references/flow/characters/leechorok/leechorok-coffee-break.webp", category: "이초록" },
      { key: "leechorokKaltwi", label: "이초록 칼퇴", url: "/references/flow/characters/leechorok/leechorok-kaltwi.webp", category: "이초록" },
      { key: "leechorokWeekend", label: "이초록 주말", url: "/references/flow/characters/leechorok/leechorok-weekend-bye.webp", category: "이초록" },
      // ── 펭플로 ──
      { key: "pengflowDance", label: "펭플로 댄스", url: "/references/flow/characters/pengflow/pengflow-dance.webp", category: "펭플로" },
      { key: "pengflowPerfect", label: "펭플로 퍼펙트", url: "/references/flow/characters/pengflow/pengflow-perfect.webp", category: "펭플로" },
      { key: "pengflowThankyou", label: "펭플로 감사", url: "/references/flow/characters/pengflow/pengflow-thankyou.webp", category: "펭플로" },
      { key: "pengflowBye", label: "펭플로 안녕", url: "/references/flow/characters/pengflow/pengflow-bye.webp", category: "펭플로" },
      { key: "pengflowPayday", label: "펭플로 월급날", url: "/references/flow/characters/pengflow/pengflow-payday.webp", category: "펭플로" },
      { key: "pengflowFairy", label: "펭플로 요정", url: "/references/flow/characters/pengflow/pengflow-fairy.webp", category: "펭플로" },
      // ── 제품 UI ──
      { key: "productDesktop", label: "데스크톱 프로젝트", url: "/references/flow/product/flow-desktop-projects.webp", category: "제품 UI" },
      { key: "productTaskList", label: "태스크 리스트", url: "/references/flow/product/flow-task-list.webp", category: "제품 UI" },
      { key: "productTaskList2", label: "태스크 리스트 2", url: "/references/flow/product/flow-task-list-2.webp", category: "제품 UI" },
      { key: "productMobile", label: "모바일 프로젝트", url: "/references/flow/product/flow-mobile-projects.webp", category: "제품 UI" },
      { key: "productChat", label: "모바일 채팅", url: "/references/flow/product/flow-chat-mobile.webp", category: "제품 UI" },
      { key: "productDashboard", label: "세일즈 대시보드", url: "/references/flow/product/flow-sales-dashboard.webp", category: "제품 UI" },
      { key: "productDashboard2", label: "세일즈 대시보드 2", url: "/references/flow/product/flow-sales-dashboard-2.webp", category: "제품 UI" },
      // ── 사무실/행사 ──
      { key: "officeAllhands", label: "올핸즈 미팅", url: "/references/flow/office/flowground-allhands.webp", category: "사무실" },
      { key: "officeSeminar", label: "세미나룸", url: "/references/flow/office/seminar-room.webp", category: "사무실" },
      { key: "officeTeam", label: "팀 단체사진", url: "/references/flow/office/team-group-photo.webp", category: "사무실" },
      { key: "office10th", label: "10주년 기념", url: "/references/flow/office/10th-anniversary.webp", category: "사무실" },
      // ── 대표인물 ──
      { key: "ceoProfile", label: "이학준 대표 프로필", url: "/references/flow/people/ceo-profile.webp", category: "대표인물" },
      { key: "modelProfile", label: "홍보모델 (여)", url: "/references/flow/people/model-profile.webp", category: "대표인물" },
      { key: "modelMaleProfile", label: "홍보모델 (남)", url: "/references/flow/people/model-male-profile.webp", category: "대표인물" },
    ],
  },
  {
    id: "flow-yacht",
    name: "flow YACHT",
    displayName: "flow YACHT",
    description: "프리미엄 팀빌딩 워케이션 서비스",
    color: "navy",
    resources: [
      { key: "brandSheet", label: "브랜드 시트", url: "/references/flow/sub-brands/yacht/flow-yacht-brand-sheet.webp", category: "브랜드" },
      { key: "keyVisual", label: "키 비주얼", url: "/references/flow/sub-brands/yacht/flow-yacht-key-visual.webp", category: "브랜드" },
      { key: "program", label: "프로그램 안내", url: "/references/flow/sub-brands/yacht/flow-yacht-program.webp", category: "브랜드" },
      // flow 본사 로고 공유
      { key: "mainLogo", label: "flow 메인 로고", url: "/references/flow/logo/flow-logo-purple.webp", category: "로고" },
      { key: "wordmark", label: "flow 워드마크", url: "/references/flow/logo/flow-wordmark-purple.webp", category: "로고" },
    ],
  },
  {
    id: "flow-daily",
    name: "flow DAILY",
    displayName: "flow DAILY",
    description: "사내 카페 & 샌드위치 브랜드",
    color: "brown",
    resources: [
      { key: "brandSheet", label: "브랜드 시트", url: "/references/flow/sub-brands/daily/flow-daily-brand-sheet.webp", category: "브랜드" },
      { key: "keyVisual", label: "키 비주얼", url: "/references/flow/sub-brands/daily/flow-daily-key-visual.webp", category: "브랜드" },
      { key: "menu", label: "메뉴보드", url: "/references/flow/sub-brands/daily/flow-daily-menu.webp", category: "브랜드" },
      // flow 본사 로고 공유
      { key: "mainLogo", label: "flow 메인 로고", url: "/references/flow/logo/flow-logo-purple.webp", category: "로고" },
      { key: "wordmark", label: "flow 워드마크", url: "/references/flow/logo/flow-wordmark-purple.webp", category: "로고" },
    ],
  },
  {
    id: "hkinno-n",
    name: "HK이노엔",
    displayName: "HK inno.N",
    description: "글로벌 바이오헬스 기업",
    color: "blue",
    resources: [
      // ── 로고 ──
      { key: "mainLogo", label: "이노엔 로고", url: "/references/hkinno-n/logo/hkinnon-logo.webp", category: "로고" },
      { key: "mobileLogo", label: "모바일 로고", url: "/references/hkinno-n/logo/hkinnon-logo-mobile.webp", category: "로고" },
      { key: "footerLogo", label: "푸터 로고", url: "/references/hkinno-n/logo/hkinnon-footer-logo.webp", category: "로고" },
      // ── 브랜드별 로고 ──
      { key: "brandCondition", label: "컨디션", url: "/references/hkinno-n/logo/brand-condition.webp", category: "브랜드 로고" },
      { key: "brandHutgaesoo", label: "헛개수", url: "/references/hkinno-n/logo/brand-hutgaesoo.webp", category: "브랜드 로고" },
      { key: "brandBewants", label: "비원츠", url: "/references/hkinno-n/logo/brand-bewants.webp", category: "브랜드 로고" },
      { key: "brandTealog", label: "티로그", url: "/references/hkinno-n/logo/brand-tealog.webp", category: "브랜드 로고" },
      { key: "brandScalpmed", label: "스칼프메드", url: "/references/hkinno-n/logo/brand-scalpmed.webp", category: "브랜드 로고" },
      { key: "brandKlederma", label: "클레더마", url: "/references/hkinno-n/logo/brand-klederma.webp", category: "브랜드 로고" },
      { key: "brandSaessak", label: "새싹보리", url: "/references/hkinno-n/logo/brand-saessak.webp", category: "브랜드 로고" },
      { key: "brandHongsam", label: "홍삼진", url: "/references/hkinno-n/logo/brand-hongsam.webp", category: "브랜드 로고" },
      // ── 제품 이미지 ──
      { key: "productCondition", label: "컨디션 보틀", url: "/references/hkinno-n/products/condition.webp", category: "제품" },
      { key: "productConditionHutgae", label: "컨디션 헛개", url: "/references/hkinno-n/products/condition-hutgae.webp", category: "제품" },
      { key: "productHutgaesoo", label: "헛개수", url: "/references/hkinno-n/products/hutgaesoo.webp", category: "제품" },
      { key: "productHutgaesooBottle", label: "헛개수 보틀", url: "/references/hkinno-n/products/hutgaesoo-bottle.webp", category: "제품" },
      { key: "productKcab", label: "케이캡정", url: "/references/hkinno-n/products/kcab.webp", category: "제품" },
      { key: "productBewantsSunstick", label: "비원츠 선스틱", url: "/references/hkinno-n/products/bewants-sunstick.webp", category: "제품" },
      { key: "productBewantsMask", label: "비원츠 마스크", url: "/references/hkinno-n/products/bewants-mask.webp", category: "제품" },
      { key: "productBewantsEyeserum", label: "비원츠 아이세럼", url: "/references/hkinno-n/products/bewants-eyeserum.webp", category: "제품" },
      { key: "productBewantsLifting", label: "비원츠 리프팅크림", url: "/references/hkinno-n/products/bewants-lifting-cream.webp", category: "제품" },
      { key: "productBewantsCalming", label: "비원츠 카밍패드", url: "/references/hkinno-n/products/bewants-calming-pad.webp", category: "제품" },
      { key: "productScalpmedShampoo", label: "스칼프메드 샴푸", url: "/references/hkinno-n/products/scalpmed-shampoo.webp", category: "제품" },
      { key: "productScalpmedGold", label: "스칼프메드 골드", url: "/references/hkinno-n/products/scalpmed-gold.webp", category: "제품" },
      // ── 사업 이미지 ──
      { key: "businessPharma", label: "전문의약품 사업", url: "/references/hkinno-n/brand/business-pharma.webp", category: "사업" },
      { key: "businessHealth", label: "헬스&음료 사업", url: "/references/hkinno-n/brand/business-health.webp", category: "사업" },
      { key: "businessBeauty", label: "뷰티 사업", url: "/references/hkinno-n/brand/business-beauty.webp", category: "사업" },
      { key: "rndLab1", label: "R&D 연구소 1", url: "/references/hkinno-n/brand/rnd-lab-01.webp", category: "사업" },
      { key: "rndLab2", label: "R&D 연구소 2", url: "/references/hkinno-n/brand/rnd-lab-02.webp", category: "사업" },
      // ── 배너 ──
      { key: "bannerCondition", label: "컨디션 배너", url: "/references/hkinno-n/brand/banner-condition.webp", category: "배너" },
      { key: "bannerBewants", label: "비원츠 배너", url: "/references/hkinno-n/brand/banner-bewants.webp", category: "배너" },
      // ── 컨디션 로고 ──
      { key: "conLogo", label: "컨디션 로고", url: "/references/hkinno-n/condition/logo.webp", category: "컨디션" },
      { key: "conLogoWhite", label: "컨디션 로고 (화이트)", url: "/references/hkinno-n/condition/logo-white.webp", category: "컨디션" },
      { key: "conLogoSub01", label: "컨디션 서브로고 1", url: "/references/hkinno-n/condition/logo-sub-01.webp", category: "컨디션" },
      { key: "conLogoSub02", label: "컨디션 서브로고 2", url: "/references/hkinno-n/condition/logo-sub-02.webp", category: "컨디션" },
      { key: "conLogoSub03", label: "컨디션 서브로고 3", url: "/references/hkinno-n/condition/logo-sub-03.webp", category: "컨디션" },
      { key: "conLogoSub05", label: "컨디션 제로", url: "/references/hkinno-n/condition/logo-sub-05.webp", category: "컨디션" },
      // ── 컨디션 제품 ──
      { key: "conProduct01", label: "컨디션 헛개", url: "/references/hkinno-n/condition/product-01.webp", category: "컨디션 제품" },
      { key: "conProduct02", label: "컨디션 레이디", url: "/references/hkinno-n/condition/product-02.webp", category: "컨디션 제품" },
      { key: "conProduct03", label: "컨디션 CEO", url: "/references/hkinno-n/condition/product-03.webp", category: "컨디션 제품" },
      { key: "conProduct04", label: "컨디션 제로 스파클링", url: "/references/hkinno-n/condition/product-04.webp", category: "컨디션 제품" },
      { key: "conProduct05", label: "컨디션 스틱 제로", url: "/references/hkinno-n/condition/product-05.webp", category: "컨디션 제품" },
      { key: "conMainVisual", label: "컨디션 메인 비주얼", url: "/references/hkinno-n/condition/main-visual.webp", category: "컨디션 제품" },
      { key: "conSlide02", label: "컨디션 슬라이드", url: "/references/hkinno-n/condition/slide-02.webp", category: "컨디션 제품" },
      { key: "conSlide05", label: "컨디션 제로 슬라이드", url: "/references/hkinno-n/condition/slide-05.webp", category: "컨디션 제품" },
      { key: "conStickSet", label: "컨디션 스틱 세트", url: "/references/hkinno-n/condition/stick-set.webp", category: "컨디션 제품" },
      { key: "conStickPlum", label: "컨디션 스틱 자두", url: "/references/hkinno-n/condition/stick-plum.webp", category: "컨디션 제품" },
      { key: "conLady", label: "컨디션 레이디 보틀", url: "/references/hkinno-n/condition/lady.webp", category: "컨디션 제품" },
      { key: "conHwan", label: "컨디션 환", url: "/references/hkinno-n/condition/hwan.webp", category: "컨디션 제품" },
      { key: "conCeo", label: "컨디션 CEO 보틀", url: "/references/hkinno-n/condition/ceo.webp", category: "컨디션 제품" },
      // ── 비원츠 로고 ──
      { key: "bwLogo", label: "비원츠 로고", url: "/references/hkinno-n/bewants/logo.webp", category: "비원츠" },
      { key: "bwLogoWhite", label: "비원츠 로고 (화이트)", url: "/references/hkinno-n/bewants/logo-white.webp", category: "비원츠" },
      // ── 비원츠 제품 ──
      { key: "bwEyeSerum", label: "아이 세럼 스틱", url: "/references/hkinno-n/bewants/eye-serum-stick.webp", category: "비원츠 제품" },
      { key: "bwPeelOff", label: "필 오프 마스크", url: "/references/hkinno-n/bewants/peel-off-mask.webp", category: "비원츠 제품" },
      { key: "bwGlutathione", label: "글루타치온 앰플", url: "/references/hkinno-n/bewants/glutathione-ampoule.webp", category: "비원츠 제품" },
      { key: "bwLiftingCream", label: "리프팅 크림", url: "/references/hkinno-n/bewants/lifting-cream.webp", category: "비원츠 제품" },
      { key: "bwSerum", label: "모이스처 세럼", url: "/references/hkinno-n/bewants/moisture-serum.webp", category: "비원츠 제품" },
      { key: "bwToner", label: "에센스 토너", url: "/references/hkinno-n/bewants/essence-toner.webp", category: "비원츠 제품" },
      { key: "bwCalmingPad", label: "카밍 패드", url: "/references/hkinno-n/bewants/calming-pad.webp", category: "비원츠 제품" },
      { key: "bwSunMoisture", label: "수분 선크림", url: "/references/hkinno-n/bewants/sun-moisture.webp", category: "비원츠 제품" },
      { key: "bwSunToneup", label: "톤업 선크림", url: "/references/hkinno-n/bewants/sun-toneup.webp", category: "비원츠 제품" },
      // ── 비원츠 캠페인 ──
      { key: "bwMainVisual", label: "비원츠 메인 비주얼", url: "/references/hkinno-n/bewants/main-visual.webp", category: "비원츠 캠페인" },
      { key: "bwSlide01", label: "비원츠 슬라이드 1", url: "/references/hkinno-n/bewants/slide-01.webp", category: "비원츠 캠페인" },
      { key: "bwSlide02", label: "비원츠 슬라이드 2", url: "/references/hkinno-n/bewants/slide-02.webp", category: "비원츠 캠페인" },
      { key: "bwCampaign01", label: "비원츠 캠페인 1", url: "/references/hkinno-n/bewants/campaign-01.webp", category: "비원츠 캠페인" },
      { key: "bwCampaign02", label: "비원츠 캠페인 2", url: "/references/hkinno-n/bewants/campaign-02.webp", category: "비원츠 캠페인" },
      // ── 컨디션 캠페인 ──
      { key: "conLogoUpdate", label: "컨디션 로고 (최신)", url: "/references/hkinno-n/condition/logo-update.webp", category: "컨디션 캠페인" },
      { key: "conHero", label: "컨디션 히어로", url: "/references/hkinno-n/condition/hero.webp", category: "컨디션 캠페인" },
      { key: "conSlideLineup", label: "컨디션 라인업 슬라이드", url: "/references/hkinno-n/condition/slide-lineup.webp", category: "컨디션 캠페인" },
      { key: "conSlideStick", label: "컨디션 스틱 슬라이드", url: "/references/hkinno-n/condition/slide-stick.webp", category: "컨디션 캠페인" },
      { key: "conSlideSparkling", label: "컨디션 스파클링 슬라이드", url: "/references/hkinno-n/condition/slide-sparkling.webp", category: "컨디션 캠페인" },
      { key: "conDetailHutgae", label: "컨디션 헛개 상세", url: "/references/hkinno-n/condition/product-hutgae-detail.webp", category: "컨디션 캠페인" },
      { key: "conDetailCeo", label: "컨디션 CEO 상세", url: "/references/hkinno-n/condition/product-ceo-detail.webp", category: "컨디션 캠페인" },
      { key: "conDetailLady", label: "컨디션 레이디 상세", url: "/references/hkinno-n/condition/product-lady-detail.webp", category: "컨디션 캠페인" },
      { key: "conDetailHwan", label: "컨디션 환 상세", url: "/references/hkinno-n/condition/product-hwan-detail.webp", category: "컨디션 캠페인" },
      { key: "conDetailStick", label: "컨디션 스틱 상세", url: "/references/hkinno-n/condition/product-stick-detail.webp", category: "컨디션 캠페인" },
      { key: "conDetailSparkling", label: "컨디션 스파클링 상세", url: "/references/hkinno-n/condition/product-sparkling-detail.webp", category: "컨디션 캠페인" },
      // ── 비원츠 히어로 ──
      { key: "bwLogoMain", label: "비원츠 메인 로고", url: "/references/hkinno-n/bewants/logo-main.webp", category: "비원츠" },
      { key: "bwHero", label: "비원츠 히어로", url: "/references/hkinno-n/bewants/hero.webp", category: "비원츠 캠페인" },
      // ── 스칼프메드 ──
      { key: "smLogo", label: "스칼프메드 로고", url: "/references/hkinno-n/scalpmed/logo.webp", category: "스칼프메드" },
      { key: "smHero", label: "스칼프메드 히어로", url: "/references/hkinno-n/scalpmed/hero.webp", category: "스칼프메드" },
      { key: "smSlideRed", label: "레드 캡슐 바이옴", url: "/references/hkinno-n/scalpmed/slide-red.webp", category: "스칼프메드" },
      { key: "smSlideBlue", label: "블루 캡슐 바이옴", url: "/references/hkinno-n/scalpmed/slide-blue.webp", category: "스칼프메드" },
      { key: "smSlideGold", label: "골드 바이옴", url: "/references/hkinno-n/scalpmed/slide-gold.webp", category: "스칼프메드" },
      { key: "smRedShampoo", label: "레드 샴푸", url: "/references/hkinno-n/scalpmed/product-red-shampoo.webp", category: "스칼프메드 제품" },
      { key: "smRedTreatment", label: "레드 트리트먼트", url: "/references/hkinno-n/scalpmed/product-red-treatment.webp", category: "스칼프메드 제품" },
      { key: "smBlueSalt", label: "블루 솔트 샴푸", url: "/references/hkinno-n/scalpmed/product-blue-salt.webp", category: "스칼프메드 제품" },
      { key: "smBlueSoft", label: "블루 소프트 샴푸", url: "/references/hkinno-n/scalpmed/product-blue-soft.webp", category: "스칼프메드 제품" },
      { key: "smGoldShampoo", label: "골드 리페어 샴푸", url: "/references/hkinno-n/scalpmed/product-gold-shampoo.webp", category: "스칼프메드 제품" },
      { key: "smGoldTreatment", label: "골드 리페어 트리트먼트", url: "/references/hkinno-n/scalpmed/product-gold-treatment.webp", category: "스칼프메드 제품" },
      { key: "smGoldEssence", label: "골드 리페어 에센스", url: "/references/hkinno-n/scalpmed/product-gold-essence.webp", category: "스칼프메드 제품" },
      // ── 헛개수 ──
      { key: "hgLogo", label: "헛개수 로고", url: "/references/hkinno-n/hutgaesoo/logo.webp", category: "헛개수" },
      { key: "hgLogoSmall", label: "헛개수 로고 (소)", url: "/references/hkinno-n/hutgaesoo/logo-small.webp", category: "헛개수" },
      { key: "hgLogoEx", label: "헛개수 EX 로고", url: "/references/hkinno-n/hutgaesoo/logo-ex.webp", category: "헛개수" },
      { key: "hgProductOriginal", label: "헛개수 오리지널", url: "/references/hkinno-n/hutgaesoo/product-original.webp", category: "헛개수 제품" },
      { key: "hgProductEx", label: "헛개수 EX", url: "/references/hkinno-n/hutgaesoo/product-ex.webp", category: "헛개수 제품" },
      // ── 새싹보리 ──
      { key: "sbLogo", label: "새싹보리 로고", url: "/references/hkinno-n/saessak/logo.webp", category: "새싹보리" },
      { key: "sbHero", label: "새싹보리 히어로", url: "/references/hkinno-n/saessak/hero.webp", category: "새싹보리" },
      { key: "sbSlideOriginal", label: "새싹보리 오리지널", url: "/references/hkinno-n/saessak/slide-original.webp", category: "새싹보리" },
      { key: "sbSlideKids", label: "새싹보리 키즈", url: "/references/hkinno-n/saessak/slide-kids.webp", category: "새싹보리" },
      { key: "sbSlideBlack", label: "새싹보리 블랙", url: "/references/hkinno-n/saessak/slide-black.webp", category: "새싹보리" },
      { key: "sbProductOriginal", label: "새싹보리 오리지널", url: "/references/hkinno-n/saessak/product-original.webp", category: "새싹보리 제품" },
      { key: "sbProductKids", label: "새싹보리 키즈", url: "/references/hkinno-n/saessak/product-kids.webp", category: "새싹보리 제품" },
      { key: "sbProductBlack", label: "새싹보리 블랙", url: "/references/hkinno-n/saessak/product-black.webp", category: "새싹보리 제품" },
      // ── 클레더마 ──
      { key: "kdLogo", label: "클레더마 로고", url: "/references/hkinno-n/klederma/logo.webp", category: "클레더마" },
      { key: "kdHero", label: "클레더마 히어로", url: "/references/hkinno-n/klederma/hero.webp", category: "클레더마" },
      { key: "kdSlideMd", label: "클레더마 RX MD", url: "/references/hkinno-n/klederma/slide-md.webp", category: "클레더마" },
      { key: "kdSlideCosmetic", label: "클레더마 코스메틱", url: "/references/hkinno-n/klederma/slide-cosmetic.webp", category: "클레더마" },
      { key: "kdProductMd", label: "클레더마 로션 MD", url: "/references/hkinno-n/klederma/product-lotion-md.webp", category: "클레더마 제품" },
      { key: "kdProductSet", label: "클레더마 세트", url: "/references/hkinno-n/klederma/product-set.webp", category: "클레더마 제품" },
      // ── 티로그 ──
      { key: "tlLogo", label: "티로그 로고", url: "/references/hkinno-n/tealog/logo.webp", category: "티로그" },
      { key: "tlHero", label: "티로그 히어로", url: "/references/hkinno-n/tealog/hero.webp", category: "티로그" },
      { key: "tlSlideStill", label: "티로그 스틸 라인업", url: "/references/hkinno-n/tealog/slide-still.webp", category: "티로그" },
      { key: "tlSlideSparkling", label: "티로그 스파클링 라인업", url: "/references/hkinno-n/tealog/slide-sparkling.webp", category: "티로그" },
      { key: "tlSlideLineup", label: "티로그 전체 라인업", url: "/references/hkinno-n/tealog/slide-lineup.webp", category: "티로그" },
      { key: "tlSlideCollab", label: "티로그 아트 콜라보", url: "/references/hkinno-n/tealog/slide-collab.webp", category: "티로그" },
      // ── 홍보모델 (장카설유) ──
      { key: "modelGroup", label: "장카설유 단체컷", url: "/references/hkinno-n/people/jangkaseolyu-group.webp", category: "홍보모델" },
      { key: "modelJangkiha", label: "장기하 컨디션 스틱", url: "/references/hkinno-n/people/jangkiha-condition.webp", category: "홍보모델" },
      { key: "modelSeolundo", label: "설운도 컨디션 헛개", url: "/references/hkinno-n/people/seolundo-condition.webp", category: "홍보모델" },
      { key: "modelCardergarden", label: "카더가든 컨디션 스틱", url: "/references/hkinno-n/people/cardergarden-condition.webp", category: "홍보모델" },
      { key: "modelYoobyungjae", label: "유병재 컨디션 환", url: "/references/hkinno-n/people/yoobyungjae-condition.webp", category: "홍보모델" },
      { key: "modelHaewonProfile", label: "해원 (NMIXX) 프로필", url: "/references/hkinno-n/people/haewon-profile.webp", category: "홍보모델" },
      { key: "modelHaewonAd", label: "해원 컨디션 광고컷", url: "/references/hkinno-n/people/haewon-condition.webp", category: "홍보모델" },
      { key: "modelJohancheol", label: "조한철 프로필", url: "/references/hkinno-n/people/johancheol-condition.webp", category: "홍보모델" },
    ],
  },
];
