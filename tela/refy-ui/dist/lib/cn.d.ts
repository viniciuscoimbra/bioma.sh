/**
 * cn — junta classes condicionais.
 * Aceita strings, undefined/false (ignorados) e objetos { classe: boolean }.
 *
 *   cn(styles.btn, isActive && styles.active, { [styles.lg]: size === "lg" })
 */
export type ClassValue = string | number | null | undefined | false | Record<string, boolean | undefined | null>;
export declare function cn(...values: ClassValue[]): string;
