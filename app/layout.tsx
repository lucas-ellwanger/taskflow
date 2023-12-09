import "@/styles/globals.css";

import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import { TRPCReactProvider } from "@/trpc/react";
import { ClerkProvider } from "@clerk/nextjs";

import { EdgeStoreProvider } from "@/lib/edgestore";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Taskflow",
  description: "Taskflow",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
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
