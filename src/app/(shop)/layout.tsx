import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { MobileNav } from '@/components/layout/mobile-nav';
import { CookieConsent } from '@/components/layout/cookie-consent';

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-20 md:pb-8">
        {children}
      </main>
      <Footer />
      <MobileNav />
      <CookieConsent />
    </div>
  );
}
