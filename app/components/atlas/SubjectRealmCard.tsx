type SubjectRealmCardProps = {
  href: string;
  tone: "math" | "geography";
  eyebrow: string;
  title: string;
  subtitle: string;
  description: string;
  facts: string[];
  icon: string;
  action: string;
  image?: string;
};

export function SubjectRealmCard({ href, tone, eyebrow, title, subtitle, description, facts, icon, action, image }: SubjectRealmCardProps) {
  return <a className={`atlas-subject-card ${tone}`} href={href}>
    <div className="atlas-subject-art" style={image ? { backgroundImage: `url(${image})` } : undefined} aria-hidden="true">
      <div className="atlas-subject-orbit orbit-one" /><div className="atlas-subject-orbit orbit-two" />
      <span>{icon}</span><i /><i /><i />
    </div>
    <div className="atlas-subject-copy">
      <span className="atlas-eyebrow">{eyebrow}</span>
      <h2>{title}</h2><strong>{subtitle}</strong><p>{description}</p>
      <div className="atlas-subject-facts">{facts.map(fact => <span key={fact}><i />{fact}</span>)}</div>
      <span className="atlas-card-action">{action}<b aria-hidden="true">→</b></span>
    </div>
  </a>;
}
