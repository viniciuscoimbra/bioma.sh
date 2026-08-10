import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { PropertyMedia, type PropertyMediaItem } from "./PropertyMedia";

function house(width: number, height: number, sky: string, label: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="${sky}"/><rect y="${height * .72}" width="100%" height="${height * .28}" fill="#8bab75"/><path d="M${width * .18} ${height * .58}L${width * .5} ${height * .25}l${width * .32} ${height * .33}v${height * .25}H${width * .18}z" fill="#fff7f2"/><path d="M${width * .14} ${height * .58}L${width * .5} ${height * .2}l${width * .36} ${height * .38}" fill="none" stroke="#bd4a2d" stroke-width="${Math.max(4, width / 70)}"/><rect x="${width * .42}" y="${height * .58}" width="${width * .16}" height="${height * .25}" rx="3" fill="#704f3d"/><text x="${width * .04}" y="${height * .1}" font-family="Arial" font-size="${Math.max(12, width / 28)}" fill="#29211d">${label}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const landscape: PropertyMediaItem[] = [
  { src: house(1200, 800, "#b8dcf0", "Fachada"), alt: "Fachada clara de uma casa com jardim" },
  { src: house(1200, 800, "#f1c99b", "Sala"), alt: "Sala do imóvel iluminada" },
  { src: house(1200, 800, "#c8d4f0", "Quintal"), alt: "Quintal arborizado do imóvel" },
];

function Frame({ children, width = 720 }: { children: React.ReactNode; width?: number }) {
  return <div style={{ width: `min(100%, ${width}px)` }}>{children}</div>;
}

const meta = {
  title: "Components/Molecules/PropertyMedia",
  component: PropertyMedia,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: { items: landscape },
} satisfies Meta<typeof PropertyMedia>;
export default meta;
type Story = StoryObj<typeof PropertyMedia>;

export const Paisagem: Story = { render: (args) => <Frame><PropertyMedia {...args} /></Frame> };
export const Retrato: Story = { render: (args) => <Frame width={520}><PropertyMedia {...args} items={[{ src: house(600, 1000, "#c7dded", "Foto vertical"), alt: "Casa fotografada na vertical" }]} fit="contain" /></Frame> };
export const Quadrada: Story = { render: (args) => <Frame width={560}><PropertyMedia {...args} items={[{ src: house(800, 800, "#e0c3a5", "Foto quadrada"), alt: "Área externa em foto quadrada" }]} aspectRatio="1 / 1" /></Frame> };
export const Panoramica: Story = { render: (args) => <Frame><PropertyMedia {...args} items={[{ src: house(1800, 500, "#b7dbee", "Panorâmica"), alt: "Vista panorâmica da fachada" }]} aspectRatio="16 / 7" fit="contain" /></Frame> };
export const Pequena: Story = { render: (args) => <Frame><PropertyMedia {...args} items={[{ src: house(240, 160, "#d3dff0", "240 × 160"), alt: "Foto pequena do imóvel" }]} /></Frame> };

export const Carregando: Story = { render: (args) => <Frame><PropertyMedia {...args} loading /></Frame> };

export const Erro: Story = {
  render: (args) => {
    const [retrying, setRetrying] = useState(false);
    return (
      <Frame>
        <PropertyMedia
          {...args}
          items={retrying ? landscape : [{ src: "invalid://property-photo", alt: "Foto do imóvel" }]}
          errorMessage={retrying ? undefined : "A origem da foto não respondeu."}
          onRetry={() => setRetrying(true)}
        />
      </Frame>
    );
  },
};
