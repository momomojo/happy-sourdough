'use client';

import { useState } from 'react';
import { MapPin, Plus, Pencil, Trash2, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AddressDialog } from './address-dialog';
import { deleteAddress, updateAddress } from '@/lib/supabase/customer';
import type { CustomerAddress } from '@/types/database';
import { toast } from 'sonner';

interface AddressListProps {
  userId: string;
  initialAddresses: CustomerAddress[];
}

export function AddressList({ userId, initialAddresses }: AddressListProps) {
  const [addresses, setAddresses] = useState<CustomerAddress[]>(initialAddresses);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null);

  const handleAddAddress = (newAddress: CustomerAddress) => {
    setAddresses((prev) => [newAddress, ...prev]);
    setDialogOpen(false);
    toast.success('Address added successfully');
  };

  const handleEditAddress = (updatedAddress: CustomerAddress) => {
    setAddresses((prev) =>
      prev.map((addr) => (addr.id === updatedAddress.id ? updatedAddress : addr))
    );
    setEditingAddress(null);
    setDialogOpen(false);
    toast.success('Address updated successfully');
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }

    const success = await deleteAddress(id, userId);
    if (success) {
      setAddresses((prev) => prev.filter((addr) => addr.id !== id));
      toast.success('Address deleted successfully');
    } else {
      toast.error('Failed to delete address');
    }
  };

  const handleSetDefault = async (id: string) => {
    const updated = await updateAddress(id, userId, { is_default: true });
    if (updated) {
      setAddresses((prev) =>
        prev.map((addr) => ({
          ...addr,
          is_default: addr.id === id,
        }))
      );
      toast.success('Default address updated');
    } else {
      toast.error('Failed to update default address');
    }
  };

  const openEditDialog = (address: CustomerAddress) => {
    setEditingAddress(address);
    setDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingAddress(null);
    setDialogOpen(true);
  };

  return (
    <div>
      {/* Add Address Button */}
      <div className="mb-6">
        <Button onClick={openAddDialog} size="lg" className="shadow-md hover:shadow-lg transition-all duration-200">
          <Plus className="mr-2 h-4 w-4" />
          Add New Address
        </Button>
      </div>

      {/* Addresses Grid */}
      {addresses.length === 0 ? (
        <Card className="border-2 shadow-md rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-secondary/5 pointer-events-none" />
          <CardContent className="flex flex-col items-center justify-center py-16 relative">
            <div className="p-4 rounded-full bg-accent/10 mb-6">
              <MapPin className="h-12 w-12 text-accent-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No saved addresses</h3>
            <p className="text-sm text-muted-foreground mb-8 text-center max-w-md">
              Add a delivery address to make checkout faster and get your fresh bread delivered right to your door!
            </p>
            <Button onClick={openAddDialog} size="lg" className="shadow-md">
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Address
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {addresses.map((address) => (
            <Card
              key={address.id}
              className={`border-2 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden group ${
                address.is_default ? 'border-primary/50 ring-2 ring-primary/20' : ''
              }`}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full -translate-y-12 translate-x-12 group-hover:scale-110 transition-transform duration-300" />
              <CardHeader className="relative">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <CardTitle className="text-lg font-bold">
                      {address.label || 'Address'}
                    </CardTitle>
                  </div>
                  {address.is_default && (
                    <Badge
                      variant="default"
                      className="ml-2 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
                    >
                      <Check className="mr-1 h-3 w-3" />
                      Default
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-5 relative">
                <div className="text-sm space-y-2 p-4 rounded-lg bg-muted/30">
                  <p className="font-medium text-foreground">{address.street}</p>
                  {address.apt && (
                    <p className="text-muted-foreground">Apt/Suite: {address.apt}</p>
                  )}
                  <p className="text-foreground">
                    {address.city}, {address.state} {address.zip}
                  </p>
                  {address.delivery_instructions && (
                    <p className="mt-3 pt-3 border-t border-border/40 text-muted-foreground italic">
                      Delivery note: {address.delivery_instructions}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {!address.is_default && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(address.id)}
                      className="border-2 hover:bg-primary/5 hover:border-primary/50 transition-all duration-200"
                    >
                      Set as Default
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(address)}
                    className="border-2 hover:bg-secondary/5 hover:border-secondary/50 transition-all duration-200"
                  >
                    <Pencil className="mr-2 h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteAddress(address.id)}
                    className="border-2 hover:bg-destructive/5 hover:border-destructive/50 hover:text-destructive transition-all duration-200"
                  >
                    <Trash2 className="mr-2 h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Address Dialog */}
      <AddressDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingAddress(null);
          }
        }}
        userId={userId}
        address={editingAddress}
        onSave={editingAddress ? handleEditAddress : handleAddAddress}
      />
    </div>
  );
}
