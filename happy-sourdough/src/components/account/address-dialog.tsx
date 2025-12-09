'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { addAddress, updateAddress } from '@/lib/supabase/customer';
import type { CustomerAddress } from '@/types/database';
import { toast } from 'sonner';

interface AddressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  address?: CustomerAddress | null;
  onSave: (address: CustomerAddress) => void;
}

export function AddressDialog({
  open,
  onOpenChange,
  userId,
  address,
  onSave,
}: AddressDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    label: '',
    street: '',
    apt: '',
    city: '',
    state: '',
    zip: '',
    delivery_instructions: '',
    is_default: false,
  });

  // Reset form when dialog opens/closes or address changes
  useEffect(() => {
    if (address) {
      setFormData({
        label: address.label || '',
        street: address.street,
        apt: address.apt || '',
        city: address.city,
        state: address.state,
        zip: address.zip,
        delivery_instructions: address.delivery_instructions || '',
        is_default: address.is_default,
      });
    } else {
      setFormData({
        label: '',
        street: '',
        apt: '',
        city: '',
        state: '',
        zip: '',
        delivery_instructions: '',
        is_default: false,
      });
    }
  }, [address, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (address) {
        // Update existing address
        const updated = await updateAddress(address.id, userId, formData);
        if (updated) {
          onSave(updated);
        } else {
          toast.error('Failed to update address');
        }
      } else {
        // Add new address
        const newAddress = await addAddress({
          user_id: userId,
          ...formData,
        });
        if (newAddress) {
          onSave(newAddress);
        } else {
          toast.error('Failed to add address');
        }
      }
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error('An error occurred while saving the address');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{address ? 'Edit Address' : 'Add New Address'}</DialogTitle>
          <DialogDescription>
            {address
              ? 'Update your delivery address details'
              : 'Add a new delivery address for faster checkout'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Label */}
            <div className="space-y-2">
              <Label htmlFor="label">Label (Optional)</Label>
              <Input
                id="label"
                placeholder="e.g., Home, Work, Mom's House"
                value={formData.label}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, label: e.target.value }))
                }
              />
            </div>

            {/* Street */}
            <div className="space-y-2">
              <Label htmlFor="street">Street Address *</Label>
              <Input
                id="street"
                required
                placeholder="123 Main St"
                value={formData.street}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, street: e.target.value }))
                }
              />
            </div>

            {/* Apt/Suite */}
            <div className="space-y-2">
              <Label htmlFor="apt">Apt/Suite/Unit (Optional)</Label>
              <Input
                id="apt"
                placeholder="Apt 4B"
                value={formData.apt}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, apt: e.target.value }))
                }
              />
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                required
                placeholder="San Francisco"
                value={formData.city}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, city: e.target.value }))
                }
              />
            </div>

            {/* State & ZIP */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  required
                  placeholder="CA"
                  maxLength={2}
                  value={formData.state}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, state: e.target.value.toUpperCase() }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">ZIP Code *</Label>
                <Input
                  id="zip"
                  required
                  placeholder="94102"
                  maxLength={10}
                  value={formData.zip}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, zip: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* Delivery Instructions */}
            <div className="space-y-2">
              <Label htmlFor="delivery_instructions">Delivery Instructions (Optional)</Label>
              <Textarea
                id="delivery_instructions"
                placeholder="e.g., Leave at front door, Ring doorbell"
                value={formData.delivery_instructions}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    delivery_instructions: e.target.value,
                  }))
                }
                rows={3}
              />
            </div>

            {/* Default Address Toggle */}
            <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="is_default" className="cursor-pointer">
                  Set as default address
                </Label>
                <p className="text-xs text-muted-foreground">
                  Use this address by default for deliveries
                </p>
              </div>
              <Switch
                id="is_default"
                checked={formData.is_default}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, is_default: checked }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : address ? 'Update' : 'Add'} Address
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
