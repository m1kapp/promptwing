import { prompts, PromptItem } from "@/data/prompts";
import { Brand } from "@/data/brands";

type RefImage = { url: string; label: string };

/**
 * flow 참고이미지 URL 패턴 → 현재 브랜드 대응 리소스 매핑.
 * flow 계열 브랜드는 매핑이 필요 없으므로 빈 맵을 반환한다.
 */
export function buildRefMap(brand: Brand): Record<string, RefImage> {
  const refMap: Record<string, RefImage> = {};
  if (brand.id === "flow" || brand.id.startsWith("flow-")) return refMap;

  const res = brand.resources;
  const logo = res.find((r) => r.key === "mainLogo");
  const model = res.find((r) => r.category === "홍보모델");
  const product = res.find((r) => r.category === "제품");
  const office = res.find((r) => r.category === "사업");

  if (logo) {
    refMap["/references/flow/logo/flow-logo-purple.webp"] = { url: logo.url, label: logo.label };
    refMap["/references/flow/logo/flow-wordmark-purple.webp"] = { url: logo.url, label: logo.label };
    refMap["/references/flow/logo/flow-ai-gradient.webp"] = { url: logo.url, label: logo.label };
  }
  if (model) {
    refMap["/references/flow/people/model-profile.webp"] = { url: model.url, label: model.label };
    refMap["/references/flow/people/model-male-profile.webp"] = { url: model.url, label: model.label };
    refMap["/references/flow/people/ceo-profile.webp"] = { url: model.url, label: model.label };
  }
  if (product) {
    refMap["/references/flow/product/flow-desktop-projects.webp"] = { url: product.url, label: product.label };
    refMap["/references/flow/product/flow-task-list.webp"] = { url: product.url, label: product.label };
    refMap["/references/flow/product/flow-sales-dashboard.webp"] = { url: product.url, label: product.label };
  }
  if (office) {
    refMap["/references/flow/office/flowground-allhands.webp"] = { url: office.url, label: office.label };
    refMap["/references/flow/office/seminar-room.webp"] = { url: office.url, label: office.label };
    refMap["/references/flow/office/team-group-photo.webp"] = { url: office.url, label: office.label };
  }
  // 캐릭터/마스코트 → 브랜드 로고로 대체 (마스코트 없는 브랜드)
  const brandLogo = res.find((r) => r.category === "브랜드 로고") ?? logo;
  if (brandLogo) {
    for (const path of [
      "/references/flow/package/floki-package.webp",
      "/references/flow/package/flosuni-package.webp",
      "/references/flow/package/borabuki-package.webp",
    ]) {
      refMap[path] = { url: brandLogo.url, label: `${brand.displayName} 로고` };
    }
  }
  // 아이콘
  if (logo) {
    refMap["/references/flow/icons/flow-icons-multicolor.webp"] = { url: logo.url, label: logo.label };
    refMap["/references/flow/icons/flow-icons-filled.webp"] = { url: logo.url, label: logo.label };
  }

  return refMap;
}

/** flow → 현재 브랜드 텍스트 치환 규칙 (hkinno-n 전용) */
export function buildTextMap(brand: Brand): [RegExp, string][] {
  return brand.id === "hkinno-n" ? [
    [/flow\.team/gi, "HK이노엔"],
    [/flow AI/gi, "HK이노엔"],
    [/flow팀/gi, "HK이노엔"],
    [/flow 팀/gi, "HK이노엔"],
    [/\bflow\b/gi, "HK이노엔"],
    [/플로키/g, "컨디션 캐릭터"],
    [/플로수니/g, "컨디션 캐릭터"],
    [/보라부키/g, "컨디션 캐릭터"],
    [/이초록/g, "컨디션 캐릭터"],
    [/펭플로/g, "컨디션 캐릭터"],
    [/플로우그라운드/g, "HK이노엔 본사"],
    [/보라색 범고래/g, "컨디션 보틀"],
    [/마스코트 모티프/g, "브랜드 로고"],
    [/마스코트/g, "브랜드 심볼"],
    [/#a855f7/g, "#0066B3"],
    [/보라색/g, "파란색"],
    [/퍼플/g, "블루"],
    [/purple/gi, "blue"],
    [/morningmate\.com/g, "inno-n.com"],
    [/영신로 220 KnK디지털타워 5층/g, "서울시 중구 을지로 100"],
  ] : [];
}

/** 단일 참고이미지 항목을 현재 브랜드 리소스로 치환 */
function mapRef(ref: RefImage, brand: Brand, refMap: Record<string, RefImage>): RefImage {
  if (refMap[ref.url]) return refMap[ref.url];
  if (ref.url.startsWith("/references/flow/")) {
    const fallback = brand.resources.find((r) => r.key === "mainLogo");
    if (fallback) return { url: fallback.url, label: `${brand.displayName} 로고` };
  }
  return ref;
}

interface MapContext {
  activeBrand: string;
  brand: Brand;
  refMap: Record<string, RefImage>;
  hasTextMap: boolean;
  replaceText: (text: string) => string;
}

/** 단일 프롬프트를 현재 브랜드/이미지 세트에 맞게 변환 */
function mapPrompt(p: PromptItem, ctx: MapContext): PromptItem {
  const { activeBrand, brand, refMap, hasTextMap, replaceText } = ctx;
  const filename = p.imageUrl ? p.imageUrl.split("/").pop()!.replace(/\.png$/, ".webp") : null;
  const imageUrl = filename ? `/images/${activeBrand}/${filename}` : p.imageUrl;

  // 참고이미지 매핑
  let refs = p.referenceImages;
  if (refs && Object.keys(refMap).length > 0) {
    refs = refs.map((ref) => mapRef(ref, brand, refMap));
  }

  // 텍스트 치환
  if (!hasTextMap) {
    return { ...p, imageUrl: imageUrl ?? p.imageUrl, referenceImages: refs };
  }

  return {
    ...p,
    imageUrl: imageUrl ?? p.imageUrl,
    referenceImages: refs,
    title: replaceText(p.title),
    story: p.story ? replaceText(p.story) : p.story,
    prompt: replaceText(p.prompt),
    author: replaceText(p.author),
    variables: p.variables?.map((v) => ({
      ...v,
      default: replaceText(v.default),
      options: v.options?.map((o) => ({ ...o, value: replaceText(o.value), label: replaceText(o.label) })),
    })),
  };
}

/** 현재 브랜드 컨텍스트에 맞춰 전체 프롬프트 목록을 파생 */
export function deriveBrandPrompts(activeBrand: string, brand: Brand): PromptItem[] {
  const refMap = buildRefMap(brand);
  const textMap = buildTextMap(brand);
  const hasTextMap = textMap.length > 0;

  const replaceText = (text: string) => {
    if (!hasTextMap) return text;
    let result = text;
    for (const [pattern, replacement] of textMap) result = result.replace(pattern, replacement);
    return result;
  };

  const ctx: MapContext = { activeBrand, brand, refMap, hasTextMap, replaceText };
  return prompts.map((p) => mapPrompt(p, ctx));
}
