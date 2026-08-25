import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SkillBridge — AI-Powered Peer Tutoring Platform",
  description:
    "Anonymous, credit-based peer tutoring for engineering students. Learn from peers, teach to earn credits.",
  keywords: [
    "peer tutoring",
    "student learning",
    "anonymous tutoring",
    "credit economy",
    "engineering students",
    "free courses",
    "DSA",
    "Python",
    "machine learning",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
