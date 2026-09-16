import type { Metadata } from "next";
import M07TomcatGame from "../../../games/architecture-lab/M07TomcatGame";

export const metadata: Metadata = {
  title: "M07 — Five-Second Tomcat",
  description: "Investigate CPU, memory/GC and I/O evidence behind a severe application-server slowdown.",
};

export default function ArchitectureLabM07Page() {
  return <M07TomcatGame />;
}
