export type VisitAvailability = Record<string, string[]>;
export interface VisitSchedulePickerProps {
    value?: VisitAvailability;
    defaultValue?: VisitAvailability;
    onChange?: (value: VisitAvailability) => void;
    defaultActiveDate?: Date;
    minDate?: Date;
    maxDate?: Date;
    timezone?: string;
    unavailable?: VisitAvailability;
    disabled?: boolean;
    className?: string;
}
export declare function groupVisitTimes(times: string[]): string[];
/** Escolha de disponibilidades para visita com resumo agrupado e timezone explícito. */
export declare function VisitSchedulePicker({ value, defaultValue, onChange, defaultActiveDate, minDate, maxDate, timezone, unavailable, disabled, className, }: VisitSchedulePickerProps): import("react").JSX.Element;
