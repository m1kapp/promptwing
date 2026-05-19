"use client";

import { useState, useCallback, useMemo } from "react";
import { resolveTemplate } from "@/lib/template";
import { TemplateVariable } from "@/data/prompts";

export function useTemplateVariables(variables?: TemplateVariable[]) {
  const defaults = useMemo(() => {
    const map: Record<string, string> = {};
    if (variables) {
      for (const v of variables) {
        map[v.key] = v.default;
      }
    }
    return map;
  }, [variables]);

  const [values, setValues] = useState<Record<string, string>>(defaults);

  const setValue = useCallback((key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetAll = useCallback(() => {
    setValues(defaults);
  }, [defaults]);

  const resolve = useCallback(
    (template: string) => resolveTemplate(template, values),
    [values]
  );

  return { values, setValue, resetAll, resolve };
}
