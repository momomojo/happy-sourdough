import { createClient } from '@/lib/supabase/server';
import { DiscountCodeList } from '@/components/admin/discounts/discount-code-list';
import { CreateDiscountDialog } from '@/components/admin/discounts/create-discount-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Percent } from 'lucide-react';
import type { DiscountCode } from '@/types/database';

export default async function DiscountsPage() {
  const supabase = await createClient();

  // Fetch all discount codes
  const { data, error } = await supabase
    .from('discount_codes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching discount codes:', error);
  }

  const discountCodes = (data || []) as DiscountCode[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Discount Codes</h1>
          <p className="text-muted-foreground">
            Manage promotional codes and special offers
          </p>
        </div>
        <CreateDiscountDialog />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Codes</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{discountCodes.length}</div>
            <p className="text-xs text-muted-foreground">
              All discount codes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Codes</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {discountCodes.filter(code => code.is_active).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Uses</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {discountCodes.reduce((sum, code) => sum + (code.current_uses ?? 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all codes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Discount Codes List */}
      <Card>
        <CardHeader>
          <CardTitle>All Discount Codes</CardTitle>
          <CardDescription>
            View and manage your promotional discount codes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DiscountCodeList discountCodes={discountCodes} />
        </CardContent>
      </Card>
    </div>
  );
}
