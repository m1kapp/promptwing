"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Heart, Share2, Copy, Download } from "lucide-react";
import {
  Button, InAppSheet, Tooltip, useToast, useShare,
} from "@m1kapp/kit";
import { PromptItem, TemplateVariable } from "@/data/prompts";
import { parseTemplate } from "@/lib/template";
import { useTemplateVariables } from "@/hooks/useTemplateVariables";
import { useReferenceImageBlobs } from "@/hooks/useReferenceImageBlobs";
import {
  SheetTabs, StoryTabBody, PromptSegments, PromptInfoBar, ReferenceStrip, VariableEditDialog,
} from "./PromptSheet";

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

  // 참고 이미지 blob 프리페치 (복사 시 즉시 사용)
  const refImgBlobs = useReferenceImageBlobs(item.referenceImages);

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
        <PromptCardSheet
          item={item}
          open={overlayOpen}
          onClose={() => { setOverlayOpen(false); setEditingVar(null); }}
          sheetTab={sheetTab}
          onTabChange={setSheetTab}
          segments={segments}
          values={values}
          editingVar={editingVar}
          onEditVar={openVarEditor}
          hasVariables={!!hasVariables}
          resolvedPrompt={resolve(item.prompt)}
          onReset={resetAll}
          onCopyImage={handleCopyImage}
          fullscreenImage={fullscreenImage}
          onFullscreen={() => setFullscreenImage(true)}
          onCloseFullscreen={() => setFullscreenImage(false)}
          onCopy={handleCopy}
          onShare={handleShare}
        />

        {/* ===== VARIABLE DIALOG ===== */}
        <VariableEditDialog
          def={currentEditDef}
          editingVar={editingVar}
          values={values}
          editInput={editInput}
          onPick={(value) => { setValue(editingVar!, value); setEditInput(value); }}
          onInputChange={setEditInput}
          onApply={applyVarEdit}
          onClose={() => setEditingVar(null)}
        />
      </div>
    </div>
  );
}

interface PromptCardSheetProps {
  item: PromptItem;
  open: boolean;
  onClose: () => void;
  sheetTab: "image" | "story" | "prompt";
  onTabChange: (tab: "image" | "story" | "prompt") => void;
  segments: ReturnType<typeof parseTemplate>;
  values: Record<string, string>;
  editingVar: string | null;
  onEditVar: (key: string) => void;
  hasVariables: boolean;
  resolvedPrompt: string;
  onReset: () => void;
  onCopyImage: (idx: number) => void;
  fullscreenImage: boolean;
  onFullscreen: () => void;
  onCloseFullscreen: () => void;
  onCopy: () => void;
  onShare: () => void;
}

/** 프롬프트 카드 인앱시트 (이미지 / 본문 / 프롬프트 탭 + 액션) */
function PromptCardSheet({
  item, open, onClose, sheetTab, onTabChange, segments, values, editingVar, onEditVar,
  hasVariables, resolvedPrompt, onReset, onCopyImage, fullscreenImage, onFullscreen, onCloseFullscreen, onCopy, onShare,
}: PromptCardSheetProps) {
  return (
    <InAppSheet open={open} onClose={onClose} fullHeight title={item.title}>
      <div className="flex flex-col h-full">
        <SheetTabs hasImage={!!item.imageUrl} hasStory={!!item.story} active={sheetTab} onChange={onTabChange} />

        {/* 본문 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          {sheetTab === "image" && item.imageUrl && (
            <div className="flex items-center justify-center -mx-5 -my-4" style={{ minHeight: "calc(100% + 2rem)" }}>
              <img src={item.imageUrl} alt={item.title} className="w-full" />
            </div>
          )}
          {sheetTab === "story" && item.story && (
            <StoryTabBody story={item.story} tags={item.tags} />
          )}
          {sheetTab === "prompt" && (
            <PromptSegments segments={segments} values={values} editingVar={editingVar} onEditVar={onEditVar} />
          )}
        </div>

        {/* 이미지 다운로드 — 이미지 탭에서만 */}
        {sheetTab === "image" && item.imageUrl && (
          <ImageDownloadBar imageUrl={item.imageUrl} onFullscreen={onFullscreen} />
        )}

        {/* 풀스크린 이미지 뷰어 — portal to body */}
        <FullscreenImageViewer
          open={fullscreenImage && !!item.imageUrl}
          imageUrl={item.imageUrl}
          title={item.title}
          onClose={onCloseFullscreen}
        />

        {/* 하단 정보 바 — 프롬프트 탭에서만 */}
        {sheetTab === "prompt" && (
          <PromptInfoBar hasVariables={hasVariables} varCount={item.variables?.length ?? 0} resolvedPrompt={resolvedPrompt} onReset={onReset} />
        )}

        {/* 참고 이미지 — 프롬프트 탭에서만 */}
        {sheetTab === "prompt" && item.referenceImages && item.referenceImages.length > 0 && (
          <ReferenceStrip images={item.referenceImages} onCopy={(_ref, idx) => onCopyImage(idx)} />
        )}

        {/* 액션 버튼 — 프롬프트 탭에서만 */}
        {sheetTab === "prompt" && (
        <div className="shrink-0 px-5 py-3 border-t border-gray-100 dark:border-zinc-800 flex gap-2 pb-[calc(12px+env(safe-area-inset-bottom))]">
          <Button onClick={onCopy} className="flex-1 !rounded-xl !h-12">
            <Copy className="w-4 h-4 mr-2" />프롬프트 복사
          </Button>
          <Tooltip label="공유">
            <Button onClick={onShare} className="!rounded-xl !h-12 !px-4 !bg-gray-100 dark:!bg-zinc-800 !text-gray-700 dark:!text-gray-300 hover:!bg-gray-200 dark:hover:!bg-zinc-700">
              <Share2 className="w-4 h-4" />
            </Button>
          </Tooltip>
        </div>
        )}
      </div>
    </InAppSheet>
  );
}

/** 이미지 탭 하단 다운로드 바 (전체 보기 + 다운로드) */
function ImageDownloadBar({ imageUrl, onFullscreen }: { imageUrl: string; onFullscreen: () => void }) {
  return (
    <div className="shrink-0 px-5 py-3 border-t border-gray-100 dark:border-zinc-800 pb-[calc(12px+env(safe-area-inset-bottom))] flex flex-col gap-2">
      <button
        onClick={onFullscreen}
        className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white font-semibold text-sm hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
      >
        전체 보기
      </button>
      <a href={imageUrl} download className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
        <Download className="w-4 h-4" /> 이미지 다운로드
      </a>
    </div>
  );
}

/** 풀스크린 이미지 뷰어 (body로 portal) */
function FullscreenImageViewer({ open, imageUrl, title, onClose }: { open: boolean; imageUrl?: string; title: string; onClose: () => void }) {
  if (!open || !imageUrl || typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[99999] bg-black flex flex-col">
      <div className="absolute top-3 right-3 z-10">
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        >
          <span className="text-lg leading-none">&times;</span>
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center overflow-auto">
        <img src={imageUrl} alt={title} className="w-full h-full object-contain" />
      </div>
      <div className="shrink-0 px-5 py-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
        <a href={imageUrl} download className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-white text-black font-semibold text-sm hover:bg-gray-100 transition-colors">
          <Download className="w-4 h-4" /> 이미지 다운로드
        </a>
      </div>
    </div>,
    document.body,
  );
}
