import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, "../public");
const IMAGES_DIR = path.join(PUBLIC_DIR, "images");

const OPENAI_API_KEY =
  "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";
const MODEL = "gpt-image-2";

// 리소스 경로 헬퍼
const ref = (p) => path.join(PUBLIC_DIR, p);

// 각 프롬프트에 적절한 레퍼런스 이미지 매핑
const promptsToGenerate = [
  {
    id: "s1",
    filename: "s1-linkedin-hiring.png",
    refImages: [
      ref("references/flow/logo/flow-logo-purple.png"),
      ref("references/flow/logo/flow-wordmark-purple.png"),
    ],
    prompt:
      '첨부한 로고와 워드마크를 활용하여 모던하고 프로페셔널한 채용 포스트 이미지를 만들어줘. 링크드인 피드 비율 (1200x627).\n\n- 볼드한 타이포: "We\'re Hiring!"\n- 서브 텍스트: "Software Engineer · Product Designer · Data Analyst"\n- 배경: 퍼플에서 핑크로 이어지는 그라디언트, 추상적 기하학 패턴\n- 첨부한 회사 로고를 하단 또는 좌측 상단에 자연스럽게 배치\n- 회사 브랜드 컬러(퍼플) 강조, 프로페셔널하면서 눈에 띄는 디자인\n- 텍스트가 선명하고 읽기 쉽게, 깔끔한 레이아웃',
  },
  {
    id: "s2",
    filename: "s2-intranet-banner.png",
    refImages: [
      ref("references/flow/logo/flow-logo-purple.png"),
      ref("references/flow/office/flowground-allhands.png"),
    ],
    prompt:
      "첨부한 로고와 사무실 분위기를 참고하여 봄 테마의 사내 인트라넷 메인 배너를 만들어줘. 가로 1920x480 비율.\n\n- 밝고 생기있는, 새로운 시작 분위기\n- 벚꽃, 새싹, 나비, 파스텔 톤\n- 왼쪽에 텍스트 여백, 오른쪽에 비주얼 요소\n- 배경: 소프트 보케 효과의 자연 풍경\n- 첨부한 로고를 우측 하단에 작게 배치\n- 기업 인트라넷에 어울리는 프로페셔널하면서 따뜻한 느낌\n- 고해상도, 선명한 컬러",
  },
  {
    id: "c1",
    filename: "c1-holiday-card.png",
    refImages: [
      ref("references/flow/logo/flow-wordmark-purple.png"),
    ],
    prompt:
      '첨부한 회사 워드마크를 활용하여 한국 추석 (Chuseok) 인사 카드를 만들어줘.\n\n- 스타일: 수채화 일러스트, 전통과 현대의 조화\n- 메인 비주얼: 보름달, 송편, 한복 실루엣\n- 인사말: "풍요로운 한가위 되세요"\n- 보내는 곳: 하단에 첨부한 워드마크 배치\n- 컬러: 골드, 딥레드, 크림\n- 고급스럽고 정성이 느껴지는 디자인\n- 세로 카드 비율, 인쇄 가능 품질',
  },
  {
    id: "g2",
    filename: "g2-product-mockup.png",
    refImages: [
      ref("references/flow/logo/flow-logo-purple.png"),
    ],
    prompt:
      "첨부한 보라색 로고가 화이트 세라믹 머그컵에 프린트된 포토리얼 목업 이미지를 만들어줘.\n\n- 첨부한 로고를 풀컬러 전사 프린트로 머그컵 중앙에 적용\n- 배경: 깔끔한 흰 배경, 미니멀 제품 촬영\n- 조명: 자연스러운 스튜디오 라이팅, 부드러운 그림자\n- 도자기 광택, 소재감이 느껴지게\n- 울트라 리얼리스틱, 제품 카탈로그 품질",
  },
  {
    id: "s3",
    filename: "s3-ugc-product.png",
    refImages: [], // UGC는 일반적 제품이라 레퍼런스 불필요
    prompt:
      "텀블러의 UGC(유저 생성 콘텐츠) 스타일 사진을 만들어줘.\n\n- 아이폰으로 찍은 듯한 자연스러운 느낌\n- 카페 테이블 위, 커피와 함께, 손이 살짝 보이는 구도\n- 약간의 모션 블러, 자연광, 생활감 있는 구도\n- 필터 없는 리얼한 색감\n- 인스타그램 피드에 자연스럽게 섞이는 느낌\n- 정사각 1:1 또는 세로 4:5 비율",
  },
  {
    id: "i1",
    filename: "i1-infographic.png",
    refImages: [
      ref("references/flow/logo/flow-logo-purple.png"),
      ref("references/flow/logo/flow-wordmark-purple.png"),
    ],
    prompt:
      '첨부한 로고와 워드마크를 활용하여 Q2 실적 요약 인포그래픽 카드를 만들어줘.\n\n- 핵심 수치: "매출 +32% YoY"\n- 서브 정보: "신규 고객 1,200개사 · NPS 78점 · 리텐션 94%"\n- 스타일: 모던 미니멀, 플랫 디자인\n- 컬러: 회사 브랜드 컬러 (퍼플 + 화이트) — 첨부 로고 컬러 참조\n- 데이터 시각화 요소 (바 차트, 원형 차트, 아이콘 등)\n- 상단 또는 좌측 상단에 첨부 로고 배치\n- 깔끔하고 읽기 쉬운 레이아웃\n- 정사각 1:1 카드 포맷',
  },
  {
    id: "sf1",
    filename: "sf1-safety-poster.png",
    refImages: [], // 안전 포스터는 범용적
    prompt:
      '건설 현장 안전 교육 포스터를 만들어줘.\n\n- 메인 메시지: "안전모 미착용 시 출입 불가"\n- 스타일: 볼드 플랫 일러스트, 심플하고 강렬한\n- 아이콘/일러스트: 안전모를 쓴 작업자 일러스트 + 경고 삼각형 아이콘\n- 경고 컬러: 노랑 + 검정 (경고 표준색)\n- 읽기 쉬운 큰 글씨, 심플한 레이아웃\n- 현장에 부착 가능한 A3 세로 포맷',
  },
  {
    id: "b1",
    filename: "b1-birthday-card.png",
    refImages: [
      ref("references/flow/characters/floki/floki-party.png"),
      ref("references/flow/characters/flosuni/flosuni-floki-congrats.png"),
    ],
    prompt:
      '첨부한 마스코트 캐릭터들을 활용하여 사내 직원 생일 축하 카드를 만들어줘.\n\n- 받는 사람: "민호" 님\n- 스타일: 수채화 일러스트, 파스텔 톤\n- 첨부한 캐릭터들이 축하하는 모습으로 카드 중앙 또는 하단에 배치\n- 메시지: "생일 축하합니다! 올해도 빛나는 한 해 되세요"\n- 보내는 곳: "피플팀 드림"\n- 케이크, 풍선, 컨페티와 함께\n- 따뜻하고 진심이 느껴지는 디자인\n- 정사각 또는 세로 카드 포맷',
  },
  {
    id: "sp1",
    filename: "sp1-floor-map.png",
    refImages: [
      ref("references/flow/office/flowground-allhands.png"),
      ref("references/flow/logo/flow-logo-purple.png"),
    ],
    prompt:
      '첨부한 사무실 사진과 로고를 참고하여 5층 사무실 공간 안내도(플로어맵)를 만들어줘.\n\n- 스타일: 미니멀 플랫 일러스트, 아이소메트릭 느낌\n- 평면도 형태로 주요 공간을 구역별로 표시\n- 포함할 공간: 회의실 A·B·C, 라운지, 탕비실, 포커스룸, 폰부스, 복합기실, 화장실\n- 각 공간에 아이콘 + 한글 라벨\n- 동선 표시: 입구에서 주요 공간까지 점선 화살표\n- 컬러: 화이트 베이스 + 퍼플/그레이 구역 구분 (첨부 로고 컬러 참조)\n- 범례(legend) 영역 포함\n- 상단에 "5층 안내도" 타이틀 + 첨부 로고\n- A3 가로 포맷, 깔끔하고 한눈에 파악 가능한 레이아웃',
  },
  {
    id: "sp2",
    filename: "sp2-switch-label.png",
    refImages: [
      ref("references/flow/icons/flow-icons-multicolor.png"),
    ],
    prompt:
      "첨부한 아이콘 스타일을 참고하여 사무실 조명 스위치 패널에 부착할 공간 라벨을 만들어줘.\n\n- 스위치 4개에 대응하는 라벨\n- 각 스위치에 대응하는 공간: 1-회의실A, 2-복도, 3-라운지, 4-탕비실\n- 스타일: 미니멀 픽토그램, 볼드 넘버링\n- 각 공간을 색상 코드 + 아이콘 + 텍스트로 표시\n- 스위치 번호(1, 2, 3...)와 공간명이 명확히 매칭되게\n- 미니 평면도로 해당 구역 위치를 시각적으로 표시\n- 사이즈: 스위치 패널 옆에 부착 가능한 소형 (약 10x15cm)\n- 배경: 화이트, 깔끔하고 직관적, 어두운 곳에서도 읽히게 고대비",
  },
  {
    id: "sp3",
    filename: "sp3-door-sign.png",
    refImages: [
      ref("references/flow/logo/flow-logo-purple.png"),
    ],
    prompt:
      '첨부한 로고를 활용하여 회의실 도어사인 겸 이용 안내 카드를 만들어줘.\n\n- 회의실명: "FLOW"\n- 수용 인원: 8명\n- 보유 장비: 모니터, 화이트보드, 화상회의 카메라, HDMI 케이블\n- 스타일: 모던 미니멀, 다크 배경 + 화이트 타이포\n- 상단에 회의실 이름 크게, 첨부 로고를 우측 상단에 작게 배치\n- 중앙에 장비 아이콘 나열\n- 하단에 이용 수칙: "사용 후 정리 · 10분 전 자동 해제 · 음식물 반입 금지"\n- 사이즈: A5 세로 (도어 부착용)\n- 고급스럽고 통일감 있는 디자인',
  },
  {
    id: "cp1",
    filename: "cp1-security-campaign.png",
    refImages: [
      ref("references/flow/logo/flow-logo-purple.png"),
      ref("references/flow/characters/borabuki/borabuki-omg-shock.png"),
    ],
    prompt:
      '첨부한 로고와 마스코트 캐릭터를 활용하여 정보보안 사내 캠페인 슬로건 포스터를 만들어줘.\n\n- 슬로건: "당신의 비밀번호, 안전한가요?"\n- 서브 메시지: "2단계 인증을 활성화하세요. 비밀번호는 12자 이상, 특수문자 포함."\n- 첨부한 캐릭터가 놀란 표정으로 경고하는 모습을 포스터 한켠에 배치\n- 스타일: 볼드 타이포그래피 중심, 모던 그래픽 포스터\n- 비주얼: 자물쇠 + 방패 모티프, 추상적 기하학 패턴\n- 컬러: 다크 네이비 + 일렉트릭 블루 + 화이트\n- 슬로건이 압도적으로 크고 강렬하게\n- 하단에 첨부 로고 + "정보보안팀"\n- A3 세로, 포스터 아트 퀄리티',
  },
  {
    id: "cp2",
    filename: "cp2-culture-typo.png",
    refImages: [
      ref("references/flow/logo/flow-wordmark-purple.png"),
    ],
    prompt:
      '첨부한 워드마크를 활용하여 사무실 벽면에 걸 타이포그래피 아트 포스터를 만들어줘.\n\n- 메인 텍스트: "Move Fast, Stay Curious"\n- 스타일: 모던 스위스 타이포그래피, 그리드 기반, Helvetica 감성\n- 컬러: 순수 블랙 텍스트 on 오프화이트 배경\n- 타이포그래피가 주인공 — 글자 자체가 아트워크\n- 단어별로 크기/굵기를 달리하여 시각적 위계 부여\n- 여백을 충분히 활용한 갤러리급 구성\n- 세로 2:3 비율 (프레임 출력용)\n- 하단 구석에 첨부한 워드마크를 작게 배치\n- 고해상도, 대형 인쇄 품질, 갤러리 포스터 수준',
  },
  {
    id: "fl1",
    filename: "fl1-welfare-flyer.png",
    refImages: [
      ref("references/flow/logo/flow-logo-purple.png"),
      ref("references/flow/characters/flosuni/flosuni-cheer.png"),
    ],
    prompt:
      '첨부한 로고와 마스코트를 활용하여 신규 복지 제도 사내 안내 전단지를 만들어줘.\n\n- 타이틀: "자기계발비 지원 시작!"\n- 핵심 내용: "월 10만원 지원 · 도서/강의/자격증 가능 · 영수증 제출 시 익월 급여 반영 · 입사 3개월 이후 신청 가능"\n- 적용 시기: "2026년 6월 1일부터"\n- 문의처: "피플팀 (#people-ask 채널)"\n- 첨부한 캐릭터가 응원하는 모습으로 우측 또는 하단에 배치\n- 스타일: 밝고 친근한 플랫 디자인, 아이콘 활용\n- 컬러: 화이트 베이스 + 퍼플 포인트 (첨부 로고 컬러 참조)\n- 상단에 타이틀 크게 + 아이콘\n- 중앙에 핵심 내용을 카드/블록 형태로 정리\n- 하단에 적용일 + 문의처 + 첨부 로고\n- A4 세로, 직관적 레이아웃',
  },
  {
    id: "fl2",
    filename: "fl2-product-launch.png",
    refImages: [
      ref("references/flow/logo/flow-ai-gradient.png"),
      ref("references/flow/product/flow-desktop-projects.png"),
    ],
    prompt:
      '첨부한 AI 로고와 제품 UI 스크린샷을 활용하여 flow AI 어시스턴트 사내 런칭 광고 포스터를 만들어줘.\n\n- 헤드카피: "업무의 흐름이 바뀝니다"\n- 서브카피: "AI가 회의록을 요약하고, 할 일을 정리하고, 일정을 잡아줍니다"\n- 핵심 기능: 자동 회의록 요약 · 스마트 할 일 추천 · 원클릭 일정 생성\n- 첨부한 제품 UI 스크린샷을 디바이스 목업 안에 넣어서 중앙에 떠있는 느낌 + 글로우 효과\n- 스타일: Apple 스타일 프로덕트 마케팅, 클린하고 프리미엄\n- 핵심 기능을 3개 아이콘+텍스트로 간결하게\n- 하단에 QR코드 영역 + "지금 사용해보세요" CTA\n- 하단에 첨부한 AI 로고 + "flow 제품팀"\n- A3 세로, 테크 기업 내부 광고다운 세련된 디자인',
  },
];

