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
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-admin-border bg-admin-card px-6 py-16 text-center">
      <div className="grid size-12 place-items-center rounded-lg border border-admin-border bg-[#20232a] text-mh-muted">
        <Icon className="size-6" />
      </div>
      <h3 className="text-base font-semibold text-white">
        {title}
      </h3>
      {description && (
        <p className="max-w-sm text-sm text-mh-muted">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
