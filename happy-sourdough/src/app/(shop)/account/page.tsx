import { redirect } from 'next/navigation';
import Link from 'next/link';
import { User, Package, MapPin, Settings } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getCustomerProfile } from '@/lib/supabase/customer-server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { MarketingPreferences } from '@/components/account/marketing-preferences';

export default async function AccountPage() {
  const supabase = await createClient();

  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login?redirect=/account');
  }

  // Get customer profile
  const profile = await getCustomerProfile(user.id);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          My Account
        </h1>
        <p className="mt-2 text-muted-foreground">
          Welcome back! Manage your profile, orders, and preferences
        </p>
      </div>

      <Separator className="mb-8" />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Information */}
        <Card className="border-2 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full -translate-y-16 translate-x-16" />
          <CardHeader className="relative">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-xl">Profile Information</CardTitle>
            </div>
            <CardDescription>Your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 relative">
            <div className="space-y-3">
              <div className="pb-3 border-b border-border/40">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Name</p>
                <p className="text-base font-medium">
                  {profile?.first_name || profile?.last_name
                    ? `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim()
                    : 'Not set'}
                </p>
              </div>
              <div className="pb-3 border-b border-border/40">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Email</p>
                <p className="text-base font-medium">{user.email}</p>
              </div>
              <div className="pb-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Phone</p>
                <p className="text-base font-medium">{profile?.phone || 'Not set'}</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full mt-4 border-2 hover:bg-primary/5 hover:border-primary/50 transition-all duration-200"
              asChild
            >
              <Link href="/account/profile">
                <Settings className="mr-2 h-4 w-4" />
                Edit Profile
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="space-y-6">
          {/* Orders */}
          <Card className="border-2 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/10 rounded-full -translate-y-12 translate-x-12 group-hover:scale-110 transition-transform duration-300" />
            <CardHeader className="relative">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-secondary/10">
                  <Package className="h-5 w-5 text-secondary" />
                </div>
                <CardTitle className="text-xl">Order History</CardTitle>
              </div>
              <CardDescription>View and track your fresh bread orders</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <Button
                variant="outline"
                className="w-full border-2 hover:bg-secondary/5 hover:border-secondary/50 transition-all duration-200"
                asChild
              >
                <Link href="/account/orders">View Orders</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Addresses */}
          <Card className="border-2 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-full -translate-y-12 translate-x-12 group-hover:scale-110 transition-transform duration-300" />
            <CardHeader className="relative">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-accent/10">
                  <MapPin className="h-5 w-5 text-accent-foreground" />
                </div>
                <CardTitle className="text-xl">Saved Addresses</CardTitle>
              </div>
              <CardDescription>Quick checkout for your favorite delivery spots</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <Button
                variant="outline"
                className="w-full border-2 hover:bg-accent/5 hover:border-accent/50 transition-all duration-200"
                asChild
              >
                <Link href="/account/addresses">Manage Addresses</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Marketing Preferences */}
      <div className="mt-6">
        <Card className="border-2 shadow-md rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl">Preferences</CardTitle>
            <CardDescription>Stay updated on fresh bakes and special offers</CardDescription>
          </CardHeader>
          <CardContent>
            <MarketingPreferences
              userId={user.id}
              initialOptIn={profile?.marketing_opt_in ?? false}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'My Account - Happy Sourdough',
  description: 'Manage your Happy Sourdough account settings and preferences',
};
