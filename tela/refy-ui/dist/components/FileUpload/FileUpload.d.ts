export type FileUploadState = "idle" | "uploading" | "success" | "error";
export interface FileUploadProps {
    files?: File[];
    defaultFiles?: File[];
    onFilesChange?: (files: File[]) => void;
    accept?: string;
    multiple?: boolean;
    maxSize?: number;
    state?: FileUploadState;
    progress?: number;
    errorMessage?: string;
    disabled?: boolean;
    label?: string;
    hint?: string;
    className?: string;
}
/** Upload sobre input nativo; seleção, drag/drop e remoção mantêm o File[] no consumidor. */
export declare function FileUpload({ files, defaultFiles, onFilesChange, accept, multiple, maxSize, state, progress, errorMessage, disabled, label, hint, className, }: FileUploadProps): import("react").JSX.Element;
