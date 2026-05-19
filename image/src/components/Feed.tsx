"use client";

import { useRef, useEffect, useCallback, useState, useMemo } from "react";
import { ChevronUp, ChevronDown, Heart, Copy, Check, ChevronRight, RotateCcw, Download } from "lucide-react";
import {
  Badge, Button, Dialog, EmptyState, InAppSheet, useToast,
} from "@m1kapp/kit";
import PromptCard from "./PromptCard";
import { PromptItem, TemplateVariable, CustomFilterKey } from "@/data/prompts";
import { CustomFilterState } from "@/components/CustomFilter";
import { parseTemplate } from "@/lib/template";
import { useTemplateVariables } from "@/hooks/useTemplateVariables";

interface FeedProps {
  items: PromptItem[];
  brandId?: string;
  viewMode?: "shorts" | "list";
  customFilter?: CustomFilterState | null;
  onReduceFilter?: (key: CustomFilterKey) => void;
}

export default function Feed({ items, brandId, viewMode = "shorts", customFilter, onReduceFilter }: FeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const jumpingRef = useRef(false);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      const idx = items.findIndex((item) => item.id === hash);
      if (idx >= 0 && viewMode === "shorts") {
        setTimeout(() => {
          const container = containerRef.current;
          if (!container) return;
          const target = container.children[idx] as HTMLElement;
          target?.scrollIntoView({ behavior: "instant" });
          setCurrentIndex(idx);
        }, 100);
      }
    }
  }, [items, viewMode]);

  const scrollToIndex = useCallback(
    (index: number) => {
      if (viewMode !== "shorts" || items.length === 0) return;
      // 무한 루프: 끝 → 처음, 처음 → 끝
      const wrapped = ((index % items.length) + items.length) % items.length;
      const container = containerRef.current;
      if (!container) return;
      const target = container.children[wrapped] as HTMLElement;
      target?.scrollIntoView({ behavior: wrapped === 0 && index >= items.length ? "instant" : "smooth" });
      setCurrentIndex(wrapped);
    },
    [items.length, viewMode]
  );

  const realIndex = useMemo(() => ((currentIndex % items.length) + items.length) % items.length, [currentIndex, items.length]);

  useEffect(() => {
    if (viewMode !== "shorts") return;
    if (items[realIndex]) {
      const newHash = `#${items[realIndex].id}`;
      if (window.location.hash !== newHash) {
        window.history.replaceState(null, "", newHash);
      }
    }
  }, [realIndex, items, viewMode]);

  useEffect(() => {
    if (viewMode !== "shorts") return;
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (jumpingRef.current) return;
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Array.from(container.children).indexOf(
              entry.target as HTMLElement
            );
            if (idx >= 0) setCurrentIndex(idx);
          }
        });
      },
      { root: container, threshold: 0.6 }
    );

    Array.from(container.children).forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, [items, viewMode]);

  // 무한 루프: 마지막 아이템에서 스크롤 끝 도달 시 처음으로
  useEffect(() => {
    if (viewMode !== "shorts") return;
    const container = containerRef.current;
    if (!container || items.length < 2) return;

    let scrollEndTimer: ReturnType<typeof setTimeout>;
    const handleScroll = () => {
      clearTimeout(scrollEndTimer);
      scrollEndTimer = setTimeout(() => {
        const { scrollTop, scrollHeight, clientHeight } = container;
        // 마지막 도달 → 처음으로
        if (scrollTop + clientHeight >= scrollHeight - 2 && currentIndex >= items.length - 1) {
          jumpingRef.current = true;
          const first = container.children[0] as HTMLElement;
          first?.scrollIntoView({ behavior: "instant" });
          setCurrentIndex(0);
          setTimeout(() => { jumpingRef.current = false; }, 100);
        }
      }, 150);
    };
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => { container.removeEventListener("scroll", handleScroll); clearTimeout(scrollEndTimer); };
  }, [viewMode, items.length, currentIndex]);

  useEffect(() => {
    if (viewMode !== "shorts") return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        scrollToIndex(currentIndex + 1);
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        scrollToIndex(currentIndex - 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, scrollToIndex, viewMode]);

  if (items.length === 0) {
    const activeFilters = customFilter
      ? (Object.entries(customFilter) as [CustomFilterKey, string | null][]).filter(([, v]) => v)
      : [];

    return (
      <div className="h-full flex flex-col items-center justify-center px-6">
        <EmptyState message="아직 이 조합의 레시피가 없어요" />
        <p className="text-[13px] text-gray-400 mt-2 mb-5">조건을 줄여보세요</p>
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center">
            {activeFilters.map(([key, value]) => (
              <button
                key={key}
                onClick={() => onReduceFilter?.(key)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-[12px] font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
              >
                {value} 빼고 보기
                <span className="text-gray-400 ml-0.5">×</span>
              </button>
            ))}
          </div>
        )}
        {activeFilters.length === 0 && (
          <p className="text-[13px] text-gray-400">다른 카테고리를 선택해보세요</p>
        )}
      </div>
    );
  }

  if (viewMode === "list") {
    return <ListView items={items} brandId={brandId} />;
  }

  return (
    <div className="relative h-full">
      <div ref={containerRef} className="feed-container">
        {items.map((item, idx) => (
          <PromptCard key={`${brandId}-${item.id}`} item={item} brandId={brandId} priority={idx === 0} />
        ))}
      </div>

      {/* Navigation arrows */}
      <div className="hidden lg:flex fixed right-5 top-1/2 -translate-y-1/2 flex-col gap-2 z-20">
        <Button
          onClick={() => scrollToIndex(currentIndex - 1)}
          className="!rounded-full !w-10 !h-10 !bg-white/80 dark:!bg-zinc-800/80 hover:!bg-white dark:hover:!bg-zinc-700 !shadow-md !border !border-gray-200 dark:!border-zinc-700 !text-gray-700 dark:!text-gray-300"
        >
          <ChevronUp className="w-5 h-5" />
        </Button>

        <Button
          onClick={() => scrollToIndex(currentIndex + 1)}
          className="!rounded-full !w-10 !h-10 !bg-white/80 dark:!bg-zinc-800/80 hover:!bg-white dark:hover:!bg-zinc-700 !shadow-md !border !border-gray-200 dark:!border-zinc-700 !text-gray-700 dark:!text-gray-300"
        >
          <ChevronDown className="w-5 h-5" />
        </Button>
      </div>

    </div>
  );
}

