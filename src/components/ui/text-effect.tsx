/** Texto legível já no HTML inicial; o acabamento visual não aguarda hidratação. */
export function TextEffect({
  text,
  as: Tag = "span",
  className,
}: {
  text: string;
  as?: "h1" | "h2" | "h3" | "span" | "p";
  className?: string;
  trigger?: "mount" | "inView";
  stagger?: number;
  y?: number;
}) {
  return (
    <Tag className={`mh-soft-enter ${className ?? ""}`}>
      {text.split("\n").map((line, index) => (
        <span key={index} className="block">{line}</span>
      ))}
    </Tag>
  );
}
