"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Heart, Copy, Check, Share2, RotateCcw, Download } from "lucide-react";
import {
  Avatar, Button, Dialog, InAppSheet, Tooltip, useToast, useShare,
} from "@m1kapp/kit";
import { PromptItem, TemplateVariable } from "@/data/prompts";
import { parseTemplate } from "@/lib/template";
import { useTemplateVariables } from "@/hooks/useTemplateVariables";

interface PromptCardProps {
  item: PromptItem;
  brandId?: string;
  priority?: boolean;
}

export default function PromptCard({ item, brandId, priority }: PromptCardProps) {
  const toast = useToast();
  const [liked, setLiked] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => { setImgError(false); }, [brandId, item.imageUrl]);
  const [animatingHeart, setAnimatingHeart] = useState(false);
  const [editingVar, setEditingVar] = useState<string | null>(null);
  const [editInput, setEditInput] = useState("");
  const [sheetTab, setSheetTab] = useState<"image" | "story" | "prompt">("story");
  const [fullscreenImage, setFullscreenImage] = useState(false);
  const refImgBlobs = useRef<Map<number, Blob>>(new Map());

  // Pre-fetch all reference image blobs
  useEffect(() => {
    if (item.referenceImages) {
      item.referenceImages.forEach((ref, idx) => {
        fetch(ref.url)
          .then((res) => res.blob())
          .then((blob) => {
            const canvas = document.createElement("canvas");
            const img = new window.Image();
            img.onload = () => {
              canvas.width = img.width;
              canvas.height = img.height;
              canvas.getContext("2d")?.drawImage(img, 0, 0);
              canvas.toBlob((pngBlob) => {
                if (pngBlob) refImgBlobs.current.set(idx, pngBlob);
              }, "image/png");
            };
            img.src = URL.createObjectURL(blob);
          })
          .catch(() => {});
      });
    }
  }, [item.referenceImages]);

  const { values, setValue, resetAll, resolve } = useTemplateVariables(item.variables);
  const segments = useMemo(() => parseTemplate(item.prompt), [item.prompt]);
  const variableDefs = useMemo(() => {
    const map: Record<string, TemplateVariable> = {};
    if (item.variables) for (const v of item.variables) map[v.key] = v;
    return map;
  }, [item.variables]);
  const hasVariables = item.variables && item.variables.length > 0;

  const { share } = useShare({
    url: typeof window !== "undefined"
      ? `${window.location.origin}${window.location.pathname}#${item.id}`
      : "",
    title: item.title,
  });

  const handleLike = useCallback(() => {
    if (!liked) { setLiked(true); setAnimatingHeart(true); setTimeout(() => setAnimatingHeart(false), 600); }
  }, [liked]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(resolve(item.prompt));
    toast("프롬프트 복사 완료!", { variant: "success" });
  }, [item.prompt, resolve, toast]);

  const handleCopyImage = useCallback(async (idx: number) => {
    const blob = refImgBlobs.current.get(idx);
    if (!blob) return;
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      toast("이미지 복사 완료!", { variant: "success" });
    } catch {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "reference.png";
      a.click();
      toast("다운로드됨", { variant: "info" });
    }
  }, [toast]);

  const handleShare = useCallback(async () => {
    await share();
  }, [share]);

  const handleDoubleTap = useCallback(() => {
    if (!liked) { setLiked(true); setAnimatingHeart(true); setTimeout(() => setAnimatingHeart(false), 600); }
  }, [liked]);

  const openVarEditor = (key: string) => {
    setEditingVar(key);
    setEditInput(values[key] ?? variableDefs[key]?.default ?? "");
  };

  const applyVarEdit = () => {
    if (editingVar && editInput.trim()) setValue(editingVar, editInput.trim());
    setEditingVar(null);
  };

  const currentEditDef = editingVar ? variableDefs[editingVar] : null;

  return (
    <div className="feed-item relative flex items-center justify-center bg-black">
      {/* Card */}
      <div
        className="relative w-full h-full bg-black overflow-hidden"
        onWheel={(e) => { if (overlayOpen) e.stopPropagation(); }}
        onTouchMove={(e) => { if (overlayOpen) e.stopPropagation(); }}
      >
        {/* Image */}
        <div className="absolute inset-0 cursor-pointer" onClick={() => { setSheetTab("image"); setOverlayOpen(true); }} onDoubleClick={handleDoubleTap}>
          <div className="absolute inset-0 bg-black" />
          {item.imageUrl && !imgError ? (
            <Image src={item.imageUrl} alt={resolve(item.prompt)} fill className="object-contain" sizes="480px" priority={priority} loading={priority ? "eager" : "lazy"} onError={() => setImgError(true)} />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-zinc-900 to-black">
              <div className="w-16 h-16 rounded-2xl bg-zinc-800 shadow-sm flex items-center justify-center">
                <span className="text-3xl">🪽</span>
              </div>
              <div className="text-center">
                <p className="text-[13px] font-semibold text-gray-400">이미지 미생성</p>
                <p className="text-[11px] text-gray-500 mt-1">프롬프트를 복사하여 AI로 생성해보세요</p>
              </div>
            </div>
          )}
          {animatingHeart && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <Heart className="w-24 h-24 fill-red-500 text-red-500 heart-pop drop-shadow-lg" />
            </div>
          )}
        </div>

        {/* Right actions */}
        <div className={`absolute right-3 bottom-28 flex flex-col items-center gap-5 z-10 transition-opacity duration-200 ${overlayOpen ? "opacity-0 pointer-events-none" : ""}`}>
          <Tooltip label={liked ? "좋아요 취소" : "좋아요"}>
            <button onClick={handleLike}>
              <Heart className={`w-7 h-7 drop-shadow-md transition-all ${liked ? "fill-red-500 text-red-500 scale-110" : "text-white hover:text-red-300"}`} />
            </button>
          </Tooltip>
          <Tooltip label="공유">
            <button onClick={handleShare}>
              <Share2 className="w-6 h-6 text-white drop-shadow-md hover:text-blue-300 transition-colors" />
            </button>
          </Tooltip>
        </div>

        {/* Bottom info — overlay on image */}
        <div className={`absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black from-0% via-black/70 via-40% to-transparent px-4 pb-3 pt-20 transition-opacity duration-200 ${overlayOpen ? "opacity-0 pointer-events-none" : ""}`}>
          <p className="text-[16px] text-white font-bold truncate">{item.title}</p>
          {item.story && (
            <p className="text-[12.5px] text-white/50 line-clamp-2 mt-0.5 leading-relaxed">{item.story}</p>
          )}
          <div className="flex items-center justify-between mt-1.5">
            <div className="flex gap-1.5">
              {item.tags.map(t => (
                <span key={t} className="text-[12px] text-white/30 font-medium">#{t}</span>
              ))}
            </div>
            <div className="flex gap-3 shrink-0">
              <button onClick={() => { setSheetTab(item.imageUrl ? "image" : item.story ? "story" : "prompt"); setOverlayOpen(true); }} className="text-[11px] text-white/50 underline underline-offset-2 hover:text-white transition-colors">
                더 보기
              </button>
              <button onClick={() => { setSheetTab("prompt"); setOverlayOpen(true); }} className="text-[11px] text-white/50 underline underline-offset-2 hover:text-white transition-colors">
                프롬프트
              </button>
            </div>
          </div>
        </div>


        {/* ===== 인앱시트 ===== */}
        <InAppSheet open={overlayOpen} onClose={() => { setOverlayOpen(false); setEditingVar(null); }} fullHeight title={item.title}>
          <div className="flex flex-col h-full">
            {/* 탭 */}
            <div className="flex px-5 gap-4 border-b border-gray-100 dark:border-zinc-800 shrink-0">
              {item.imageUrl && (
                <button
                  onClick={() => setSheetTab("image")}
                  className={`py-2 text-[13px] font-semibold border-b-2 transition-colors ${sheetTab === "image" ? "border-gray-900 dark:border-white text-gray-900 dark:text-white" : "border-transparent text-gray-400"}`}
                >
                  이미지
                </button>
              )}
              {item.story && (
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
              {sheetTab === "image" && item.imageUrl && (
                <div className="flex items-center justify-center -mx-5 -my-4" style={{ minHeight: "calc(100% + 2rem)" }}>
                  <img src={item.imageUrl} alt={item.title} className="w-full" />
                </div>
              )}

              {/* 본문 탭 */}
              {sheetTab === "story" && item.story && (
                <div className="text-[14px] leading-[1.9] text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  <p>{item.story}</p>
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {item.tags.map((tag) => (
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
            {sheetTab === "image" && item.imageUrl && (
              <div className="shrink-0 px-5 py-3 border-t border-gray-100 dark:border-zinc-800 pb-[calc(12px+env(safe-area-inset-bottom))] flex flex-col gap-2">
                <button
                  onClick={() => setFullscreenImage(true)}
                  className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white font-semibold text-sm hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  전체 보기
                </button>
                <a href={item.imageUrl} download className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
                  <Download className="w-4 h-4" /> 이미지 다운로드
                </a>
              </div>
            )}

            {/* 풀스크린 이미지 뷰어 — portal to body */}
            {fullscreenImage && item.imageUrl && typeof document !== "undefined" && createPortal(
              <div className="fixed inset-0 z-[99999] bg-black flex flex-col">
                <div className="absolute top-3 right-3 z-10">
                  <button
                    onClick={() => setFullscreenImage(false)}
                    className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                  >
                    <span className="text-lg leading-none">&times;</span>
                  </button>
                </div>
                <div className="flex-1 flex items-center justify-center overflow-auto">
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-contain" />
                </div>
                <div className="shrink-0 px-5 py-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
                  <a href={item.imageUrl} download className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-white text-black font-semibold text-sm hover:bg-gray-100 transition-colors">
                    <Download className="w-4 h-4" /> 이미지 다운로드
                  </a>
                </div>
              </div>,
              document.body,
            )}

            {/* 하단 정보 바 — 프롬프트 탭에서만 */}
            {sheetTab === "prompt" && (
            <div className="shrink-0 px-5 py-2 border-t border-gray-100 dark:border-zinc-800 flex items-center text-[11px] text-gray-400">
              {hasVariables && (
                <>
                  <span className="px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-900/30 text-purple-500 font-medium">{item.variables!.length}개 변수</span>
                  <span className="mx-1.5 text-gray-200 dark:text-zinc-700">|</span>
                </>
              )}
              {(() => {
                const resolved = resolve(item.prompt);
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
            )}

            {/* 참고 이미지 — 프롬프트 탭에서만 */}
            {sheetTab === "prompt" && item.referenceImages && item.referenceImages.length > 0 && (
              <div className="shrink-0 border-t border-gray-100 dark:border-zinc-800 py-3">
                <div className="px-5 text-[10px] text-gray-400 font-medium mb-2">참고이미지 — 탭하여 복사</div>
                <div className="flex gap-2 overflow-x-auto px-5 pb-1 scrollbar-hide">
                  {item.referenceImages.map((ref, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleCopyImage(idx)}
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

            {/* 액션 버튼 — 프롬프트 탭에서만 */}
            {sheetTab === "prompt" && (
            <div className="shrink-0 px-5 py-3 border-t border-gray-100 dark:border-zinc-800 flex gap-2 pb-[calc(12px+env(safe-area-inset-bottom))]">
              <Button onClick={handleCopy} className="flex-1 !rounded-xl !h-12">
                <Copy className="w-4 h-4 mr-2" />프롬프트 복사
              </Button>
              <Tooltip label="공유">
                <Button onClick={handleShare} className="!rounded-xl !h-12 !px-4 !bg-gray-100 dark:!bg-zinc-800 !text-gray-700 dark:!text-gray-300 hover:!bg-gray-200 dark:hover:!bg-zinc-700">
                  <Share2 className="w-4 h-4" />
                </Button>
              </Tooltip>
            </div>
            )}
          </div>
        </InAppSheet>

        {/* ===== VARIABLE DIALOG ===== */}
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
      </div>
    </div>
  );
}
