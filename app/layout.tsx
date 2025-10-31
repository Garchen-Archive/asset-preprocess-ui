import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Garchen Archive Manager",
  description: "Manage and catalog Garchen Archive teaching materials",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Garchen Archive</h1>
              <div className="flex gap-6">
                <a href="/events" className="text-sm font-medium hover:underline">
                  Events
                </a>
                <a href="/sessions" className="text-sm font-medium hover:underline">
                  Sessions
                </a>
                <a href="/assets" className="text-sm font-medium hover:underline">
                  Assets
                </a>
              </div>
            </div>
          </div>
        </nav>
        <main className="container mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
