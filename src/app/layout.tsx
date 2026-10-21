import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Cinzel, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  weight: ["500", "700"],
  style: ["normal", "italic"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-sourceserif",
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Chin Ballon d'Or",
  description: "La ceremonia anual del chinparley.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#efe6d2",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${bodoni.variable} ${cinzel.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
