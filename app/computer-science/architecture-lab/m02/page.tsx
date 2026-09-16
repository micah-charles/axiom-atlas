import type { Metadata } from "next";
import M02FollowOneRequestGame from "../../../games/architecture-lab/M02FollowOneRequestGame";

export const metadata: Metadata = {
  title: "M02 — Follow One Request",
  description: "Diagnose a slow request by measuring its layers before changing the architecture.",
};

export default function ArchitectureLabM02Page() {
  return <M02FollowOneRequestGame />;
}
