# Domuz Brand Assets

Fonte de verdade dos assets de marca usados pelo design system.

## Gerar

```bash
npm --prefix refy-ui run brand:generate
```

O script usa `domuz-mark-black.png` para o símbolo e Chillax SemiBold 600 para transformar `domuz` em path vetorial.

O padrão temporário das telas em construção é `logos/domuz-lockup-solid-theme.svg`. O modo sólido/gestalt preenche os counters internos do D; os traços da versão de linha viram vazios. Não use a versão de linha como sólido.

## Lista

`domuz-brand-assets.manifest.json` lista:

- 24 SVGs de logo: linha e sólido/gestalt, com escrito e sem escrito, em tema, preto, branco, orgulho LGBTQIA+, visibilidade trans e Copa do Mundo.
- 18 ícones: favicon, Apple touch icon, Android Chrome, PWA maskable e SVGs mestres.
- 10 aplicações: web header, app splash, Instagram post, Instagram story, avatar social, capa social, capa de apresentação, anúncio de feed, assinatura de e-mail e cartão.

## Uso

- `logos/`: arquivos finais para comunicação, produto e materiais institucionais.
- `icons/`: tamanhos prontos para site, mobile e PWA.
- `applications/`: templates SVG para validar contexto de uso.
- PNGs na raiz: pranchas originais do brand book.
