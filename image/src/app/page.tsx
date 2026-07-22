"use client";

import { Suspense, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Building2, LayoutGrid, Palette, SlidersHorizontal, Rows3, RectangleVertical } from "lucide-react";
import {
  AppShell, AppShellHeader, AppShellContent,
  TabBar, Tab, Avatar, Dialog, Tooltip, Watermark,
  ToastProvider, useToast,
  ThemeButton, ThemeDialog,
} from "@m1kapp/kit";
import Feed from "@/components/Feed";
import { prompts, allTags, PromptItem, customFilterOptions, CustomFilterKey } from "@/data/prompts";
import { brands } from "@/data/brands";
import imageManifest from "@/data/image-manifest.json";
import CustomFilter, { CustomFilterState, emptyFilter } from "@/components/CustomFilter";
import { deriveBrandPrompts } from "@/lib/brand-prompts";

function useBrandFromUrl() {
  const searchParams = useSearchParams();
  const brandParam = searchParams.get("brand");
  if (brandParam && brands.some((b) => b.id === brandParam)) return brandParam;
  return brands[0].id;
}

export default function Home() {
  return (
    <Suspense>
      <ToastProvider>
        <HomeInner />
      </ToastProvider>
    </Suspense>
  );
}

function HomeInner() {
  const urlBrand = useBrandFromUrl();
  const [activeBrand, setActiveBrand] = useState(urlBrand);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"prompts" | "brandkit">("prompts");
  // brandPickerOpen 제거됨
  const [customFilter, setCustomFilter] = useState<CustomFilterState>(emptyFilter);
  const [customFilterOpen, setCustomFilterOpen] = useState(false);
  const isCustomFilterActive = Object.values(customFilter).some(Boolean);
  const [viewMode, setViewMode] = useState<"shorts" | "list">("shorts");
  const [themeOpen, setThemeOpen] = useState(false);
  const [themeColor, setThemeColor] = useState(urlBrand === "hkinno-n" ? "#0066B3" : "#a855f7");
  const [dark, setDark] = useState(false);

  const currentBrand = useMemo(
    () => brands.find((b) => b.id === activeBrand) ?? brands[0],
    [activeBrand]
  );

  const brandPrompts = useMemo<PromptItem[]>(
    () => deriveBrandPrompts(activeBrand, currentBrand),
    [activeBrand, currentBrand]
  );

  const filteredPrompts = useMemo(() => {
    const existingImages = new Set((imageManifest as Record<string, string[]>)[activeBrand] ?? []);
    let result = brandPrompts.filter((p) => {
      if (!p.imageUrl) return false;
      const filename = p.imageUrl.split("/").pop()!;
      return existingImages.has(filename);
    });

    if (isCustomFilterActive) {
      const keys = Object.keys(customFilterOptions) as CustomFilterKey[];
      result = result.filter((p) => {
        for (const k of keys) {
          if (customFilter[k] && p[k] !== customFilter[k]) return false;
        }
        return true;
      });
    }

    if (activeTag !== null) {
      result = result.filter((p) => p.tags.includes(activeTag));
    }

    return [...result].reverse();
  }, [activeTag, brandPrompts, customFilter, isCustomFilterActive]);

  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const tag of allTags) {
      counts[tag] = prompts.filter((p) => p.tags.includes(tag)).length;
    }
    return counts;
  }, []);

  return (
    <Watermark
      text="PromptWing"
      sponsor={activeBrand === "hkinno-n"
        ? { name: "HK inno.N", url: "https://www.inno-n.com" }
        : { name: "flow AI", url: "https://flow.team" }}
      color={themeColor}
    >
      <AppShell maxHeight={844}>
        <AppShellHeader>
          <div className="flex items-center justify-between w-full">
            <h1 className="text-[17px] font-bold text-gray-900 dark:text-white tracking-tight">
              PromptWing
            </h1>
            <div className="flex items-center gap-2">
              {activeTab === "prompts" && (
                <ViewModeToggle viewMode={viewMode} onChange={setViewMode} />
              )}
            </div>
          </div>
        </AppShellHeader>

        {/* Tag bar (prompts tab only) */}
        {activeTab === "prompts" && (
          <PromptTagBar
            totalCount={brandPrompts.length}
            activeTag={activeTag}
            isCustomFilterActive={isCustomFilterActive}
            customFilterCount={Object.values(customFilter).filter(Boolean).length}
            tagCounts={tagCounts}
            onSelectAll={() => { setActiveTag(null); setCustomFilter(emptyFilter); }}
            onToggleCustom={() => setCustomFilterOpen(!customFilterOpen)}
            onSelectTag={(tag) => setActiveTag(activeTag === tag ? null : tag)}
          />
        )}

        {/* Custom filter dialog */}
        <CustomFilter
          allPrompts={brandPrompts}
          filter={customFilter}
          onFilterChange={(f) => { setCustomFilter(f); setActiveTag(null); }}
          isOpen={customFilterOpen}
          onToggle={() => setCustomFilterOpen(false)}
        />

        {/* Content */}
        <AppShellContent>
          {activeTab === "prompts" ? (
            <Feed items={filteredPrompts} brandId={activeBrand} viewMode={viewMode} customFilter={isCustomFilterActive ? customFilter : null} onReduceFilter={(key) => setCustomFilter({ ...customFilter, [key]: null })} />
          ) : (
            <BrandKitView brand={currentBrand} />
          )}
        </AppShellContent>

        {/* Bottom tab bar */}
        <TabBar>
          <Tab
            active={activeTab === "prompts"}
            onClick={() => setActiveTab("prompts")}
            icon={<LayoutGrid className="w-5 h-5" strokeWidth={activeTab === "prompts" ? 2.2 : 1.5} />}
            label="프롬프트"
          />
          <Tab
            active={activeTab === "brandkit"}
            onClick={() => setActiveTab("brandkit")}
            icon={<Palette className="w-5 h-5" strokeWidth={activeTab === "brandkit" ? 2.2 : 1.5} />}
            label="브랜드킷"
          />
        </TabBar>

        <ThemeDialog
          open={themeOpen}
          onClose={() => setThemeOpen(false)}
          current={themeColor}
          onSelect={setThemeColor}
          dark={dark}
          onDarkToggle={() => setDark((v) => !v)}
        />
      </AppShell>
    </Watermark>
  );
}

