import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { DynamicIslandProvider } from "@/app/components/ui/dynamic-island";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OneMail — Attention Center",
  description: "AI-powered personal email intelligence and action assistant",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <DynamicIslandProvider>{children}</DynamicIslandProvider>
      </body>
    </html>
  );
}
