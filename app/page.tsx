import type { Metadata } from "next";
import MathLogicGame from "./MathLogicGame";

export const metadata: Metadata = {
  title: "The Axiom Atlas — Mathematical Adventure",
  description: "A tactile puzzle adventure where every move is a mathematical decision.",
};

export default function Home() {
  return <MathLogicGame />;
}
