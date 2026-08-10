import { useRef, useState } from "react";
import type { ChangeEventHandler, FocusEventHandler } from "react";
import { Button } from "../Button";
import { Input } from "../Input";
import { cn } from "../../lib/cn";
import styles from "./PostalCodeInput.module.css";

export interface PostalCodeAddress {
  postalCode: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface PostalCodeInputProps {
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  lookup: (postalCode: string) => Promise<PostalCodeAddress | null>;
  onAddressFound: (address: PostalCodeAddress) => void;
  name?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  onBlur?: FocusEventHandler<HTMLInputElement>;
}

/** Consulta um CEP e devolve o endereço ao formulário consumidor. */
export function PostalCodeInput({
  value,
  onChange,
  lookup,
  onAddressFound,
  name = "postalCode",
  error,
  disabled,
  className,
  onBlur,
}: PostalCodeInputProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const searching = useRef<string | null>(null);
  const lastFound = useRef<string | null>(null);

  async function search(rawValue = value) {
    const postalCode = rawValue.replace(/\D/g, "");
    if (postalCode.length !== 8) {
      setStatus("error");
      setMessage("Informe um CEP com 8 números.");
      return;
    }
    if (searching.current === postalCode || lastFound.current === postalCode) return;

    searching.current = postalCode;
    setStatus("loading");
    setMessage("Buscando endereço.");
    try {
      const address = await lookup(postalCode);
      if (!address) {
        setStatus("error");
        setMessage("CEP não encontrado. Confira os números e tente novamente.");
        return;
      }
      onAddressFound(address);
      lastFound.current = postalCode;
      setStatus("success");
      setMessage(`Endereço encontrado em ${address.city}, ${address.state}.`);
    } catch {
      setStatus("error");
      setMessage("Não foi possível buscar o CEP. Tente novamente.");
    } finally {
      searching.current = null;
    }
  }

  return (
    <div className={cn(styles.root, className)}>
      <div className={styles.row}>
        <Input
          label="CEP"
          name={name}
          value={value}
          onChange={(event) => {
            event.currentTarget.value = event.currentTarget.value
              .replace(/\D/g, "")
              .slice(0, 8)
              .replace(/^(\d{5})(\d)/, "$1-$2");
            lastFound.current = null;
            setStatus("idle");
            setMessage("");
            onChange(event);
          }}
          onBlur={(event) => {
            onBlur?.(event);
            if (event.currentTarget.value.replace(/\D/g, "").length === 8) {
              void search(event.currentTarget.value);
            }
          }}
          placeholder="00000-000"
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={9}
          error={error}
          disabled={disabled || status === "loading"}
        />
        <Button
          type="button"
          size="sm"
          className={styles.button}
          loading={status === "loading"}
          loadingLabel="Buscando"
          disabled={disabled}
          onClick={() => void search()}
        >
          Buscar CEP
        </Button>
      </div>
      {message && !error && (
        <p className={cn(styles.status, status === "error" && styles.error)} role="status" aria-live="polite">
          {message}
        </p>
      )}
    </div>
  );
}
