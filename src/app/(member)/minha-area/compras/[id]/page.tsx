import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, MessageCircle } from "lucide-react";
import { getCustomerOrder } from "@/lib/customer/data";
import { getPublicSettings } from "@/lib/settings";
import { whatsappLink } from "@/lib/site";
import { formatBRL } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CopyReceipt } from "@/components/customer/copy-receipt";
import { academyWhatsappAvailable, canPresentReceipt, hasPhysicalItems, orderLabels, paymentLabels, receiptCode } from "@/lib/commerce/receipts";

export const metadata = { title: "Detalhes e comprovante da compra" };

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [order, settings] = await Promise.all([getCustomerOrder(id), getPublicSettings()]);
  if (!order) notFound();
  const physical = hasPhysicalItems(order.items, order.products);
  const eligible = canPresentReceipt(order, physical);
  const code = receiptCode(order);
  const contactReady = academyWhatsappAvailable(settings.whatsapp);
  const message = `Olá, ${settings.academyName}! Quero combinar a retirada/entrega da minha compra.\nComprovante: ${code}\nPedido #${order.order_number}\n${order.items.map((item) => `${item.quantity}× ${item.product_name}`).join("\n")}\nTotal: ${formatBRL(order.total)}\nPor favor, confiram o pagamento e a liberação no sistema.`;
  return <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6"><Link href="/minha-area/compras" className="inline-flex min-h-10 items-center gap-2 text-sm text-mh-muted hover:text-white"><ArrowLeft className="size-4" />Minhas compras</Link><h1 className="mt-4 text-3xl font-bold text-white">Pedido #{order.order_number}</h1><p className="mt-2 text-sm text-mh-muted">{new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(new Date(order.created_at))}</p><div className="mt-6 rounded-2xl border border-white/10 bg-[#111216] p-5 sm:p-6"><Badge tone={order.payment_status === "approved" ? "success" : "muted"}>{paymentLabels[order.payment_status]}</Badge><ul className="mt-5 space-y-3 text-sm">{order.items.map((item) => <li key={item.id} className="flex justify-between gap-4 text-mh-text"><span>{item.quantity}× {item.product_name}</span><strong>{formatBRL(item.total)}</strong></li>)}</ul>{order.discount > 0 && <p className="mt-4 text-sm text-mh-muted">Desconto: {formatBRL(order.discount)}</p>}<p className="mt-5 text-xl font-semibold text-white">Total: {formatBRL(order.total)}</p><p className="mt-2 text-sm text-mh-muted">{orderLabels[order.status]}</p></div>
    {eligible ? <section className="mt-5 rounded-2xl border border-emerald-500/25 bg-[#111216] p-5 sm:p-6"><h2 className="flex items-center gap-2 text-xl font-semibold text-white"><CheckCircle2 className="size-6 text-emerald-400" />Comprovante de compra</h2><p className="mt-3 text-sm text-mh-muted">Pagamento confirmado. Use este código para a academia localizar seu pedido e conferir os produtos.</p><p className="my-4 select-all break-all rounded-lg bg-black/30 p-4 font-mono text-lg font-semibold text-white">{code}</p><CopyReceipt code={code} />{order.status === "delivered" ? <p className="mt-5 text-sm text-emerald-300">A academia já confirmou a entrega/retirada deste pedido.</p> : <><h3 className="mt-6 font-semibold text-white">Como receber seu produto</h3><ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-mh-muted"><li>Envie o comprovante à academia pelo botão abaixo.</li><li>A equipe confere o código e o pagamento no sistema.</li><li>Combine a retirada ou entrega com a equipe.</li></ol>{contactReady ? <Button asChild size="lg" className="mt-5"><a href={whatsappLink(message, settings.whatsapp)} target="_blank" rel="noopener noreferrer"><MessageCircle className="size-4" />Enviar comprovante à academia</a></Button> : <p className="mt-5 rounded-lg bg-white/5 p-4 text-sm text-mh-muted">O WhatsApp da academia ainda não foi cadastrado. Apresente o código na recepção para combinar a retirada.</p>}</>}{contactReady && <p className="mt-4 text-sm text-mh-muted">Contato da academia: <a className="text-white underline" href={whatsappLink(undefined, settings.whatsapp)} target="_blank" rel="noopener noreferrer">{settings.whatsappLabel && settings.whatsappLabel !== "(00) 00000-0000" ? settings.whatsappLabel : `+${settings.whatsapp.replace(/\D/g, "")}`}</a></p>}</section> : <section className="mt-5 rounded-2xl border border-white/10 p-5"><p className="text-sm text-mh-muted">{physical ? "O comprovante para receber os produtos fica disponível após a confirmação do pagamento. Pedidos cancelados ou reembolsados não liberam retirada." : "Seus conteúdos digitais ficam na biblioteca. As assinaturas ficam em Minhas compras."}</p>{order.payment_status === "pending" && order.status !== "cancelled" ? <Button asChild className="mt-4"><Link href={`/checkout?order=${order.id}`}>Continuar pagamento</Link></Button> : !physical && <Button asChild className="mt-4"><Link href="/minha-area/biblioteca">Abrir minha biblioteca</Link></Button>}</section>}
  </div>;
}
