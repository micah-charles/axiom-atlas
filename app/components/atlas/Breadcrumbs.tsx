type Breadcrumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Breadcrumb[] }) {
  return <nav className="atlas-breadcrumbs" aria-label="Breadcrumb">
    {items.map((item, index) => <span key={`${item.label}-${index}`}>
      {index > 0 && <i aria-hidden="true">›</i>}
      {item.href ? <a href={item.href}>{item.label}</a> : <b aria-current="page">{item.label}</b>}
    </span>)}
  </nav>;
}
