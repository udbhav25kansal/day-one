import type { Metadata } from "next";
import { Fraunces, Figtree } from "next/font/google";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
});

const sans = Figtree({
  variable: "--font-sans-pg",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Day One",
  description: "A simulated AI-Lab engagement for evaluating AI Builder candidates.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} h-full antialiased`}>
      <body className="min-h-full">
        <div className="pg-aurora" aria-hidden />
        <div className="pg-grain" aria-hidden />
        {children}
      </body>
    </html>
  );
}
