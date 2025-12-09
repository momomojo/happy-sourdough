'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { updateCustomerProfile } from '@/lib/supabase/customer';
import { toast } from 'sonner';

interface MarketingPreferencesProps {
  userId: string;
  initialOptIn: boolean;
}

export function MarketingPreferences({ userId, initialOptIn }: MarketingPreferencesProps) {
  const [optIn, setOptIn] = useState(initialOptIn);
  const [loading, setLoading] = useState(false);

  const handleToggle = async (checked: boolean) => {
    setLoading(true);
    setOptIn(checked);

    const updated = await updateCustomerProfile(userId, {
      marketing_opt_in: checked,
    });

    if (updated) {
      toast.success(
        checked
          ? 'You will now receive marketing emails'
          : 'You have unsubscribed from marketing emails'
      );
    } else {
      // Revert on error
      setOptIn(!checked);
      toast.error('Failed to update preferences');
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
      <div className="space-y-0.5">
        <Label htmlFor="marketing" className="cursor-pointer">
          Receive marketing emails
        </Label>
        <p className="text-xs text-muted-foreground">
          Get updates about new products, special offers, and bakery news
        </p>
      </div>
      <Switch
        id="marketing"
        checked={optIn}
        onCheckedChange={handleToggle}
        disabled={loading}
      />
    </div>
  );
}
