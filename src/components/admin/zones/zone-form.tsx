'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import type { DeliveryZone } from '@/types/database';
import { updateZone } from '@/lib/supabase/admin/zones';
import { toast } from 'sonner';

interface ZoneFormProps {
  zone: DeliveryZone;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ZoneForm({ zone, onSuccess, onCancel }: ZoneFormProps) {
  const [formData, setFormData] = useState({
    name: zone.name,
    description: zone.description || '',
    zip_codes: zone.zip_codes,
    min_order: zone.min_order,
    delivery_fee: zone.delivery_fee,
    free_delivery_threshold: zone.free_delivery_threshold || 0,
    estimated_time_minutes: zone.estimated_time_minutes ?? 0,
  });

  const [newZipCode, setNewZipCode] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleAddZipCode = () => {
    const zipCode = newZipCode.trim();
    if (!zipCode) return;

    // Basic validation for US ZIP codes
    if (!/^\d{5}$/.test(zipCode)) {
      toast.error('Please enter a valid 5-digit ZIP code');
      return;
    }

    if (formData.zip_codes.includes(zipCode)) {
      toast.error('ZIP code already added');
      return;
    }

    setFormData({
      ...formData,
      zip_codes: [...formData.zip_codes, zipCode],
    });
    setNewZipCode('');
  };

  const handleRemoveZipCode = (zipCode: string) => {
    setFormData({
      ...formData,
      zip_codes: formData.zip_codes.filter((z) => z !== zipCode),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.zip_codes.length === 0) {
      toast.error('Please add at least one ZIP code');
      return;
    }

    if (formData.min_order <= 0) {
      toast.error('Minimum order amount must be greater than 0');
      return;
    }

    if (formData.delivery_fee < 0) {
      toast.error('Delivery fee cannot be negative');
      return;
    }

    setIsSaving(true);

    try {
      await updateZone(zone.id, {
        name: formData.name,
        description: formData.description || null,
        zip_codes: formData.zip_codes,
        min_order_amount: formData.min_order,
        delivery_fee: formData.delivery_fee,
        free_delivery_threshold: formData.free_delivery_threshold || null,
        estimated_time_minutes: formData.estimated_time_minutes,
      });

      toast.success('Zone updated successfully');
      onSuccess();
    } catch (error) {
      console.error('Error updating zone:', error);
      toast.error('Failed to update zone');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Zone Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            placeholder="e.g., Zone 1 - City Center"
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description (optional)</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Brief description of this delivery zone"
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="zip-codes">ZIP Codes</Label>
          <div className="flex gap-2 mt-1">
            <Input
              id="zip-codes"
              value={newZipCode}
              onChange={(e) => setNewZipCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddZipCode();
                }
              }}
              placeholder="Enter 5-digit ZIP code"
              maxLength={5}
            />
            <Button
              type="button"
              onClick={handleAddZipCode}
              variant="outline"
            >
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.zip_codes.map((zip) => (
              <Badge key={zip} variant="secondary" className="pr-1">
                {zip}
                <button
                  type="button"
                  onClick={() => handleRemoveZipCode(zip)}
                  className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          {formData.zip_codes.length === 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              No ZIP codes added yet
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="min-order">Minimum Order Amount</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="min-order"
                type="number"
                step="0.01"
                min="0"
                value={formData.min_order}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    min_order: parseFloat(e.target.value) || 0,
                  })
                }
                className="pl-7"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="delivery-fee">Delivery Fee</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="delivery-fee"
                type="number"
                step="0.01"
                min="0"
                value={formData.delivery_fee}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    delivery_fee: parseFloat(e.target.value) || 0,
                  })
                }
                className="pl-7"
                required
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="free-threshold">
              Free Delivery Threshold (optional)
            </Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="free-threshold"
                type="number"
                step="0.01"
                min="0"
                value={formData.free_delivery_threshold}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    free_delivery_threshold: parseFloat(e.target.value) || 0,
                  })
                }
                className="pl-7"
                placeholder="0 for no free delivery"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="est-time">Estimated Delivery Time (min)</Label>
            <Input
              id="est-time"
              type="number"
              min="0"
              value={formData.estimated_time_minutes}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  estimated_time_minutes: parseInt(e.target.value) || 0,
                })
              }
              required
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
