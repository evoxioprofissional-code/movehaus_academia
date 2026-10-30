/** IDs de assinaturas são alfanuméricos; pagamentos usam IDs numéricos. */
export function validMercadoPagoId(id: string) {
  return /^[a-zA-Z0-9-]{1,100}$/.test(id);
}

/** Um mês civil pago, sem avançar de 31/jan para março. */
export function monthlyPeriodEnd(start: string) {
  const date = new Date(start);
  if (!Number.isFinite(date.getTime())) throw new Error("Data de cobrança inválida.");
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + 1);
  const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
  date.setUTCDate(Math.min(day, lastDay));
  return date.toISOString();
}
