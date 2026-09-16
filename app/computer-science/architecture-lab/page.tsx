import type { Metadata } from "next";
import ArchitectureLabGame from "../../games/architecture-lab/ArchitectureLabGame";

export const metadata: Metadata = {
  title: "Architecture Evolution Lab",
  description: "Evolve a working system by investigating evidence, testing architecture and explaining trade-offs.",
};

export default function ArchitectureLabPage() {
  return <ArchitectureLabGame />;
}
