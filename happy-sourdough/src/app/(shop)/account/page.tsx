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
        <h1 className="text-3xl font-bold tracking-tight">My Account</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your profile, orders, and preferences
        </p>
      </div>

      <Separator className="mb-8" />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Profile Information</CardTitle>
            </div>
            <CardDescription>Your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="text-base">
                {profile?.first_name || profile?.last_name
                  ? `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim()
                  : 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-base">{user.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Phone</p>
              <p className="text-base">{profile?.phone || 'Not set'}</p>
            </div>
            <Button variant="outline" className="w-full" asChild>
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
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Order History</CardTitle>
              </div>
              <CardDescription>View your past orders</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/account/orders">View Orders</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Addresses */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Saved Addresses</CardTitle>
              </div>
              <CardDescription>Manage your delivery addresses</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/account/addresses">Manage Addresses</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Marketing Preferences */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Manage your communication preferences</CardDescription>
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
