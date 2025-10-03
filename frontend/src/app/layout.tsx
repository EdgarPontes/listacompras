import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider, ThemeToggle } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { FixedHeader } from "@/components/FixedHeader";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Lista de Compras",
  description: "Aplicativo para gerenciar listas de compras",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <FixedHeader />
          <div className="fixed top-4 right-4 z-50">
            <ThemeToggle />
          </div>
          <div className="pt-16">
            {children}
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
