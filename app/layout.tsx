import type { Metadata } from "next";
import { Newsreader, Manrope, Fira_Code } from "next/font/google";
import { AuthProvider } from "@/components/providers/AuthProvider";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-fira-code",
  display: "swap",
});

export const metadata: Metadata = {
  title: "UriCode — AI Coding Tutor",
  description:
    "Learn to code through guided practice. UriCode is an AI tutor that helps you discover solutions through progressive hints and guiding questions — never just gives you the answer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${newsreader.variable} ${manrope.variable} ${firaCode.variable}`}>
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-manrope bg-[#FFFCFB] text-[#1B1717] antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