async function generateImage(item) {
  const hasRefs = item.refImages && item.refImages.length > 0;
  console.log(
    `\n🎨 [${item.id}] 생성 중... ${item.filename}${hasRefs ? ` (레퍼런스 ${item.refImages.length}개)` : " (레퍼런스 없음)"}`
  );

  if (hasRefs) {
    // multipart/form-data — 레퍼런스 이미지 포함
    const formData = new FormData();
    formData.append("model", MODEL);
    formData.append("prompt", item.prompt);
    formData.append("size", "1024x1536");
    formData.append("quality", "high");

    for (const refPath of item.refImages) {
      if (!fs.existsSync(refPath)) {
        console.log(`   ⚠️  레퍼런스 없음: ${path.basename(refPath)}`);
        continue;
      }
      const fileBuffer = fs.readFileSync(refPath);
      const blob = new Blob([fileBuffer], { type: "image/png" });
      formData.append("image[]", blob, path.basename(refPath));
      console.log(`   📎 레퍼런스: ${path.basename(refPath)}`);
    }

    const response = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(`   ❌ 실패 (${response.status}): ${err.slice(0, 300)}`);
      return false;
    }

    const data = await response.json();
    return saveImage(data, item.filename);
  } else {
    // JSON — 텍스트 프롬프트만
    const response = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: MODEL,
          prompt: item.prompt,
          n: 1,
          size: "1024x1536",
          quality: "high",
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error(`   ❌ 실패 (${response.status}): ${err.slice(0, 300)}`);
      return false;
    }

    const data = await response.json();
    return saveImage(data, item.filename);
  }
}

