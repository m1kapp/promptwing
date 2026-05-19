"use client";

import { useState, useMemo } from "react";
import { ChevronDown, X, Shuffle } from "lucide-react";
import { Dialog } from "@m1kapp/kit";
import { customFilterOptions, CustomFilterKey, PromptItem } from "@/data/prompts";

export interface CustomFilterState {
  업종: string | null;
  직무: string | null;
  고객: string | null;
  용도: string | null;
}

const emptyFilter: CustomFilterState = { 업종: null, 직무: null, 고객: null, 용도: null };

const filterLabels: Record<CustomFilterKey, { icon: string; question: string }> = {
  업종: { icon: "🏢", question: "어떤 업종인가요?" },
  직무: { icon: "👤", question: "어떤 일을 하세요?" },
  고객: { icon: "🎯", question: "누구를 위한 건가요?" },
  용도: { icon: "🖼", question: "뭘 만들고 싶으세요?" },
};

interface CustomFilterProps {
  allPrompts: PromptItem[];
  filter: CustomFilterState;
  onFilterChange: (filter: CustomFilterState) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function CustomFilter({
  allPrompts,
  filter,
  onFilterChange,
  isOpen,
  onToggle,
}: CustomFilterProps) {
  const [openSelect, setOpenSelect] = useState<CustomFilterKey | null>(null);

  const optionCounts = useMemo(() => {
    const counts: Record<string, Record<string, number>> = {};
    const keys = Object.keys(customFilterOptions) as CustomFilterKey[];

    for (const key of keys) {
      counts[key] = {};
      for (const option of customFilterOptions[key]) {
        const testFilter = { ...filter, [key]: option };
        const count = allPrompts.filter((p) => {
          for (const k of keys) {
            if (testFilter[k] && p[k] !== testFilter[k]) return false;
          }
          return true;
        }).length;
        counts[key][option] = count;
      }
    }
    return counts;
  }, [filter, allPrompts]);

  const resultCount = useMemo(() => {
    const keys = Object.keys(customFilterOptions) as CustomFilterKey[];
    return allPrompts.filter((p) => {
      for (const k of keys) {
        if (filter[k] && p[k] !== filter[k]) return false;
      }
      return true;
    }).length;
  }, [filter, allPrompts]);

  const handleSelect = (key: CustomFilterKey, value: string) => {
    onFilterChange({ ...filter, [key]: filter[key] === value ? null : value });
    setOpenSelect(null);
  };

  const handleReset = () => {
    onFilterChange(emptyFilter);
    setOpenSelect(null);
  };

  const handleRandom = () => {
    setOpenSelect(null);
    const keys = Object.keys(customFilterOptions) as CustomFilterKey[];
    const combos = new Map<string, CustomFilterState>();
    for (const p of allPrompts) {
      const combo: CustomFilterState = { 업종: p.업종 ?? null, 직무: p.직무 ?? null, 고객: p.고객 ?? null, 용도: p.용도 ?? null };
      const comboKey = keys.map((k) => combo[k] ?? "").join("|");
      if (!combos.has(comboKey)) combos.set(comboKey, combo);
    }
    const arr = Array.from(combos.values());
    if (arr.length === 0) return;
    const picked = arr[Math.floor(Math.random() * arr.length)];
    onFilterChange(picked);
  };

  const handleClose = () => {
    setOpenSelect(null);
    onToggle();
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} title="나에게 맞는 레시피 찾기">
      <p className="text-[11px] text-gray-400 -mt-2 mb-4">조건을 선택하면 맞는 레시피만 보여드려요</p>

      {/* Filter Fields */}
      <div className="space-y-3">
        {(Object.keys(customFilterOptions) as CustomFilterKey[]).map((key) => (
          <div key={key} className="relative">
            <label className="text-[11px] font-semibold text-gray-400 mb-1 block">
              {filterLabels[key].icon} {filterLabels[key].question}
            </label>
            <button
              onClick={() => setOpenSelect(openSelect === key ? null : key)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-[13px] font-medium transition-all ${
                filter[key]
                  ? "border-gray-900 dark:border-white bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                  : "border-gray-200 dark:border-zinc-600 bg-gray-50 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 hover:border-gray-300"
              }`}
            >
              <span>{filter[key] || "전체"}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${openSelect === key ? "rotate-180" : ""} ${filter[key] ? "text-white/50 dark:text-gray-900/50" : "text-gray-400"}`} />
            </button>

            {openSelect === key && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-gray-200/60 dark:border-zinc-700 z-10 max-h-[200px] overflow-y-auto fade-in">
                <button
                  onClick={() => { onFilterChange({ ...filter, [key]: null }); setOpenSelect(null); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-[13px] transition-colors ${
                    !filter[key] ? "bg-gray-50 dark:bg-zinc-700 font-semibold text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-700"
                  }`}
                >
                  <span>전체</span>
                  {!filter[key] && <span className="text-[11px] text-gray-400">✓</span>}
                </button>
                {customFilterOptions[key].map((option) => {
                  const count = optionCounts[key]?.[option] ?? 0;
                  return (
                    <button
                      key={option}
                      onClick={() => count > 0 ? handleSelect(key, option) : undefined}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 text-[13px] transition-colors ${
                        count === 0
                          ? "text-gray-300 dark:text-zinc-600 cursor-not-allowed"
                          : filter[key] === option
                          ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-700"
                      }`}
                    >
                      <span>{option}</span>
                      <span className={`text-[11px] ${
                        filter[key] === option ? "text-white/50 dark:text-gray-900/50" : count === 0 ? "text-gray-300 dark:text-zinc-600" : "text-gray-400"
                      }`}>
                        {count > 0 ? count : "—"}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 mt-4">
        <button
          onClick={handleReset}
          className="py-2.5 px-3 rounded-xl text-[13px] font-semibold text-gray-500 bg-gray-100 dark:bg-zinc-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors"
        >
          초기화
        </button>
        <button
          onClick={handleRandom}
          className="py-2.5 px-3 rounded-xl text-[13px] font-semibold text-gray-500 bg-gray-100 dark:bg-zinc-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors flex items-center gap-1"
        >
          <Shuffle className="w-3.5 h-3.5" />
          랜덤
        </button>
        <button
          onClick={handleClose}
          className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
        >
          적용 · {resultCount}건
        </button>
      </div>
    </Dialog>
  );
}

export { emptyFilter };
