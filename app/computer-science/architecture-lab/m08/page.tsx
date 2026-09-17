import type { Metadata } from "next";
import M08CpuGame from "../../../games/architecture-lab/M08CpuGame";

export const metadata: Metadata = {
  title: "M08 — Campaign Under Load",
  description: "Investigate a bounded CPU bottleneck with evidence, prediction, controlled change and reconciliation.",
};

export default function ArchitectureLabM08Page() {
  return <M08CpuGame />;
}
