import type { Metadata } from "next";
import M05NetworkGame from "../../../games/architecture-lab/M05NetworkGame";

export const metadata: Metadata = {
  title: "M05 — The Network Is Now Part of the System",
  description: "Investigate bounded waiting, timeout and retry after Web/DB separation.",
};

export default function ArchitectureLabM05Page() {
  return <M05NetworkGame />;
}
