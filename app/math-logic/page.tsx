import type { Metadata } from "next";
import MathLogicGame from "../MathLogicGame";

export const metadata: Metadata = {
  title: "Math & Logic Atlas",
  description: "Explore interactive worlds from numbers to optimisation.",
};

export default function MathLogicRealm() {
  return <MathLogicGame />;
}
