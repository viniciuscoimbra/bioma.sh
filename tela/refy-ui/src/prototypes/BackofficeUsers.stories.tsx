import type { Meta, StoryObj } from "@storybook/react";
import {
  PlatformUserDetailPage,
  PlatformUsersPage,
  platformUsers,
} from "./BackofficeAgencyFlow";
import { BackofficeProfilesPage } from "./BackofficeProfiles";
import { validationViewports } from "./productValidationFixtures";

const meta = {
  id: "produto-backoffice-usuários",
  title: "Produto/Backoffice/Usuários/Index",
  component: PlatformUsersPage,
  parameters: {
    layout: "fullscreen",
    viewport: {
      options: validationViewports,
      defaultViewport: "desktop1440",
    },
  },
  globals: {
    theme: "dommus-admin",
  },
} satisfies Meta<typeof PlatformUsersPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const T01BUsers: Story = { name: "Index" };

export const T01BUserDetail: Story = {
  name: "T01B · Detalhe do usuário",
  render: () => <PlatformUserDetailPage />,
};

export const T01BUserRoles: Story = {
  name: "T01B · Vínculos",
  render: () => <PlatformUserDetailPage initialView="roles" />,
};

export const T01BUserAccess: Story = {
  name: "T01B · Permissões",
  render: () => <PlatformUserDetailPage user={platformUsers[3]} initialView="access" />,
};

export const T01BUserAccessSaveError: Story = {
  name: "T01B · Permissões · Erro ao salvar",
  render: () => <PlatformUserDetailPage user={platformUsers[3]} initialView="access" accessSaveMode="error" />,
};

export const T01BUserAccessReadOnly: Story = {
  name: "T01B · Permissões · Somente leitura",
  render: () => <PlatformUserDetailPage user={platformUsers[3]} initialView="access" accessSaveMode="readonly" />,
};

export const T01BUserSecurity: Story = {
  name: "T01B · Segurança",
  render: () => <PlatformUserDetailPage initialView="security" />,
};

export const T01BAnaAccount: Story = {
  name: "T01B · Conta de Ana Lima",
  render: () => <PlatformUserDetailPage user={platformUsers[3]} />,
};

export const AccessProfiles: Story = {
  name: "Perfis de acesso",
  render: () => <BackofficeProfilesPage />,
};
