export type ProductContextFixture = {
  id: "platform" | "agency-admin" | "broker-personal" | "broker-agency" | "client";
  area: string;
  persona: string;
  destination: string;
  initials: string;
  entity: string;
};

/** Dados fictícios e estáveis para capturas comparáveis; nunca representam sessão real. */
export const productContextFixtures = [
  {
    id: "platform",
    area: "Backoffice Domuz.app",
    persona: "Administrador Domuz.app",
    destination: "/plataforma/visao-geral",
    initials: "DP",
    entity: "Operação global",
  },
  {
    id: "agency-admin",
    area: "Administrador da imobiliária",
    persona: "Marina Almeida",
    destination: "/imobiliarias/imobiliaria-horizonte/visao-geral",
    initials: "IH",
    entity: "Imobiliária Horizonte",
  },
  {
    id: "broker-personal",
    area: "Corretor — Minha operação",
    persona: "Rafael Costa",
    destination: "/corretor/minha-operacao/visao-geral",
    initials: "RC",
    entity: "Operação pessoal",
  },
  {
    id: "broker-agency",
    area: "Corretor — Imobiliária",
    persona: "Rafael Costa",
    destination: "/corretor/imobiliarias/imobiliaria-horizonte/visao-geral",
    initials: "IH",
    entity: "Imobiliária Horizonte",
  },
  {
    id: "client",
    area: "Cliente",
    persona: "Joana Martins",
    destination: "/cliente/imoveis",
    initials: "JM",
    entity: "Imóveis ideais",
  },
] as const satisfies readonly ProductContextFixture[];

export const validationViewports = {
  desktop1440: {
    name: "Desktop · 1440 × 900",
    styles: { width: "1440px", height: "900px" },
  },
  mobile390: {
    name: "Mobile · 390 × 844",
    styles: { width: "390px", height: "844px" },
  },
};
