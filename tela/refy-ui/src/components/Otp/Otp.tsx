import { forwardRef, useRef, useState } from "react";
import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import styles from "./Otp.module.css";

/** Props for the OTP input group. */
export interface OtpProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  /** Quantidade de dígitos. Padrão 6. */
  length?: number;
  /** Separador "—" a cada N dígitos (ex.: 3 → `392 — 114`). */
  groupSize?: number;
  /** Código controlado (string com até `length` caracteres). */
  value?: string;
  /** Código inicial (não-controlado). */
  defaultValue?: string;
  /** Disparado a cada digitação com o código atual. */
  onChange?: (code: string) => void;
  /** Disparado quando todos os dígitos são preenchidos. */
  onComplete?: (code: string) => void;
  /** Aceita letras além de números. Padrão só dígitos. */
  alphanumeric?: boolean;
  /** Rótulo acessível do grupo. */
  label?: string;
  error?: string;
  disabled?: boolean;
  /** Foca o primeiro campo ao montar. */
  autoFocus?: boolean;
}

/**
 * Otp — código de verificação, um dígito por campo.
 *
 * Digitar avança o foco; Backspace limpa e volta; ←/→ navegam; colar
 * distribui o código inteiro. `groupSize` insere o separador "—" entre
 * grupos. Dispara `onComplete` quando o último dígito entra. Controlado
 * (`value`/`onChange`) ou não-controlado (`defaultValue`).
 *
 *   <Otp length={6} groupSize={3} onComplete={verify} />
 */
export const Otp = forwardRef<HTMLDivElement, OtpProps>(function Otp(
  {
    length = 6,
    groupSize,
    value,
    defaultValue = "",
    onChange,
    onComplete,
    alphanumeric = false,
    label = "Código de verificação",
    error,
    disabled,
    autoFocus,
    className,
    ...rest
  },
  ref
) {
  const [internal, setInternal] = useState(defaultValue.slice(0, length));
  const code = (value !== undefined ? value : internal).slice(0, length);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const allowed = alphanumeric ? /[a-zA-Z0-9]/ : /[0-9]/;

  function commit(next: string) {
    if (value === undefined) setInternal(next);
    onChange?.(next);
    if (next.length === length && !next.includes(" ")) onComplete?.(next);
  }

  function setChar(index: number, char: string) {
    const chars = Array.from({ length }, (_, i) => code[i] ?? " ");
    chars[index] = char;
    // trim de espaços à direita para o código "cru"
    commit(chars.join("").replace(/\s+$/, ""));
  }

  function focusAt(index: number) {
    inputsRef.current[Math.max(0, Math.min(length - 1, index))]?.select();
  }

  function onInput(index: number, raw: string) {
    const chars = raw.split("").filter((c) => allowed.test(c));
    if (!chars.length) return;
    if (chars.length === 1) {
      setChar(index, chars[0]);
      focusAt(index + 1);
      return;
    }
    // colagem de vários dígitos a partir da posição atual
    const merged = Array.from({ length }, (_, i) => code[i] ?? " ");
    chars.slice(0, length - index).forEach((c, k) => {
      merged[index + k] = c;
    });
    commit(merged.join("").replace(/\s+$/, ""));
    focusAt(index + chars.length);
  }

  function onKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case "Backspace":
        e.preventDefault();
        if (code[index] && code[index] !== " ") setChar(index, " ");
        else {
          setChar(index - 1 >= 0 ? index - 1 : 0, " ");
          focusAt(index - 1);
        }
        break;
      case "ArrowLeft":
        e.preventDefault();
        focusAt(index - 1);
        break;
      case "ArrowRight":
        e.preventDefault();
        focusAt(index + 1);
        break;
    }
  }

  const cells = Array.from({ length }, (_, i) => {
    const char = code[i] && code[i] !== " " ? code[i] : "";
    return (
      <input
        key={i}
        ref={(node) => {
          inputsRef.current[i] = node;
        }}
        className={styles.cell}
        type="text"
        inputMode={alphanumeric ? "text" : "numeric"}
        autoComplete={i === 0 ? "one-time-code" : "off"}
        maxLength={length} /* permite colar o código inteiro numa célula */
        aria-label={`Dígito ${i + 1} de ${length}`}
        aria-invalid={error ? true : undefined}
        disabled={disabled}
        autoFocus={autoFocus && i === 0}
        value={char}
        onChange={(e) => onInput(i, e.target.value)}
        onKeyDown={(e) => onKeyDown(i, e)}
        onFocus={(e) => e.target.select()}
      />
    );
  });

  // intercala separadores entre grupos
  const children: React.ReactNode[] = [];
  cells.forEach((cell, i) => {
    if (groupSize && i > 0 && i % groupSize === 0) {
      children.push(
        <span key={`sep-${i}`} className={styles.sep} aria-hidden="true">
          —
        </span>
      );
    }
    children.push(cell);
  });

  return (
    <div className={cn(styles.block, className)} {...rest}>
      <div
        ref={ref}
        role="group"
        aria-label={label}
        className={cn(styles.otp, error && styles.hasError, disabled && styles.disabled)}
      >
        {children}
      </div>
      {error && <p className={styles.help}>{error}</p>}
    </div>
  );
});
