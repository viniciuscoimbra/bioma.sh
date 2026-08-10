// Permite importar *.module.css em arquivos .tsx com tipagem.
declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.svg" {
  const src: string;
  export default src;
}

interface ImportMeta {
  glob<T = unknown>(
    pattern: string,
    options: { eager: true; query?: string; import?: string }
  ): Record<string, T>;
}
