'use client';

import { useState, useEffect } from 'react';
import { ZoneTable } from '@/components/admin/zones/zone-table';
import { ZoneForm } from '@/components/admin/zones/zone-form';
import { SlotGenerator } from '@/components/admin/zones/slot-generator';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Clock, RefreshCw } from 'lucide-react';
import type { DeliveryZone } from '@/types/database';
import { getZones } from '@/lib/supabase/admin/zones';
import { toast } from 'sonner';

export default function ZonesPage() {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [selectedZone, setSelectedZone] = useState<DeliveryZone | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadZones = async () => {
    setIsLoading(true);
    try {
      const data = await getZones();
      setZones(data);
    } catch (error) {
      console.error('Error loading zones:', error);
      toast.error('Failed to load delivery zones');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadZones();
  }, []);

  const handleEdit = (zone: DeliveryZone) => {
    setSelectedZone(zone);
    setIsEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setSelectedZone(null);
    loadZones();
  };

  const handleEditCancel = () => {
    setIsEditDialogOpen(false);
    setSelectedZone(null);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Delivery Zone Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage delivery zones, fees, and time slot availability
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadZones}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="zones" className="space-y-6">
        <TabsList>
          <TabsTrigger value="zones" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Delivery Zones
          </TabsTrigger>
          <TabsTrigger value="slots" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Time Slots
          </TabsTrigger>
        </TabsList>

        <TabsContent value="zones" className="space-y-6">
          {/* Zone Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Zone Configuration</CardTitle>
              <CardDescription>
                Configure delivery zones with ZIP codes, minimum orders, and delivery fees.
                Customers will be assigned to zones based on their delivery address.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Zone 1 - Close Range</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>Minimum order: $25</li>
                    <li>Delivery fee: Free</li>
                    <li>Closest ZIP codes</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Zone 2 - Mid Range</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>Minimum order: $40</li>
                    <li>Delivery fee: $5</li>
                    <li>Free over $75</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Zone 3 - Far Range</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>Minimum order: $60</li>
                    <li>Delivery fee: $10</li>
                    <li>Free over $100</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Zones Table */}
          <Card>
            <CardHeader>
              <CardTitle>Active Zones</CardTitle>
              <CardDescription>
                Click edit to modify zone settings. Use the toggle to activate/deactivate zones.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading zones...
                </div>
              ) : (
                <ZoneTable
                  zones={zones}
                  onEdit={handleEdit}
                  onUpdate={loadZones}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="slots" className="space-y-6">
          <SlotGenerator />

          {/* Instructions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Time Slot Management</CardTitle>
              <CardDescription>
                Time slots control when customers can schedule pickups and deliveries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">How it works:</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Create time slots for specific date ranges</li>
                    <li>Each slot has a maximum order capacity</li>
                    <li>Slots can be for pickup, delivery, or both</li>
                    <li>Customers select available slots during checkout</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Best practices:</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Generate slots at least 2 weeks in advance</li>
                    <li>Typical slots: 9-11am, 1-3pm, 5-7pm</li>
                    <li>Adjust max orders based on production capacity</li>
                    <li>Consider separate pickup/delivery slots for busy periods</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Zone Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Delivery Zone</DialogTitle>
            <DialogDescription>
              Update zone configuration, ZIP codes, and delivery fees
            </DialogDescription>
          </DialogHeader>
          {selectedZone && (
            <ZoneForm
              zone={selectedZone}
              onSuccess={handleEditSuccess}
              onCancel={handleEditCancel}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
