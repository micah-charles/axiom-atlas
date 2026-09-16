import type { Metadata } from "next";
import M06ConnectionGame from "../../../games/architecture-lab/M06ConnectionGame";

export const metadata: Metadata = {
  title: "M06 — Fifty Connections or Five Hundred?",
  description: "Investigate application connection admission versus useful database concurrency.",
};

export default function M06Page() {
  return <M06ConnectionGame />;
}
