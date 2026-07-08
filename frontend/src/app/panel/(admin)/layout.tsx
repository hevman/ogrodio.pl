import { PanelShell } from "@/components/panel/panel-shell";

export default function PanelAdminLayout({ children }: { children: React.ReactNode }) {
  return <PanelShell>{children}</PanelShell>;
}
