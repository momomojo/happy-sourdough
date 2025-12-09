import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/contexts/cart-context";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Happy Sourdough - Artisan Bakery",
  description: "Fresh sourdough breads, pastries, and custom cakes delivered to your door",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <CartProvider>
          {children}
          <Toaster />
        </CartProvider>
      </body>
    </html>
  );
}