/** 헤더 우측 쇼츠/리스트 뷰 전환 토글 */
function ViewModeToggle({ viewMode, onChange }: { viewMode: "shorts" | "list"; onChange: (mode: "shorts" | "list") => void }) {
  return (
    <div className="flex items-center bg-gray-100 dark:bg-zinc-800 rounded-full p-0.5">
      <Tooltip label="쇼츠 모드">
        <button
          onClick={() => onChange("shorts")}
          className={`p-1.5 rounded-full transition-colors ${viewMode === "shorts" ? "bg-white dark:bg-zinc-700 shadow-sm text-gray-900 dark:text-white" : "text-gray-400"}`}
        >
          <RectangleVertical className="w-3.5 h-3.5" />
        </button>
      </Tooltip>
      <Tooltip label="리스트 모드">
        <button
          onClick={() => onChange("list")}
          className={`p-1.5 rounded-full transition-colors ${viewMode === "list" ? "bg-white dark:bg-zinc-700 shadow-sm text-gray-900 dark:text-white" : "text-gray-400"}`}
        >
          <Rows3 className="w-3.5 h-3.5" />
        </button>
      </Tooltip>
    </div>
  );
}

/** 프롬프트 탭 상단 태그/필터 바 */
function PromptTagBar({
  totalCount,
  activeTag,
  isCustomFilterActive,
  customFilterCount,
  tagCounts,
  onSelectAll,
  onToggleCustom,
  onSelectTag,
}: {
  totalCount: number;
  activeTag: string | null;
  isCustomFilterActive: boolean;
  customFilterCount: number;
  tagCounts: Record<string, number>;
  onSelectAll: () => void;
  onToggleCustom: () => void;
  onSelectTag: (tag: string) => void;
}) {
  const pillClass = (active: boolean) =>
    `shrink-0 text-[12px] px-3.5 py-[6px] rounded-full font-semibold transition-all ${active ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900" : "bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700"}`;

  return (
    <div className="shrink-0 border-b border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <div className="overflow-x-auto">
        <div className="flex gap-1.5 px-4 py-2">
          <button onClick={onSelectAll} className={pillClass(activeTag === null && !isCustomFilterActive)}>
            전체
            <span className={`ml-1 text-[10px] ${activeTag === null && !isCustomFilterActive ? "text-white/50 dark:text-gray-900/50" : "text-gray-400"}`}>
              {totalCount}
            </span>
          </button>
          <button onClick={onToggleCustom} className={`${pillClass(isCustomFilterActive)} flex items-center gap-1`}>
            <SlidersHorizontal className="w-3 h-3" />
            커스텀
            {isCustomFilterActive && (
              <span className="text-[10px] ml-0.5 text-white/50 dark:text-gray-900/50">
                {customFilterCount}
              </span>
            )}
          </button>
          {allTags.map((tag) => (
            <button key={tag} onClick={() => onSelectTag(tag)} className={pillClass(activeTag === tag)}>
              {tag}
              {tagCounts[tag] > 0 && (
                <span className={`ml-1 text-[10px] ${activeTag === tag ? "text-white/50 dark:text-gray-900/50" : "text-gray-400"}`}>
                  {tagCounts[tag]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function BrandKitView({ brand }: { brand: (typeof brands)[0] }) {
  const toast = useToast();
  const [viewerRes, setViewerRes] = useState<(typeof brand.resources)[0] | null>(null);

  // 서브 브랜드 찾기 (flow → flow-yacht, flow-daily)
  const subBrands = useMemo(
    () => brands.filter((b) => b.id !== brand.id && b.id.startsWith(brand.id + "-")),
    [brand.id]
  );

  const grouped = useMemo(() => {
    const map = new Map<string, typeof brand.resources>();
    for (const res of brand.resources) {
      if (!map.has(res.category)) map.set(res.category, []);
      map.get(res.category)!.push(res);
    }
    // 서브 브랜드 리소스도 추가 (부모와 URL 중복 제외)
    const parentUrls = new Set(brand.resources.map((r) => r.url));
    for (const sub of subBrands) {
      const unique = sub.resources.filter((r) => !parentUrls.has(r.url));
      if (unique.length === 0) continue;
      const cat = sub.displayName;
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(...unique);
    }
    return Array.from(map.entries());
  }, [brand.resources, subBrands]);

  const handleCopy = async (url: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const canvas = document.createElement("canvas");
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = async () => {
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext("2d")?.drawImage(img, 0, 0);
        try {
          const pngBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
          if (pngBlob) {
            await navigator.clipboard.write([new ClipboardItem({ "image/png": pngBlob })]);
            toast("이미지 복사 완료!", { variant: "success" });
          }
        } catch {
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = url.split("/").pop()?.replace(".webp", ".png") || "resource.png";
          a.click();
          toast("다운로드됨", { variant: "info" });
        }
      };
      img.onerror = () => {
        // fallback: 다운로드
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = url.split("/").pop() || "resource.png";
        a.click();
        toast("다운로드됨", { variant: "info" });
      };
      img.src = URL.createObjectURL(blob);
    } catch {
      toast("복사 실패", { variant: "error" });
    }
  };

  return (
    <div className="px-4 py-5">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">{brand.displayName}</h2>
        <p className="text-[13px] text-gray-500 mt-0.5">{brand.description}</p>
        <p className="text-[11px] text-gray-400 mt-2">
          탭하여 미리보기 · 길게 눌러 복사
        </p>
      </div>

      {grouped.map(([category, resources]) => (
        <div key={category} className="mb-6">
          <h3 className="text-[13px] font-bold text-gray-800 dark:text-gray-200 mb-2 px-1">{category}</h3>
          <div className="grid grid-cols-4 gap-2">
            {resources.map((res) => (
              <button
                key={res.key}
                onClick={() => res.type !== "color" && res.type !== "font" ? setViewerRes(res) : undefined}
                className="group bg-white dark:bg-zinc-800 rounded-xl border border-gray-200/60 dark:border-zinc-700 overflow-hidden hover:shadow-lg active:scale-[0.96] transition-all"
              >
                {res.type === "color" ? (
                  <div className="aspect-square flex items-center justify-center" style={{ backgroundColor: res.hex }}>
                    <span className="text-[10px] font-mono font-bold" style={{ color: (res.hex === "#ffffff" || res.hex === "#f4f4f5") ? "#71717a" : "#fff" }}>{res.hex}</span>
                  </div>
                ) : res.type === "font" ? (
                  <div className="aspect-square bg-gray-50 dark:bg-zinc-900 flex items-center justify-center px-2">
                    <span className="text-[18px] text-gray-800 dark:text-gray-200 text-center leading-tight" style={{ fontFamily: res.fontFamily, fontWeight: res.fontWeight }}>가나다 Aa</span>
                  </div>
                ) : (
                  <div className="aspect-square bg-gray-50 dark:bg-zinc-900 flex items-center justify-center p-2.5">
                    <img src={res.url} alt={res.label} className="max-w-full max-h-full object-contain" />
                  </div>
                )}
                <div className="px-1.5 py-1.5 border-t border-gray-100 dark:border-zinc-700">
                  <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 truncate">
                    {res.label}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}

      <Dialog
        open={!!viewerRes}
        onClose={() => setViewerRes(null)}
        size="lg"
      >
        {viewerRes && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-full">
              <p className="text-[14px] font-semibold text-gray-900 dark:text-white">{viewerRes.label}</p>
              <p className="text-[11px] text-gray-400">{viewerRes.category} · {viewerRes.key}</p>
            </div>
            <div className="flex items-center justify-center py-4">
              <img src={viewerRes.url} alt={viewerRes.label} className="max-w-full max-h-[50vh] object-contain rounded-lg" />
            </div>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => handleCopy(viewerRes.url)}
                className="flex-1 px-6 py-3 rounded-xl text-[13px] font-semibold bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 transition-all active:scale-[0.96]"
              >
                이미지 복사
              </button>
              <a
                href={viewerRes.url}
                download={viewerRes.url.split("/").pop()}
                className="px-6 py-3 rounded-xl text-[13px] font-semibold bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors"
              >
                다운로드
              </a>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