/** 리스트 뷰 + 바텀시트 */
function ListView({ items, brandId }: { items: PromptItem[]; brandId?: string }) {
  const toast = useToast();
  const [selectedItem, setSelectedItem] = useState<PromptItem | null>(null);
  const [sheetTab, setSheetTab] = useState<"image" | "story" | "prompt">("story");
  const [editingVar, setEditingVar] = useState<string | null>(null);
  const [editInput, setEditInput] = useState("");

  const { values, setValue, resetAll, resolve } = useTemplateVariables(selectedItem?.variables);
  const segments = useMemo(() => selectedItem ? parseTemplate(selectedItem.prompt) : [], [selectedItem?.prompt]);
  const variableDefs = useMemo(() => {
    const map: Record<string, TemplateVariable> = {};
    if (selectedItem?.variables) for (const v of selectedItem.variables) map[v.key] = v;
    return map;
  }, [selectedItem?.variables]);
  const hasVariables = selectedItem?.variables && selectedItem.variables.length > 0;

  const openVarEditor = (key: string) => {
    setEditingVar(key);
    setEditInput(values[key] ?? variableDefs[key]?.default ?? "");
  };

  const applyVarEdit = () => {
    if (editingVar && editInput.trim()) setValue(editingVar, editInput.trim());
    setEditingVar(null);
  };

  const currentEditDef = editingVar ? variableDefs[editingVar] : null;

  const handleCopy = async () => {
    if (!selectedItem) return;
    await navigator.clipboard.writeText(resolve(selectedItem.prompt));
    toast("프롬프트 복사 완료!", { variant: "success" });
  };

  const handleCopyImage = async (url: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const canvas = document.createElement("canvas");
      const img = new window.Image();
      img.onload = async () => {
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext("2d")?.drawImage(img, 0, 0);
        canvas.toBlob(async (pngBlob) => {
          if (pngBlob) {
            try {
              await navigator.clipboard.write([new ClipboardItem({ "image/png": pngBlob })]);
              toast("이미지 복사 완료!", { variant: "success" });
            } catch {
              const a = document.createElement("a");
              a.href = URL.createObjectURL(pngBlob);
              a.download = url.split("/").pop() || "reference.png";
              a.click();
              toast("다운로드됨", { variant: "info" });
            }
          }
        }, "image/png");
      };
      img.src = URL.createObjectURL(blob);
    } catch { /* ignore */ }
  };

  const openItem = (item: PromptItem) => {
    setSelectedItem(item);
    setSheetTab(item.imageUrl ? "image" : item.story ? "story" : "prompt");
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-2 p-3 max-w-[900px] mx-auto">
          {items.map((item) => (
            <button
              key={`${brandId}-${item.id}`}
              onClick={() => openItem(item)}
              className="group flex flex-col bg-white dark:bg-zinc-800 rounded-xl border border-gray-200/60 dark:border-zinc-700 overflow-hidden hover:shadow-lg active:scale-[0.97] transition-all text-left"
            >
              <div className="aspect-square bg-gray-50 dark:bg-zinc-900 relative overflow-hidden">
                {item.imageUrl ? (
                  <ListThumbnail src={item.imageUrl} alt={item.title} />
                ) : (
                  <EmptyThumbnail title={item.title} />
                )}
                <div className="absolute bottom-1.5 left-1.5 flex items-center gap-0.5 bg-black/40 backdrop-blur-sm text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full">
                  <Heart className="w-2.5 h-2.5 fill-white" />
                  {item.likes >= 1000 ? `${(item.likes / 1000).toFixed(1)}k` : item.likes}
                </div>
              </div>
              <div className="px-2.5 pt-2.5 pb-1">
                <p className="text-[13px] font-semibold text-gray-800 dark:text-gray-200 leading-snug line-clamp-2">{item.title}</p>
                {item.story && (
                  <p className="text-[11px] text-gray-400 leading-snug line-clamp-2 mt-1">{item.story}</p>
                )}
              </div>
              <div className="flex flex-wrap gap-1 px-2.5 pb-2.5 mt-auto">
                {item.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="default" size="sm">{tag}</Badge>
                ))}
              </div>
            </button>
          ))}
      </div>

      {/* ===== 인앱시트 ===== */}
      <InAppSheet open={!!selectedItem} onClose={() => setSelectedItem(null)} fullHeight title={selectedItem?.title}>
        {selectedItem && (
          <div className="flex flex-col h-full">
            {/* 탭 */}
            <div className="flex px-5 gap-4 border-b border-gray-100 dark:border-zinc-800 shrink-0">
              {selectedItem.imageUrl && (
                <button
                  onClick={() => setSheetTab("image")}
                  className={`py-2 text-[13px] font-semibold border-b-2 transition-colors ${sheetTab === "image" ? "border-gray-900 dark:border-white text-gray-900 dark:text-white" : "border-transparent text-gray-400"}`}
                >
                  이미지
                </button>
              )}
              {selectedItem.story && (
                <button
                  onClick={() => setSheetTab("story")}
                  className={`py-2 text-[13px] font-semibold border-b-2 transition-colors ${sheetTab === "story" ? "border-gray-900 dark:border-white text-gray-900 dark:text-white" : "border-transparent text-gray-400"}`}
                >
                  본문
                </button>
              )}
              <button
                onClick={() => setSheetTab("prompt")}
                className={`py-2 text-[13px] font-semibold border-b-2 transition-colors ${sheetTab === "prompt" ? "border-gray-900 dark:border-white text-gray-900 dark:text-white" : "border-transparent text-gray-400"}`}
              >
                프롬프트
              </button>
            </div>

            {/* 본문 스크롤 영역 */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
              {/* 이미지 탭 */}
              {sheetTab === "image" && selectedItem.imageUrl && (
                <div className="flex items-center justify-center -mx-5 -my-4" style={{ minHeight: "calc(100% + 2rem)" }}>
                  <img src={selectedItem.imageUrl} alt={selectedItem.title} className="w-full" />
                </div>
              )}

              {/* 본문 탭 */}
              {sheetTab === "story" && selectedItem.story && (
                <div className="text-[14px] leading-[1.9] text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  <p>{selectedItem.story}</p>
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {selectedItem.tags.map((tag) => (
                      <span key={tag} className="text-[11px] text-purple-500 font-medium">#{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* 프롬프트 탭 */}
              {sheetTab === "prompt" && (
                <div className="text-[14px] leading-[1.9] text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {segments.map((seg, i) =>
                    seg.type === "text" ? (
                      <span key={i}>{seg.value}</span>
                    ) : (
                      <span
                        key={i}
                        onClick={() => openVarEditor(seg.key)}
                        role="button"
                        className="cursor-pointer"
                        style={{
                          boxDecorationBreak: "clone",
                          WebkitBoxDecorationBreak: "clone" as never,
                          background: editingVar === seg.key
                            ? "linear-gradient(to top, rgba(147,51,234,0.7) 100%, transparent 0%)"
                            : "rgba(192,132,252,0.25)",
                          color: editingVar === seg.key ? "white" : "inherit",
                          borderRadius: "3px",
                          padding: "0 3px",
                        }}
                      >
                        {values[seg.key] ?? seg.key}
                      </span>
                    )
                  )}
                </div>
              )}
            </div>

            {/* 이미지 다운로드 — 이미지 탭에서만 */}
            {sheetTab === "image" && selectedItem.imageUrl && (
              <div className="shrink-0 px-5 py-3 border-t border-gray-100 dark:border-zinc-800 pb-[calc(12px+env(safe-area-inset-bottom))]">
                <a href={selectedItem.imageUrl} download className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
                  <Download className="w-4 h-4" /> 이미지 다운로드
                </a>
              </div>
            )}

            {/* 프롬프트 탭에서만: 정보 바 + 참고 이미지 + 복사 버튼 */}
            {sheetTab === "prompt" && (
              <>
                <div className="shrink-0 px-5 py-2 border-t border-gray-100 dark:border-zinc-800 flex items-center text-[11px] text-gray-400">
                  {hasVariables && (
                    <>
                      <span className="px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-900/30 text-purple-500 font-medium">{selectedItem.variables!.length}개 변수</span>
                      <span className="mx-1.5 text-gray-200 dark:text-zinc-700">|</span>
                    </>
                  )}
                  {(() => {
                    const resolved = resolve(selectedItem.prompt);
                    const chars = resolved.length;
                    const tokens = Math.ceil(resolved.split(/\s+/).length * 1.3);
                    return (
                      <>
                        <span>{chars.toLocaleString()}자</span>
                        <span className="mx-1.5 text-gray-200 dark:text-zinc-700">|</span>
                        <span>~{tokens.toLocaleString()} tokens</span>
                      </>
                    );
                  })()}
                  {hasVariables && (
                    <button onClick={resetAll} className="ml-auto flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                      <RotateCcw className="w-3 h-3" /> 초기화
                    </button>
                  )}
                </div>

                {selectedItem.referenceImages && selectedItem.referenceImages.length > 0 && (
                  <div className="shrink-0 border-t border-gray-100 dark:border-zinc-800 py-3">
                    <div className="px-5 text-[10px] text-gray-400 font-medium mb-2">참고이미지 — 탭하여 복사</div>
                    <div className="flex gap-2 overflow-x-auto px-5 pb-1 scrollbar-hide">
                      {selectedItem.referenceImages.map((ref, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleCopyImage(ref.url)}
                          className="shrink-0 flex flex-col items-center gap-1.5 p-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 hover:border-gray-300 dark:hover:border-zinc-600 hover:bg-white dark:hover:bg-zinc-700 active:scale-95 transition-all"
                          style={{ width: 80 }}
                        >
                          <div className="w-14 h-14 rounded-lg overflow-hidden bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-700">
                            <img src={ref.url} alt={ref.label} className="w-full h-full object-contain" />
                          </div>
                          <span className="text-[9px] leading-tight text-center line-clamp-2 font-medium text-gray-500 dark:text-gray-400">
                            {ref.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="shrink-0 px-5 py-3 border-t border-gray-100 dark:border-zinc-800 flex gap-2 pb-[calc(12px+env(safe-area-inset-bottom))]">
                  <Button onClick={handleCopy} className="flex-1 !rounded-xl !h-12">
                    <Copy className="w-4 h-4 mr-2" /> 프롬프트 복사
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </InAppSheet>

      {/* ===== 변수 편집 다이얼로그 ===== */}
      <Dialog
        open={!!editingVar && !!currentEditDef}
        onClose={() => setEditingVar(null)}
        title={currentEditDef?.key ?? ""}
      >
        {currentEditDef && (
          <div className="space-y-3">
            {currentEditDef.options && currentEditDef.options.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {currentEditDef.options.map((opt) => (
                  <button key={opt.value} onClick={() => { setValue(editingVar!, opt.value); setEditInput(opt.value); }}
                    className={`px-3 py-1.5 rounded-lg text-left transition-colors leading-snug ${values[editingVar!] === opt.value ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900" : "bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-600"}`}>
                    <span className="text-[12px] block">{opt.value}</span>
                    {opt.label !== opt.value && <span className={`text-[10px] block mt-0.5 ${values[editingVar!] === opt.value ? "text-white/60 dark:text-gray-900/60" : "text-gray-400"}`}>{opt.label}</span>}
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input type="text" value={editInput} onChange={(e) => setEditInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") applyVarEdit(); }} autoFocus placeholder="직접 입력..."
                className="flex-1 min-w-0 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-600 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-zinc-500 focus:outline-none focus:border-gray-400 dark:focus:border-zinc-400 focus:ring-2 focus:ring-gray-100 dark:focus:ring-zinc-700" />
              <button onClick={applyVarEdit} className="px-5 py-3 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 rounded-xl text-sm text-white dark:text-gray-900 font-semibold transition-colors shrink-0">적용</button>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}

function ListThumbnail({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);
  if (error) return <EmptyThumbnail title={alt} />;
  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      onError={() => setError(true)}
    />
  );
}

function EmptyThumbnail({ title }: { title: string }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2 px-3 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-800 dark:to-zinc-900">
      <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-700 shadow-sm flex items-center justify-center">
        <span className="text-lg">🪽</span>
      </div>
      <p className="text-[10px] text-gray-400 text-center leading-tight line-clamp-2">{title}</p>
    </div>
  );
}
