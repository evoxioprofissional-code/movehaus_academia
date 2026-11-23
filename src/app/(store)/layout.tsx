import { CartProvider } from "@/components/cart/cart-provider";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { WhatsappFab } from "@/components/layout/whatsapp-fab";
import { NavigationFeedback } from "@/components/layout/navigation-feedback";
import { AppBottomNav } from "@/components/layout/app-bottom-nav";
import type { Viewport } from "next";

export const viewport: Viewport = {
  themeColor: [
    { media: "(max-width: 767px)", color: "#f6f5f2" },
    { media: "(min-width: 768px)", color: "#090a0c" },
  ],
};

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="mh-mobile-app flex min-h-dvh flex-1 flex-col">
        <NavigationFeedback />
        <SiteHeader />
        <main className="mh-app-main flex-1">{children}</main>
        <SiteFooter />
        <WhatsappFab />
        <AppBottomNav />
      </div>
    </CartProvider>
  );
}
