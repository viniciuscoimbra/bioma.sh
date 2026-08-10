import type { InputHTMLAttributes } from "react";
export interface PhoneCountry {
    code: string;
    name: string;
    callingCode: string;
    flag: string;
}
export declare const phoneCountries: PhoneCountry[];
export interface PhoneInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
    label?: string;
    hint?: string;
    error?: string;
    country?: string;
    countries?: PhoneCountry[];
    onCountryChange?: (country: PhoneCountry) => void;
    onChange?: InputHTMLAttributes<HTMLInputElement>["onChange"];
}
export declare function formatBrazilianPhone(value: string): string;
/** Telefone com país e código internacional explícitos no mesmo campo. */
export declare const PhoneInput: import("react").ForwardRefExoticComponent<PhoneInputProps & import("react").RefAttributes<HTMLInputElement>>;
