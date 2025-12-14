'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { User, MapPin, ShoppingBag, Loader2, LogOut, Plus, Trash2 } from 'lucide-react';
import type { CustomerProfile, CustomerAddress, Order } from '@/types/database';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function CustomerProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  // Form state for profile
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  // Form state for new address
  const [newAddress, setNewAddress] = useState({
    label: '',
    street: '',
    apt: '',
    city: '',
    state: 'CA',
    zip: '',
    delivery_instructions: '',
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setIsLoading(true);
    const supabase = createClient();

    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      router.push('/account/login?redirect=/account/profile');
      return;
    }

    setUser({ id: user.id, email: user.email || '' });

    // Load profile
    const { data: profileData, error: profileError } = await (supabase
      .from('customer_profiles') as ReturnType<typeof supabase.from>)
      .select('*')
      .eq('id', user.id)
      .single() as { data: CustomerProfile | null; error: { code?: string } | null };

    if (!profileError && profileData) {
      setProfile(profileData);
      setFirstName(profileData.first_name || '');
      setLastName(profileData.last_name || '');
      setPhone(profileData.phone || '');
    } else if (profileError?.code === 'PGRST116') {
      // Profile doesn't exist, create it
      const { data: newProfile, error: createError } = await (supabase
        .from('customer_profiles') as ReturnType<typeof supabase.from>)
        .insert({
          id: user.id,
          first_name: user.user_metadata?.first_name || null,
          last_name: user.user_metadata?.last_name || null,
          phone: user.user_metadata?.phone || null,
        })
        .select()
        .single() as { data: CustomerProfile | null; error: { code?: string } | null };

      if (!createError && newProfile) {
        setProfile(newProfile);
        setFirstName(newProfile.first_name || '');
        setLastName(newProfile.last_name || '');
        setPhone(newProfile.phone || '');
      }
    }

    // Load addresses
    const { data: addressData } = await (supabase
      .from('customer_addresses') as ReturnType<typeof supabase.from>)
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false }) as { data: CustomerAddress[] | null };

    if (addressData) {
      setAddresses(addressData);
    }

    // Load recent orders
    const { data: orderData } = await (supabase
      .from('orders') as ReturnType<typeof supabase.from>)
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10) as { data: Order[] | null };

    if (orderData) {
      setOrders(orderData);
    }

    setIsLoading(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const supabase = createClient();
    const { error } = await (supabase
      .from('customer_profiles') as ReturnType<typeof supabase.from>)
      .update({
        first_name: firstName,
        last_name: lastName,
        phone: phone,
      })
      .eq('id', user!.id);

    if (error) {
      toast.error('Failed to update profile');
      console.error(error);
    } else {
      toast.success('Profile updated successfully!');
      loadUserData();
    }

    setIsSaving(false);
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const supabase = createClient();

    // If this is the first address, make it default
    const isFirstAddress = addresses.length === 0;

    const { error } = await (supabase
      .from('customer_addresses') as ReturnType<typeof supabase.from>)
      .insert({
        user_id: user!.id,
        ...newAddress,
        is_default: isFirstAddress,
      });

    if (error) {
      toast.error('Failed to add address');
      console.error(error);
    } else {
      toast.success('Address added successfully!');
      setNewAddress({
        label: '',
        street: '',
        apt: '',
        city: '',
        state: 'CA',
        zip: '',
        delivery_instructions: '',
      });
      setIsAddingAddress(false);
      loadUserData();
    }

    setIsSaving(false);
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }

    const supabase = createClient();
    const { error } = await (supabase
      .from('customer_addresses') as ReturnType<typeof supabase.from>)
      .delete()
      .eq('id', addressId);

    if (error) {
      toast.error('Failed to delete address');
      console.error(error);
    } else {
      toast.success('Address deleted successfully!');
      loadUserData();
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    const supabase = createClient();

    // Unset all defaults
    await (supabase
      .from('customer_addresses') as ReturnType<typeof supabase.from>)
      .update({ is_default: false })
      .eq('user_id', user!.id);

    // Set new default
    const { error } = await (supabase
      .from('customer_addresses') as ReturnType<typeof supabase.from>)
      .update({ is_default: true })
      .eq('id', addressId);

    if (error) {
      toast.error('Failed to set default address');
      console.error(error);
    } else {
      toast.success('Default address updated!');
      loadUserData();
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'picked_up':
        return 'default';
      case 'cancelled':
      case 'refunded':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Account</h1>
          <p className="text-muted-foreground mt-1">{user?.email}</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="addresses">
            <MapPin className="h-4 w-4 mr-2" />
            Addresses
          </TabsTrigger>
          <TabsTrigger value="orders">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Orders
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-sm text-muted-foreground">
                    Contact support to change your email address
                  </p>
                </div>

                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="addresses">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Saved Addresses</CardTitle>
                  <CardDescription>
                    Manage your delivery addresses
                  </CardDescription>
                </div>
                {!isAddingAddress && (
                  <Button onClick={() => setIsAddingAddress(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Address
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isAddingAddress && (
                <Card className="mb-6 border-2 border-primary">
                  <CardHeader>
                    <CardTitle className="text-lg">New Address</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddAddress} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="label">Label (e.g., Home, Work)</Label>
                        <Input
                          id="label"
                          value={newAddress.label}
                          onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                          placeholder="Home"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="street">Street Address</Label>
                        <Input
                          id="street"
                          value={newAddress.street}
                          onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="apt">Apartment, Suite, etc.</Label>
                        <Input
                          id="apt"
                          value={newAddress.apt}
                          onChange={(e) => setNewAddress({ ...newAddress, apt: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2 col-span-2">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={newAddress.city}
                            onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            value={newAddress.state}
                            onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                            maxLength={2}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="zip">ZIP Code</Label>
                        <Input
                          id="zip"
                          value={newAddress.zip}
                          onChange={(e) => setNewAddress({ ...newAddress, zip: e.target.value })}
                          maxLength={5}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="delivery_instructions">Delivery Instructions</Label>
                        <Input
                          id="delivery_instructions"
                          value={newAddress.delivery_instructions}
                          onChange={(e) => setNewAddress({ ...newAddress, delivery_instructions: e.target.value })}
                          placeholder="Gate code, special instructions, etc."
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button type="submit" disabled={isSaving}>
                          {isSaving ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            'Save Address'
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsAddingAddress(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {addresses.length === 0 && !isAddingAddress ? (
                <Alert>
                  <MapPin className="h-4 w-4" />
                  <AlertDescription>
                    No saved addresses yet. Add one to speed up checkout!
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <Card key={address.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {address.label && (
                                <span className="font-semibold">{address.label}</span>
                              )}
                              {address.is_default && (
                                <Badge variant="secondary">Default</Badge>
                              )}
                            </div>
                            <p className="text-sm">{address.street}</p>
                            {address.apt && <p className="text-sm">{address.apt}</p>}
                            <p className="text-sm">
                              {address.city}, {address.state} {address.zip}
                            </p>
                            {address.delivery_instructions && (
                              <p className="text-sm text-muted-foreground mt-2">
                                Instructions: {address.delivery_instructions}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {!address.is_default && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSetDefaultAddress(address.id)}
                              >
                                Set Default
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAddress(address.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>
                View your recent orders and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <Alert>
                  <ShoppingBag className="h-4 w-4" />
                  <AlertDescription>
                    No orders yet. Start shopping to see your orders here!
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Card key={order.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="font-semibold">Order #{order.order_number}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'} at{' '}
                              {order.created_at ? new Date(order.created_at).toLocaleTimeString() : 'N/A'}
                            </p>
                          </div>
                          <Badge variant={getStatusBadgeVariant(order.status || 'received')}>
                            {(order.status || 'received').replace('_', ' ')}
                          </Badge>
                        </div>
                        <Separator className="my-4" />
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Total</p>
                            <p className="font-semibold">${order.total.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">
                              {order.fulfillment_type === 'delivery' ? 'Delivery' : 'Pickup'}
                            </p>
                            <p className="font-semibold">
                              {new Date(order.delivery_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
