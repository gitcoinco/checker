"use client";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./providers/Providers";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import dynamic from "next/dynamic";

const Navbar = dynamic(() => import("gitcoin-ui").then(mod => mod.Navbar), {
  ssr: false,
});

const CheckerIcon = dynamic(() => import("gitcoin-ui").then(mod => mod.CheckerIcon), {
  ssr: false,
});

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <Navbar
            text="Checker"
            secondaryLogo={CheckerIcon as any}
            primaryLogoLink="/"
            secondaryLogoLink="/"
            children={
              <ConnectButton />
            }
          />
          <div className="flex flex-col items-center h-screen">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
