export type TemplateSegment =
  | { type: "text"; value: string }
  | { type: "variable"; key: string };

const VARIABLE_REGEX = /\{([^}]+)\}/g;

export function parseTemplate(template: string): TemplateSegment[] {
  const segments: TemplateSegment[] = [];
  let lastIndex = 0;

  for (const match of template.matchAll(VARIABLE_REGEX)) {
    const index = match.index!;
    if (index > lastIndex) {
      segments.push({ type: "text", value: template.slice(lastIndex, index) });
    }
    segments.push({ type: "variable", key: match[1] });
    lastIndex = index + match[0].length;
  }

  if (lastIndex < template.length) {
    segments.push({ type: "text", value: template.slice(lastIndex) });
  }

  return segments;
}

export function resolveTemplate(
  template: string,
  values: Record<string, string>
): string {
  return template.replace(VARIABLE_REGEX, (_, key) => values[key] ?? `{${key}}`);
}
