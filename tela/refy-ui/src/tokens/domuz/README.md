# Domuz Typography Kit

Pacote de tokens tipográficos para design e desenvolvimento.

## Arquitetura oficial

- **Chillax SemiBold 600**: somente o wordmark `domuz`.
- **General Sans SemiBold/Bold**: títulos, displays e métricas.
- **Inter 400/500/600**: interface e textos.
- **JetBrains Mono 400/500/600**: breadcrumbs, overlines, IDs e código.

## Arquivos

- `domuz-typography.tokens.json`: formato DTCG.
- `domuz-typography.tokens-studio.json`: importação no Tokens Studio/Figma.
- `domuz-typography.css`: variáveis e classes CSS.
- `domuz-typography.scss`: mapas, funções e mixins SCSS.
- `domuz-typography.ts`: objeto TypeScript.
- `domuz-tailwind-preset.js`: preset de tipografia para Tailwind.
- `domuz-font-face.example.css`: exemplo de carregamento local.
- `domuz-typography-spec.md`: documentação do sistema.
- `font-manifest.json`: famílias, pesos e fontes oficiais.

## Importação no Figma

1. Instale o plugin Tokens Studio.
2. Importe `domuz-typography.tokens-studio.json`.
3. Crie os estilos tipográficos a partir do grupo `typography`.
4. Mantenha Chillax restrita ao componente oficial de assinatura.
5. Transforme a assinatura final em vetor.

## Regra do lockup

O componente horizontal deve usar Auto Layout com `align-items: center`.
Nunca alinhar o wordmark pela baseline nem aplicar deslocamento vertical manual.
