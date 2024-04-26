import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kiraka.ai",
  description: "AI Speed-Learning Platform",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <html lang="en" data-lt-installed="true">
        <body className={inter.className} suppressHydrationWarning={true}>
          <link rel="icon" href="/favicon.ico" sizes="any" />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
