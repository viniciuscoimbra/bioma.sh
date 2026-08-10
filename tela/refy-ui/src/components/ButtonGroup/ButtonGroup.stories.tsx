import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button";
import { ButtonGroup } from "./ButtonGroup";

const meta = {
  title: "Components/Molecules/ButtonGroup",
  component: ButtonGroup,
  tags: ["autodocs"],
  args: { orientation: "horizontal", label: "Ações do arquivo" },
  argTypes: { orientation: { control: "inline-radio", options: ["horizontal", "vertical"] } },
  parameters: {
    docs: {
      description: {
        component: "Seleção única em uma borda contínua: clicar em uma opção ativa essa opção e desativa a anterior. Para seleção múltipla, use ToggleGroup.",
      },
    },
  },
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof ButtonGroup>;

function SelectionDemo({ orientation = "horizontal", labels }: { orientation?: "horizontal" | "vertical"; labels: string[] }) {
  return (
      <ButtonGroup orientation={orientation} label="Formato de visualização" defaultActiveIndex={0}>
        {labels.map((label) => <Button key={label}>{label}</Button>)}
      </ButtonGroup>
  );
}

export const Horizontal: Story = {
  render: () => <SelectionDemo labels={["Lista", "Mapa", "Galeria"]} />,
};

export const Estados: Story = {
  render: (args) => <ButtonGroup {...args}><Button>Primeiro</Button><Button>Segundo</Button><Button disabled>Indisponível</Button></ButtonGroup>,
};

export const Vertical: Story = {
  args: { orientation: "vertical", label: "Ações do cliente" },
  render: () => <SelectionDemo orientation="vertical" labels={["Compacto", "Confortável", "Amplo"]} />,
};
