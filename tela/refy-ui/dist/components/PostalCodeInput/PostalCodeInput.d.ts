import type { ChangeEventHandler, FocusEventHandler } from "react";
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
export declare function PostalCodeInput({ value, onChange, lookup, onAddressFound, name, error, disabled, className, onBlur, }: PostalCodeInputProps): import("react").JSX.Element;
