import type { Metadata } from "next";
import "./globals.css";
import { Instrument_Sans, Inter } from "next/font/google";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import GradualBlur from "@/components/GradualBlur";
import Footer from "@/components/shared/footer";
import MenuTop from "@/components/shared/menu-top";
import ScrollSmootherWrapper from "@/components/shared/scroll-smoother-wrapper";
import { Providers } from "@/providers/providers";
import "@rainbow-me/rainbowkit/styles.css";
import { Toaster } from "sonner";

const clashGrotesk = localFont({
  src: [
    {
      path: "../public/fonts/clash-grotesk/extra-light.otf",
      weight: "200",
      style: "normal",
    },
    {
      path: "../public/fonts/clash-grotesk/light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/clash-grotesk/regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/clash-grotesk/medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/clash-grotesk/semibold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/clash-grotesk/bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-clash",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-inter",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-instrument",
});

export const metadata: Metadata = {
  title: "Ern",
  description: "Earn more, Ern better.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${instrumentSans.variable} ${clashGrotesk.variable} font-clash antialiased`}
      >
        <Providers>
          <MenuTop />
          <GradualBlur
            target="page"
            position="top"
            height="130px"
            mobileHeight="3rem"
            tabletHeight="3rem"
            responsive={true}
            strength={2}
            divCount={15}
            curve="bezier"
            exponential={true}
            opacity={1}
            zIndex={-60}
            style={{ top: "100px" }}
          />
          <ScrollSmootherWrapper>
            <section style={{ position: "relative", overflow: "hidden" }}>
              <div style={{ height: "100%", paddingTop: "0" }}>{children}</div>
            </section>
            <Footer />
          </ScrollSmootherWrapper>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
