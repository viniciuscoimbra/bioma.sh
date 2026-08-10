import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { PostalCodeInput } from "./PostalCodeInput";

const meta = {
  title: "Components/Molecules/PostalCodeInput",
  component: PostalCodeInput,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: "Use em formulários de endereço que consultam um CEP. A fonte dos dados fica no produto. Não use como campo de busca genérico.",
      },
    },
  },
} satisfies Meta<typeof PostalCodeInput>;

export default meta;
type Story = StoryObj<typeof PostalCodeInput>;

function Example() {
  const [value, setValue] = useState("30140-091");
  const [address, setAddress] = useState("");

  return (
    <div>
      <PostalCodeInput
        value={value}
        onChange={(event) => setValue(event.target.value)}
        lookup={async (postalCode) => {
          await new Promise((resolve) => window.setTimeout(resolve, 600));
          return postalCode === "30140091"
            ? { postalCode: "30140-091", street: "Rua Gonçalves Dias", neighborhood: "Funcionários", city: "Belo Horizonte", state: "MG" }
            : null;
        }}
        onAddressFound={(next) => setAddress(`${next.street}, ${next.neighborhood}, ${next.city}, ${next.state}`)}
      />
      {address && <p>{address}</p>}
    </div>
  );
}

export const Padrao: Story = {
  render: () => <Example />,
};
