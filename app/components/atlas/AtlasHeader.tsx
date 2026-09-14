import Link from "next/link";

type AtlasNavKey = "home" | "math" | "geography";

const links = [
  { id: "home", label: "Home", href: "/" },
  { id: "math", label: "Math & Logic", href: "/math-logic" },
  { id: "geography", label: "Geography", href: "/geography" },
  { id: "about", label: "About", href: "/#about" },
  { id: "progress", label: "Progress", href: "/#progress" },
] as const;

export function AtlasHeader({ active }: { active?: AtlasNavKey }) {
  return <header className="atlas-header">
    <Link className="atlas-brand" href="/" aria-label="Axiom Atlas home">
      <span className="atlas-brand-mark" aria-hidden="true"><span>AX</span></span>
      <span className="atlas-brand-copy"><b>Axiom Atlas</b><small>Different worlds. One world.</small></span>
    </Link>
    <nav className="atlas-nav" aria-label="Atlas navigation">
      {links.map(link => <Link key={link.id} className={active === link.id ? "active" : ""} href={link.href}>{link.label}</Link>)}
    </nav>
    <span className="atlas-header-signal" aria-label="Atlas status"><i /> Learning universe</span>
  </header>;
}
