import type { Metadata } from "next";
import M03FindLocalAssumptionsGame from "../../../games/architecture-lab/M03FindLocalAssumptionsGame";

export const metadata: Metadata = {
  title: "M03 — Find the Three Local Assumptions",
  description: "Investigate hidden single-host dependencies before moving an application across a host boundary.",
};

export default function ArchitectureLabM03Page() {
  return <M03FindLocalAssumptionsGame />;
}
