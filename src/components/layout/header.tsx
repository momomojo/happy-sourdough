'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Search, ShoppingCart, User, Package, LogOut, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCart } from '@/contexts/cart-context';
import { CartSheet } from '@/components/cart/cart-sheet';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const navigationLinks = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'About', href: '/about' },
  { label: 'Track Order', href: '/track' },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [user, setUser] = useState<{ id: string; email: string; name?: string } | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    checkAuth();

    // Subscribe to auth changes
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUserProfile(session.user.id, session.user.email || '');
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkAuth = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      await loadUserProfile(user.id, user.email || '');
    }
    setIsLoadingAuth(false);
  };

  const loadUserProfile = async (userId: string, email: string) => {
    const supabase = createClient();
    interface CustomerProfile {
      first_name: string | null;
      last_name: string | null;
    }
    const { data: profile } = await (supabase
      .from('customer_profiles') as ReturnType<typeof supabase.from>)
      .select('first_name, last_name')
      .eq('id', userId)
      .single() as { data: CustomerProfile | null };

    const name = profile?.first_name
      ? `${profile.first_name} ${profile.last_name || ''}`.trim()
      : undefined;

    setUser({ id: userId, email, name });
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    toast.success('Logged out successfully');
    router.push('/');
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-sm">
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
              className="flex items-center space-x-2.5 text-lg font-bold md:mr-8 group transition-all duration-200 hover:scale-105"
            >
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground shadow-md group-hover:shadow-lg transition-all duration-200 group-hover:rotate-6">
                <span className="text-sm font-bold">HS</span>
              </div>
              <span className="hidden sm:inline-block bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">Happy Sourdough</span>
              <span className="sm:hidden bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">HS</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex md:flex-1 md:items-center md:space-x-1">
              {navigationLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'text-sm font-semibold transition-all duration-200 px-3 py-2 rounded-lg relative group',
                    pathname === link.href
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  )}
                >
                  {link.label}
                  {pathname === link.href && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center space-x-2">
              {/* Desktop Search */}
              <div className="hidden lg:flex items-center relative">
                <Search className="absolute left-3 h-4 w-4 text-muted-foreground transition-colors duration-200 peer-focus:text-primary" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="pl-9 w-64 peer border-border/50 focus:border-primary/50 shadow-sm focus:shadow-md transition-all duration-200"
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

              {/* Account Button/Menu */}
              {!isLoadingAuth && (
                <>
                  {user ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Account menu"
                        >
                          <UserCircle className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>
                          <div className="flex flex-col space-y-1">
                            {user.name && <p className="text-sm font-medium">{user.name}</p>}
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/account/profile" className="cursor-pointer">
                            <UserCircle className="mr-2 h-4 w-4" />
                            My Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/account/profile?tab=orders" className="cursor-pointer">
                            <Package className="mr-2 h-4 w-4" />
                            My Orders
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                          <LogOut className="mr-2 h-4 w-4" />
                          Logout
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Account menu"
                        >
                          <User className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem asChild>
                          <Link href="/account/login" className="cursor-pointer">
                            <User className="mr-2 h-4 w-4" />
                            Login
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/account/register" className="cursor-pointer">
                            <UserCircle className="mr-2 h-4 w-4" />
                            Sign Up
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </>
              )}

              {/* Cart Button */}
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-accent/80"
                onClick={() => setCartOpen(true)}
                aria-label={`Shopping cart with ${itemCount} items`}
                data-testid="cart-button"
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-bounce-subtle bg-accent text-accent-foreground border-2 border-background shadow-lg"
                    data-testid="cart-count"
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

            {!isLoadingAuth && (
              <>
                <div className="border-t pt-4 mt-4">
                  {user ? (
                    <>
                      <div className="px-4 py-2 mb-2">
                        <p className="text-sm font-medium">{user.name || 'My Account'}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <Link
                        href="/account/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-base font-medium transition-colors hover:text-primary px-4 py-2 rounded-md block text-muted-foreground"
                      >
                        <UserCircle className="inline h-4 w-4 mr-2" />
                        My Profile
                      </Link>
                      <Link
                        href="/account/profile?tab=orders"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-base font-medium transition-colors hover:text-primary px-4 py-2 rounded-md block text-muted-foreground"
                      >
                        <Package className="inline h-4 w-4 mr-2" />
                        My Orders
                      </Link>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          handleLogout();
                        }}
                        className="text-base font-medium transition-colors hover:text-primary px-4 py-2 rounded-md block text-destructive w-full text-left"
                      >
                        <LogOut className="inline h-4 w-4 mr-2" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/account/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-base font-medium transition-colors hover:text-primary px-4 py-2 rounded-md block text-muted-foreground"
                      >
                        <User className="inline h-4 w-4 mr-2" />
                        Login
                      </Link>
                      <Link
                        href="/account/register"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-base font-medium transition-colors hover:text-primary px-4 py-2 rounded-md block text-muted-foreground"
                      >
                        <UserCircle className="inline h-4 w-4 mr-2" />
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              </>
            )}
          </nav>
        </SheetContent>
      </Sheet>

      {/* Cart Sheet */}
      <CartSheet isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
