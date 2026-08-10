import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  // Uma story por componente, ao lado do próprio componente.
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-essentials"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  // Gera a página Docs de cada componente marcado com tags: ["autodocs"].
  docs: { autodocs: "tag" },
};

export default config;