function saveImage(data, filename) {
  const b64 = data.data?.[0]?.b64_json;
  if (b64) {
    const buffer = Buffer.from(b64, "base64");
    fs.writeFileSync(path.join(IMAGES_DIR, filename), buffer);
    console.log(`   ✅ 저장: ${filename} (${(buffer.length / 1024).toFixed(0)}KB)`);
    return true;
  }

  const url = data.data?.[0]?.url;
  if (url) {
    return fetch(url)
      .then((r) => r.arrayBuffer())
      .then((buf) => {
        const buffer = Buffer.from(buf);
        fs.writeFileSync(path.join(IMAGES_DIR, filename), buffer);
        console.log(`   ✅ 저장: ${filename} (${(buffer.length / 1024).toFixed(0)}KB)`);
        return true;
      });
  }

  console.error(`   ❌ 이미지 데이터 없음`);
  return false;
}

async function main() {
  const targetIds = process.argv.slice(2);
  const forceRegenerate = targetIds.includes("--force");
  const ids = targetIds.filter((t) => t !== "--force");

  const targets =
    ids.length > 0
      ? promptsToGenerate.filter((p) => ids.includes(p.id))
      : promptsToGenerate;

  console.log(`🪽 PromptWing 이미지 생성기 v2 (레퍼런스 이미지 활용)`);
  console.log(`   모델: ${MODEL}`);
  console.log(`   대상: ${targets.length}개 프롬프트`);
  console.log(`   강제 재생성: ${forceRegenerate}`);

  let success = 0;
  let fail = 0;
  let skip = 0;

  for (const item of targets) {
    const existing = path.join(IMAGES_DIR, item.filename);
    if (!forceRegenerate && fs.existsSync(existing)) {
      console.log(`\n⏭️  [${item.id}] 이미 존재 — 건너뜀 (--force로 재생성)`);
      skip++;
      continue;
    }
    try {
      const ok = await generateImage(item);
      if (ok) success++;
      else fail++;
    } catch (err) {
      console.error(`   ❌ 에러: ${err.message}`);
      fail++;
    }
    // rate limit
    await new Promise((r) => setTimeout(r, 3000));
  }

  console.log(`\n📊 완료: 성공 ${success} / 실패 ${fail} / 건너뜀 ${skip}`);
}

main().catch(console.error);
