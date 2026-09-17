import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "MoveHaus Training Club",
    template: "%s · MoveHaus Training Club",
  },
  description:
    "Loja oficial da MoveHaus Training Club. Produtos, e-books e conteúdos de treino e nutrição.",
  metadataBase: new URL("https://movehaus.com.br"),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${oswald.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-mh-black text-mh-text">
        {children}
      </body>
    </html>
  );
}
