import { Search } from "lucide-react";

/** Busca por GET — funciona sem JavaScript, filtra no servidor. */
export function SearchBar({
  action,
  defaultValue,
  placeholder = "Buscar produtos...",
}: {
  action: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <form action={action} className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-mh-muted" />
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder={placeholder}
        aria-label="Buscar"
        className="h-11 w-full rounded-mh border border-mh-border bg-mh-surface pl-10 pr-4 text-sm text-white placeholder:text-mh-muted focus:border-mh-red focus:outline-none"
      />
    </form>
  );
}
