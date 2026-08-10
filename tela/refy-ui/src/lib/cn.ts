/**
 * cn — junta classes condicionais.
 * Aceita strings, undefined/false (ignorados) e objetos { classe: boolean }.
 *
 *   cn(styles.btn, isActive && styles.active, { [styles.lg]: size === "lg" })
 */
export type ClassValue =
  | string
  | number
  | null
  | undefined
  | false
  | Record<string, boolean | undefined | null>;

export function cn(...values: ClassValue[]): string {
  const out: string[] = [];
  for (const v of values) {
    if (!v) continue;
    if (typeof v === "string" || typeof v === "number") {
      out.push(String(v));
    } else if (typeof v === "object") {
      for (const key in v) {
        if (v[key]) out.push(key);
      }
    }
  }
  return out.join(" ");
}
