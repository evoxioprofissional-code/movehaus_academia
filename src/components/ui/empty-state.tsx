import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-mh border border-dashed border-mh-border bg-mh-surface/50 px-6 py-16 text-center">
      <div className="grid size-12 place-items-center rounded-full border border-mh-border text-mh-muted">
        <Icon className="size-6" />
      </div>
      <h3 className="font-display text-lg font-semibold uppercase tracking-wide text-white">
        {title}
      </h3>
      {description && (
        <p className="max-w-sm text-sm text-mh-muted">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
