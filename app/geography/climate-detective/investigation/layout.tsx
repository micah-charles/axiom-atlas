import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Climate Detective · Investigation",
  description: "Follow a real UK weather year, gather evidence and test your explanation against the historical record.",
};

export default function InvestigationLayout({ children }: { children: React.ReactNode }) {
  return children;
}
