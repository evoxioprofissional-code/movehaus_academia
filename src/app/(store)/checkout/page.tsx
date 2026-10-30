import type { Metadata } from "next";
import { CheckoutClient } from "@/components/cart/checkout-client";
import { getPublicSettings } from "@/lib/settings";
import { serverEnv } from "@/lib/env";
import { resumeOrder } from "@/lib/commerce/actions";

export const metadata: Metadata = { title: "Finalizar compra" };

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams;
  const settings = await getPublicSettings();
  const initialState = order ? await resumeOrder(order) : {};
  return <CheckoutClient whatsapp={settings.whatsapp} publicKey={serverEnv.mercadoPagoPublicKey} initialState={initialState} />;
}
