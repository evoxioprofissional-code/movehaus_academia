/** Mantém o conteúdo visível sem JavaScript e aplica apenas uma entrada leve. */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <div className={`mh-soft-enter ${className ?? ""}`} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}
