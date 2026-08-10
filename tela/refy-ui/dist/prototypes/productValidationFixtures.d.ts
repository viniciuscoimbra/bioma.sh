export type ProductContextFixture = {
    id: "platform" | "agency-admin" | "broker-personal" | "broker-agency" | "client";
    area: string;
    persona: string;
    destination: string;
    initials: string;
    entity: string;
};
/** Dados fictícios e estáveis para capturas comparáveis; nunca representam sessão real. */
export declare const productContextFixtures: readonly [{
    readonly id: "platform";
    readonly area: "Backoffice Domuz.app";
    readonly persona: "Administrador Domuz.app";
    readonly destination: "/plataforma/visao-geral";
    readonly initials: "DP";
    readonly entity: "Operação global";
}, {
    readonly id: "agency-admin";
    readonly area: "Administrador da imobiliária";
    readonly persona: "Marina Almeida";
    readonly destination: "/imobiliarias/imobiliaria-horizonte/visao-geral";
    readonly initials: "IH";
    readonly entity: "Imobiliária Horizonte";
}, {
    readonly id: "broker-personal";
    readonly area: "Corretor — Minha operação";
    readonly persona: "Rafael Costa";
    readonly destination: "/corretor/minha-operacao/visao-geral";
    readonly initials: "RC";
    readonly entity: "Operação pessoal";
}, {
    readonly id: "broker-agency";
    readonly area: "Corretor — Imobiliária";
    readonly persona: "Rafael Costa";
    readonly destination: "/corretor/imobiliarias/imobiliaria-horizonte/visao-geral";
    readonly initials: "IH";
    readonly entity: "Imobiliária Horizonte";
}, {
    readonly id: "client";
    readonly area: "Cliente";
    readonly persona: "Joana Martins";
    readonly destination: "/cliente/imoveis";
    readonly initials: "JM";
    readonly entity: "Imóveis ideais";
}];
export declare const validationViewports: {
    desktop1440: {
        name: string;
        styles: {
            width: string;
            height: string;
        };
    };
    mobile390: {
        name: string;
        styles: {
            width: string;
            height: string;
        };
    };
};
