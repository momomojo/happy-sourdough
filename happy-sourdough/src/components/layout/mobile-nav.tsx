'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, ShoppingCart, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/contexts/cart-context';
import { Badge } from '@/components/ui/badge';

const navItems = [
  {
    label: 'Home',
    href: '/',
    icon: Home,
  },
  {
    label: 'Products',
    href: '/products',
    icon: ShoppingBag,
  },
  {
    label: 'Cart',
    href: '/cart',
    icon: ShoppingCart,
    showBadge: true,
  },
  {
    label: 'Account',
    href: '/account',
    icon: User,
  },
];

export function MobileNav() {
  const pathname = usePathname();
  const { itemCount } = useCart();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background border-t border-border">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center min-w-[60px] h-full rounded-lg transition-all relative',
                'active:scale-95 active:bg-accent/50',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    'h-6 w-6 transition-transform',
                    isActive && 'scale-110'
                  )}
                />
                {item.showBadge && itemCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {itemCount > 9 ? '9+' : itemCount}
                  </Badge>
                )}
              </div>
              <span
                className={cn(
                  'text-xs mt-1 font-medium transition-all',
                  isActive && 'font-semibold'
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
      {/* Safe area for phones with home indicators */}
      <div className="h-[env(safe-area-inset-bottom)] bg-background" />
    </nav>
  );
}
