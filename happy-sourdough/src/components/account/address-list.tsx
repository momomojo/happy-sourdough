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
        <Button onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Address
        </Button>
      </div>

      {/* Addresses Grid */}
      {addresses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No saved addresses</h3>
            <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
              Add a delivery address to make checkout faster next time.
            </p>
            <Button onClick={openAddDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Address
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <Card key={address.id} className={address.is_default ? 'border-primary' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">
                    {address.label || 'Address'}
                  </CardTitle>
                  {address.is_default && (
                    <Badge variant="default" className="ml-2">
                      <Check className="mr-1 h-3 w-3" />
                      Default
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm">
                  <p>{address.street}</p>
                  {address.apt && <p>Apt/Suite: {address.apt}</p>}
                  <p>
                    {address.city}, {address.state} {address.zip}
                  </p>
                  {address.delivery_instructions && (
                    <p className="mt-2 text-muted-foreground">
                      Note: {address.delivery_instructions}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {!address.is_default && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(address.id)}
                    >
                      Set as Default
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(address)}
                  >
                    <Pencil className="mr-2 h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteAddress(address.id)}
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
