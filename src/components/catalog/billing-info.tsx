import { CalendarClock, Infinity as InfinityIcon, RefreshCw, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { hasBilling, type Product } from "@/types/catalog";

/** Descreve como o acesso ao conteúdo digital funciona. */
export function accessDescription(product: Product): string | null {
  if (!hasBilling(product)) return null;
  if (product.billingModel === "subscription") {
    return "Assinatura mensal — acesso enquanto estiver ativa.";
  }
  if (product.accessDurationDays == null) {
    return "Pagamento único — acesso permanente.";
  }
  return `Pagamento único — acesso por ${product.accessDurationDays} dias.`;
}

/** Selo compacto de modelo de cobrança para cards. */
export function BillingBadge({ product }: { product: Product }) {
  if (!hasBilling(product)) return null;
  if (product.billingModel === "subscription") {
    return (
      <Badge tone="red">
        <RefreshCw className="size-3" />
        Assinatura
      </Badge>
    );
  }
  return (
    <Badge tone="muted">
      <Zap className="size-3" />
      Pagamento único
    </Badge>
  );
}

/** Bloco detalhado (usado na página do produto). */
export function BillingDetails({ product }: { product: Product }) {
  if (!hasBilling(product)) return null;
  const permanent =
    product.billingModel === "one_time" && product.accessDurationDays == null;

  return (
    <div className="space-y-2 rounded-mh border border-mh-border bg-mh-surface p-4 text-sm">
      <p className="flex items-center gap-2 text-white">
        {product.billingModel === "subscription" ? (
          <RefreshCw className="size-4 text-mh-red" />
        ) : (
          <Zap className="size-4 text-mh-red" />
        )}
        <span className="font-semibold">
          {product.billingModel === "subscription"
            ? "Assinatura mensal"
            : "Pagamento único"}
        </span>
      </p>
      <p className="flex items-center gap-2 text-mh-muted">
        {permanent ? (
          <InfinityIcon className="size-4" />
        ) : (
          <CalendarClock className="size-4" />
        )}
        {accessDescription(product)}
      </p>
    </div>
  );
}
