import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";
import { UserMenu } from "@/components/user-menu";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Garchen Archive Asset Catalog Hub",
  description: "Catalog and prepare Garchen Archive Assets for GA Pipeline",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <nav className="border-b">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <a href="/" className="text-2xl font-bold hover:opacity-80 transition-opacity">
                  Garchen Archive
                </a>
                <div className="flex items-center gap-6">
                  <a href="/events" className="text-sm font-medium hover:underline">
                    Events
                  </a>
                  <a href="/sessions" className="text-sm font-medium text-muted-foreground/50 hover:text-muted-foreground hover:underline">
                    Sessions
                  </a>
                  <a href="/assets" className="text-sm font-medium hover:underline">
                    Assets
                  </a>
                  <a href="/locations" className="text-sm font-medium hover:underline">
                    Locations
                  </a>
                  <a href="/taxonomy" className="text-sm font-medium hover:underline">
                    Topics & Categories
                  </a>
                  <div className="ml-4 pl-4 border-l">
                    <UserMenu />
                  </div>
                </div>
              </div>
            </div>
          </nav>
          <main className="container mx-auto px-4 py-8">{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
