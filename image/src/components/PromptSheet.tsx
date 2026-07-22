"use client";

import { RotateCcw } from "lucide-react";
import { Dialog } from "@m1kapp/kit";
import { TemplateSegment } from "@/lib/template";
import { TemplateVariable } from "@/data/prompts";

export type SheetTab = "image" | "story" | "prompt";

/** 인앱시트 상단 탭 (이미지 / 본문 / 프롬프트) */
export function SheetTabs({
  hasImage,
  hasStory,
  active,
  onChange,
}: {
  hasImage: boolean;
  hasStory: boolean;
  active: SheetTab;
  onChange: (tab: SheetTab) => void;
}) {
  const tabClass = (tab: SheetTab) =>
    `py-2 text-[13px] font-semibold border-b-2 transition-colors ${active === tab ? "border-gray-900 dark:border-white text-gray-900 dark:text-white" : "border-transparent text-gray-400"}`;

  return (
    <div className="flex px-5 gap-4 border-b border-gray-100 dark:border-zinc-800 shrink-0">
      {hasImage && (
        <button onClick={() => onChange("image")} className={tabClass("image")}>
          이미지
        </button>
      )}
      {hasStory && (
        <button onClick={() => onChange("story")} className={tabClass("story")}>
          본문
        </button>
      )}
      <button onClick={() => onChange("prompt")} className={tabClass("prompt")}>
        프롬프트
      </button>
    </div>
  );
}

/** 본문(스토리) 탭 내용 */
export function StoryTabBody({ story, tags }: { story: string; tags: string[] }) {
  return (
    <div className="text-[14px] leading-[1.9] text-gray-700 dark:text-gray-300 whitespace-pre-line">
      <p>{story}</p>
      <div className="flex flex-wrap gap-1.5 mt-4">
        {tags.map((tag) => (
          <span key={tag} className="text-[11px] text-purple-500 font-medium">#{tag}</span>
        ))}
      </div>
    </div>
  );
}

/** 프롬프트 탭 — 변수 인라인 편집이 가능한 세그먼트 렌더링 */
export function PromptSegments({
  segments,
  values,
  editingVar,
  onEditVar,
}: {
  segments: TemplateSegment[];
  values: Record<string, string>;
  editingVar: string | null;
  onEditVar: (key: string) => void;
}) {
  return (
    <div className="text-[14px] leading-[1.9] text-gray-700 dark:text-gray-300 whitespace-pre-line">
      {segments.map((seg, i) =>
        seg.type === "text" ? (
          <span key={i}>{seg.value}</span>
        ) : (
          <span
            key={i}
            onClick={() => onEditVar(seg.key)}
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
  );
}

/** 프롬프트 탭 하단 정보 바 (변수 개수 · 글자수 · 토큰 · 초기화) */
export function PromptInfoBar({
  hasVariables,
  varCount,
  resolvedPrompt,
  onReset,
}: {
  hasVariables: boolean;
  varCount: number;
  resolvedPrompt: string;
  onReset: () => void;
}) {
  const chars = resolvedPrompt.length;
  const tokens = Math.ceil(resolvedPrompt.split(/\s+/).length * 1.3);

  return (
    <div className="shrink-0 px-5 py-2 border-t border-gray-100 dark:border-zinc-800 flex items-center text-[11px] text-gray-400">
      {hasVariables && (
        <>
          <span className="px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-900/30 text-purple-500 font-medium">{varCount}개 변수</span>
          <span className="mx-1.5 text-gray-200 dark:text-zinc-700">|</span>
        </>
      )}
      <span>{chars.toLocaleString()}자</span>
      <span className="mx-1.5 text-gray-200 dark:text-zinc-700">|</span>
      <span>~{tokens.toLocaleString()} tokens</span>
      {hasVariables && (
        <button onClick={onReset} className="ml-auto flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          <RotateCcw className="w-3 h-3" /> 초기화
        </button>
      )}
    </div>
  );
}

/** 참고 이미지 가로 스크롤 스트립 (탭하여 복사) */
export function ReferenceStrip({
  images,
  onCopy,
}: {
  images: { url: string; label: string }[];
  onCopy: (ref: { url: string; label: string }, idx: number) => void;
}) {
  return (
    <div className="shrink-0 border-t border-gray-100 dark:border-zinc-800 py-3">
      <div className="px-5 text-[10px] text-gray-400 font-medium mb-2">참고이미지 — 탭하여 복사</div>
      <div className="flex gap-2 overflow-x-auto px-5 pb-1 scrollbar-hide">
        {images.map((ref, idx) => (
          <button
            key={idx}
            onClick={() => onCopy(ref, idx)}
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
  );
}

/** 변수 편집 다이얼로그 (옵션 선택 + 직접 입력) */
export function VariableEditDialog({
  def,
  editingVar,
  values,
  editInput,
  onPick,
  onInputChange,
  onApply,
  onClose,
}: {
  def: TemplateVariable | null;
  editingVar: string | null;
  values: Record<string, string>;
  editInput: string;
  onPick: (value: string) => void;
  onInputChange: (value: string) => void;
  onApply: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog open={!!editingVar && !!def} onClose={onClose} title={def?.key ?? ""}>
      {def && (
        <div className="space-y-3">
          {def.options && def.options.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {def.options.map((opt) => (
                <button key={opt.value} onClick={() => onPick(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-left transition-colors leading-snug ${values[editingVar!] === opt.value ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900" : "bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-600"}`}>
                  <span className="text-[12px] block">{opt.value}</span>
                  {opt.label !== opt.value && <span className={`text-[10px] block mt-0.5 ${values[editingVar!] === opt.value ? "text-white/60 dark:text-gray-900/60" : "text-gray-400"}`}>{opt.label}</span>}
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input type="text" value={editInput} onChange={(e) => onInputChange(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") onApply(); }} autoFocus placeholder="직접 입력..."
              className="flex-1 min-w-0 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-600 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-zinc-500 focus:outline-none focus:border-gray-400 dark:focus:border-zinc-400 focus:ring-2 focus:ring-gray-100 dark:focus:ring-zinc-700" />
            <button onClick={onApply} className="px-5 py-3 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 rounded-xl text-sm text-white dark:text-gray-900 font-semibold transition-colors shrink-0">적용</button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
