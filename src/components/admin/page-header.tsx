import type { ReactNode } from "react";

export function AdminPageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><h1 className="text-[30px] font-bold tracking-[-0.035em] text-white sm:text-[34px]">{title}</h1>{description && <p className="mt-1 max-w-2xl text-sm text-admin-muted">{description}</p>}</div>{action && <div className="shrink-0">{action}</div>}</div>;
}
