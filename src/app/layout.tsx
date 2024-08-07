import "~/styles/globals.css";
import "@allo-team/kit/styles.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { ApiProvider, Web3Provider } from "@allo-team/kit";

export const metadata: Metadata = {
  title: "Checker",
  description: "...",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <main className="mx-auto max-w-screen-md p-2">
          <ApiProvider>
            <Web3Provider>{children}</Web3Provider>
          </ApiProvider>
        </main>
      </body>
    </html>
  );
}
