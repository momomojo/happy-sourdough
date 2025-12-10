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
    <div className="flex items-center justify-between space-x-4 rounded-xl border-2 p-5 bg-gradient-to-r from-accent/5 to-secondary/5 hover:from-accent/10 hover:to-secondary/10 transition-all duration-200">
      <div className="space-y-1 flex-1">
        <Label htmlFor="marketing" className="cursor-pointer font-semibold text-base">
          Receive marketing emails
        </Label>
        <p className="text-sm text-muted-foreground">
          Stay in the loop! Get updates about fresh-baked specials, seasonal offerings, and exclusive bakery news
        </p>
      </div>
      <Switch
        id="marketing"
        checked={optIn}
        onCheckedChange={handleToggle}
        disabled={loading}
        className="data-[state=checked]:bg-primary"
      />
    </div>
  );
}
