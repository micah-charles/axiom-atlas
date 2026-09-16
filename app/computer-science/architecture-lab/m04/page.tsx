import type { Metadata } from "next";
import M04DiskFullGame from "../../../games/architecture-lab/M04DiskFullGame";

export const metadata: Metadata = {
  title: "M04 — Disk Full at 02:00",
  description: "Investigate a shared-disk capacity incident and test Web/DB resource isolation.",
};

export default function ArchitectureLabM04Page() {
  return <M04DiskFullGame />;
}
