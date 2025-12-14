'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Pencil } from 'lucide-react';
import type { DeliveryZone } from '@/types/database';
import { toggleZoneActive } from '@/lib/supabase/admin/zones';
import { toast } from 'sonner';

interface ZoneTableProps {
  zones: DeliveryZone[];
  onEdit: (zone: DeliveryZone) => void;
  onUpdate: () => void;
}

export function ZoneTable({ zones, onEdit, onUpdate }: ZoneTableProps) {
  const [togglingZones, setTogglingZones] = useState<Set<string>>(new Set());

  const handleToggleActive = async (zoneId: string, currentActive: boolean) => {
    setTogglingZones(prev => new Set(prev).add(zoneId));

    try {
      await toggleZoneActive(zoneId, !currentActive);
      toast.success(`Zone ${!currentActive ? 'activated' : 'deactivated'} successfully`);
      onUpdate();
    } catch (error) {
      console.error('Error toggling zone:', error);
      toast.error('Failed to update zone status');
    } finally {
      setTogglingZones(prev => {
        const next = new Set(prev);
        next.delete(zoneId);
        return next;
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Zone</TableHead>
            <TableHead>ZIP Codes</TableHead>
            <TableHead>Min Order</TableHead>
            <TableHead>Delivery Fee</TableHead>
            <TableHead>Free Delivery</TableHead>
            <TableHead>Est. Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {zones.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground">
                No delivery zones found
              </TableCell>
            </TableRow>
          ) : (
            zones.map((zone) => (
              <TableRow key={zone.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{zone.name}</div>
                    {zone.description && (
                      <div className="text-sm text-muted-foreground">
                        {zone.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {zone.zip_codes.slice(0, 3).map((zip) => (
                      <Badge key={zip} variant="outline" className="text-xs">
                        {zip}
                      </Badge>
                    ))}
                    {zone.zip_codes.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{zone.zip_codes.length - 3}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>{formatCurrency(zone.min_order)}</TableCell>
                <TableCell>
                  {zone.delivery_fee === 0 ? (
                    <span className="text-green-600 font-medium">Free</span>
                  ) : (
                    formatCurrency(zone.delivery_fee)
                  )}
                </TableCell>
                <TableCell>
                  {zone.free_delivery_threshold ? (
                    <span className="text-sm">
                      Over {formatCurrency(zone.free_delivery_threshold)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {zone.estimated_time_minutes} min
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={zone.is_active ?? false}
                      onCheckedChange={() =>
                        handleToggleActive(zone.id, zone.is_active ?? false)
                      }
                      disabled={togglingZones.has(zone.id)}
                    />
                    <span className="text-sm text-muted-foreground">
                      {zone.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(zone)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
