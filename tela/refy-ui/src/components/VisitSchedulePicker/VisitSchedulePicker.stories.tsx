import type { Meta, StoryObj } from "@storybook/react";
import { VisitSchedulePicker } from "./VisitSchedulePicker";

const july23 = new Date(2026, 6, 23);
const selected = {
  "2026-07-23": ["09:00", "09:30", "10:00", "10:30"],
  "2026-07-24": ["08:00", "08:30", "15:00", "15:30"],
};

const meta = {
  title: "Components/Organisms/VisitSchedulePicker",
  component: VisitSchedulePicker,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: { defaultActiveDate: july23, minDate: new Date(2026, 6, 21), maxDate: new Date(2026, 7, 31) },
} satisfies Meta<typeof VisitSchedulePicker>;
export default meta;
type Story = StoryObj<typeof VisitSchedulePicker>;

export const MultiDia: Story = { args: { defaultValue: selected } };
export const Horario08As19: Story = { args: { defaultValue: { "2026-07-23": [] } } };
export const SlotsDe30Min: Story = { args: { defaultValue: { "2026-07-23": ["08:00", "08:30", "09:00"] }, unavailable: { "2026-07-23": ["10:30", "14:00"] } } };
export const ResumoAgrupado: Story = { args: { defaultValue: selected } };
export const Timezone: Story = { args: { defaultValue: selected, timezone: "America/Sao_Paulo" } };
