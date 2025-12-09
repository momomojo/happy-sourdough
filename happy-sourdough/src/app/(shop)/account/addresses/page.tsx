import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getUserAddresses } from '@/lib/supabase/customer-server';
import { Separator } from '@/components/ui/separator';
import { AddressList } from '@/components/account/address-list';

export default async function AddressesPage() {
  const supabase = await createClient();

  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login?redirect=/account/addresses');
  }

  // Get user addresses
  const addresses = await getUserAddresses(user.id);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/account"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Account
        </Link>

        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Saved Addresses
        </h1>
        <p className="mt-2 text-muted-foreground">
          Manage your delivery addresses for quick and easy checkout
        </p>
      </div>

      <Separator className="mb-8" />

      {/* Address List */}
      <AddressList userId={user.id} initialAddresses={addresses} />
    </div>
  );
}

export const metadata = {
  title: 'Saved Addresses - Happy Sourdough',
  description: 'Manage your delivery addresses',
};
