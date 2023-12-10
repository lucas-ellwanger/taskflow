import "@/styles/globals.css";

import { Metadata } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import { ClerkProvider } from "@clerk/nextjs";

import { siteConfig } from "@/config/site";
import { EdgeStoreProvider } from "@/lib/edgestore";
import { TRPCReactProvider } from "@/trpc/react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: [
    {
      url: "/logo.svg",
      href: "/logo.svg",
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`font-sans antialiased ${inter.variable}`}>
          <TRPCReactProvider cookies={cookies().toString()}>
            <EdgeStoreProvider>{children}</EdgeStoreProvider>
          </TRPCReactProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
