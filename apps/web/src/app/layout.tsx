import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lumi | OS for the Subconscious",
  description: "AI-powered dream journaling and Jungian analysis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#030014] text-white selection:bg-teal-500/30`}
      >
        <ConvexClientProvider>
          <div className="min-h-screen flex flex-col">
            {children}
          </div>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
