import type { Preview } from "@storybook/react";
import { createElement } from "react";

// Tokens + resets globais aplicados a todas as stories.
import "../src/tokens/tokens.css";
import "../src/styles/global.css";

const preview: Preview = {
  globalTypes: {
    theme: {
      name: "Tema do produto",
      description: "Aplica Refy ou Dommus globalmente a todas as stories",
      defaultValue: "dommus",
      toolbar: {
        icon: "paintbrush",
        items: [
          { value: "dommus", title: "Tema · Dommus — claro" },
          { value: "dommus-admin", title: "Tema · Dommus Admin — P&B" },
          { value: "dommus-dark", title: "Tema · Dommus — escuro" },
          { value: "light", title: "Tema · Refy — claro" },
          { value: "dark", title: "Tema · Refy — escuro" },
          { value: "editorial", title: "Tema · Refy — editorial" },
        ],
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    options: {
      storySort: {
        order: [
          "Produto",
          [
            "Backoffice",
            [
              "Entrada",
              "Visão geral",
              ["Index"],
              "Imobiliárias",
              [
                "Index",
                "Cadastrar imobiliária",
                ["Index"],
                "Detalhes da imobiliária",
                [
                  "Index",
                  "Responsável",
                  "Histórico",
                  "Administração",
                  "Ciclo do cadastro",
                  "Solicitar informações",
                  "Recusar cadastro",
                  "Transferir responsabilidade",
                ],
              ],
              "Usuários",
              ["Index", "*"],
              "Corretores",
              ["Index", "*"],
              "Clientes e buscas",
              ["Index"],
              "Imóveis",
              ["Index"],
              "Fontes e crawlers",
              ["Index"],
              "Pipeline",
              ["Index"],
              "Revisões de dados",
              ["Index"],
              "Entregas",
              "Analítica",
              ["Index"],
              "Parâmetros",
              ["Index"],
              "Versões",
              ["Index"],
              "Auditoria",
              ["Index"],
            ],
            "Imobiliária",
            "Corretor",
            "Cliente",
          ],
        ],
      },
    },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    backgrounds: {
      default: "dommus",
      values: [
        { name: "app", value: "#f2f2f2" },
        { name: "surface", value: "#ffffff" },
        { name: "dark", value: "#101415" },
        { name: "dommus", value: "#f5f6f5" },
        { name: "dommus admin", value: "#f7f7f7" },
        { name: "dommus dark", value: "#15110f" },
      ],
    },
  },
  decorators: [
    (Story, context) =>
      createElement(
        "div",
        {
          "data-theme": context.globals.theme || "light",
          style: {
            minHeight: "100vh",
            width: context.viewMode === "story" && context.parameters.layout === "centered" ? "100vw" : "100%",
            margin: context.viewMode === "story" && context.parameters.layout === "centered" ? -16 : undefined,
            boxSizing: "border-box",
            background: "var(--bg)",
            color: "var(--ink-1)",
          },
        },
        createElement(Story)
      ),
  ],
};

export default preview;
