import type { Metadata } from "next";
import { CheckoutClient } from "@/components/cart/checkout-client";
import { getPublicSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Finalizar compra" };

export default async function CheckoutPage() {
  const settings = await getPublicSettings();
  return <CheckoutClient whatsapp={settings.whatsapp} />;
}
