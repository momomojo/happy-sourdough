'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Search, ShoppingCart, User, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useCart } from '@/contexts/cart-context';
import { CartSheet } from '@/components/cart/cart-sheet';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const navigationLinks = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'About', href: '/about' },
  { label: 'Track Order', href: '/track' },
];

export function Header() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Logo */}
            <Link
              href="/"
              className="flex items-center space-x-2 text-lg font-bold md:mr-8"
            >
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                HS
              </div>
              <span className="hidden sm:inline-block">Happy Sourdough</span>
              <span className="sm:hidden">HS</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex md:flex-1 md:items-center md:space-x-6">
              {navigationLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-primary',
                    pathname === link.href
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center space-x-2">
              {/* Desktop Search */}
              <div className="hidden lg:flex items-center relative">
                <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="pl-9 w-64"
                />
              </div>

              {/* Mobile Search Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Account Button */}
              <Button
                variant="ghost"
                size="icon"
                asChild
                aria-label="My Account"
              >
                <Link href="/account">
                  <User className="h-5 w-5" />
                </Link>
              </Button>

              {/* Cart Button */}
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setCartOpen(true)}
                aria-label={`Shopping cart with ${itemCount} items`}
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {itemCount > 9 ? '9+' : itemCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {searchOpen && (
            <div className="pb-4 lg:hidden animate-in slide-in-from-top-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="pl-9 w-full"
                  autoFocus
                />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Menu Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[280px]">
          <SheetHeader>
            <SheetTitle className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                HS
              </div>
              <span>Menu</span>
            </SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col space-y-4 mt-8">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'text-base font-medium transition-colors hover:text-primary px-4 py-2 rounded-md',
                  pathname === link.href
                    ? 'text-foreground bg-accent'
                    : 'text-muted-foreground'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      {/* Cart Sheet */}
      <CartSheet isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
