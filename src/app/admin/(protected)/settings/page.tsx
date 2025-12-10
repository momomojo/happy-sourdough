'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Building2,
  Receipt,
  Clock,
  Truck,
  Store,
  Bell,
  Loader2,
  Save,
  RefreshCw,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface BusinessSettings {
  business_name: string;
  business_phone: string;
  business_email: string;
  business_address: string;
  tax_settings: {
    type: 'flat' | 'by_zone' | 'by_distance';
    rate: number;
    name: string;
    zones: { zone_id: string; rate: number }[];
  };
  operating_hours: {
    [key: string]: { open: string; close: string; closed: boolean };
  };
  slot_settings: {
    slot_duration_minutes: number;
    max_orders_per_slot: number;
    advance_booking_days: number;
  };
  delivery_settings: {
    enabled: boolean;
    cutoff_hours: number;
  };
  pickup_settings: {
    enabled: boolean;
    cutoff_hours: number;
    location_notes: string;
  };
  order_settings: {
    allow_guest_checkout: boolean;
    require_phone: boolean;
    default_instructions: string;
  };
  notification_settings: {
    email_order_confirmation: boolean;
    email_status_updates: boolean;
    email_delivery_reminders: boolean;
  };
}

const defaultSettings: BusinessSettings = {
  business_name: 'Happy Sourdough',
  business_phone: '+1 (555) 123-4567',
  business_email: 'hello@happysourdough.com',
  business_address: '123 Bakery Lane, San Francisco, CA 94102',
  tax_settings: {
    type: 'flat',
    rate: 0.08,
    name: 'Sales Tax',
    zones: [],
  },
  operating_hours: {
    monday: { open: '07:00', close: '19:00', closed: false },
    tuesday: { open: '07:00', close: '19:00', closed: false },
    wednesday: { open: '07:00', close: '19:00', closed: false },
    thursday: { open: '07:00', close: '19:00', closed: false },
    friday: { open: '07:00', close: '19:00', closed: false },
    saturday: { open: '08:00', close: '17:00', closed: false },
    sunday: { open: '08:00', close: '14:00', closed: false },
  },
  slot_settings: {
    slot_duration_minutes: 120,
    max_orders_per_slot: 10,
    advance_booking_days: 14,
  },
  delivery_settings: {
    enabled: true,
    cutoff_hours: 24,
  },
  pickup_settings: {
    enabled: true,
    cutoff_hours: 2,
    location_notes: 'Enter through the main entrance on Bakery Lane',
  },
  order_settings: {
    allow_guest_checkout: true,
    require_phone: true,
    default_instructions: '',
  },
  notification_settings: {
    email_order_confirmation: true,
    email_status_updates: true,
    email_delivery_reminders: true,
  },
};

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function SettingsPage() {
  const [settings, setSettings] = useState<BusinessSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('business_settings')
        .select('key, value') as { data: { key: string; value: unknown }[] | null; error: unknown };

      if (error) throw error;

      const loadedSettings = { ...defaultSettings };
      data?.forEach((row) => {
        const key = row.key as keyof BusinessSettings;
        if (key in loadedSettings) {
          (loadedSettings as Record<string, unknown>)[key] = row.value;
        }
      });

      setSettings(loadedSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const saveSetting = async (key: keyof BusinessSettings, value: unknown) => {
    setIsSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('business_settings')
        .upsert(
          { key, value } as never,
          { onConflict: 'key' }
        );

      if (error) throw error;

      toast.success('Setting saved');
    } catch (error) {
      console.error('Error saving setting:', error);
      toast.error('Failed to save setting');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = <K extends keyof BusinessSettings>(
    key: K,
    value: BusinessSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground mt-1">
              Configure your bakery&apos;s business settings
            </p>
          </div>
          <Button variant="outline" onClick={loadSettings} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="business" className="space-y-6">
        <TabsList className="grid grid-cols-3 lg:grid-cols-6 h-auto gap-2">
          <TabsTrigger value="business" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Business</span>
          </TabsTrigger>
          <TabsTrigger value="tax" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            <span className="hidden sm:inline">Tax</span>
          </TabsTrigger>
          <TabsTrigger value="hours" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Hours</span>
          </TabsTrigger>
          <TabsTrigger value="delivery" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            <span className="hidden sm:inline">Delivery</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            <span className="hidden sm:inline">Orders</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Alerts</span>
          </TabsTrigger>
        </TabsList>

        {/* Business Information */}
        <TabsContent value="business">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>
                Your bakery&apos;s public contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="business_name">Business Name</Label>
                  <Input
                    id="business_name"
                    value={settings.business_name}
                    onChange={(e) => updateSetting('business_name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business_phone">Phone</Label>
                  <Input
                    id="business_phone"
                    value={settings.business_phone}
                    onChange={(e) => updateSetting('business_phone', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="business_email">Email</Label>
                <Input
                  id="business_email"
                  type="email"
                  value={settings.business_email}
                  onChange={(e) => updateSetting('business_email', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business_address">Address</Label>
                <Textarea
                  id="business_address"
                  value={settings.business_address}
                  onChange={(e) => updateSetting('business_address', e.target.value)}
                  rows={2}
                />
              </div>
              <Button
                onClick={() => {
                  saveSetting('business_name', settings.business_name);
                  saveSetting('business_phone', settings.business_phone);
                  saveSetting('business_email', settings.business_email);
                  saveSetting('business_address', settings.business_address);
                }}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Business Info
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax Settings */}
        <TabsContent value="tax">
          <Card>
            <CardHeader>
              <CardTitle>Tax Configuration</CardTitle>
              <CardDescription>
                Configure how sales tax is calculated
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tax_type">Tax Calculation Method</Label>
                <Select
                  value={settings.tax_settings.type}
                  onValueChange={(value: 'flat' | 'by_zone' | 'by_distance') =>
                    updateSetting('tax_settings', { ...settings.tax_settings, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flat">Flat Rate</SelectItem>
                    <SelectItem value="by_zone">By Delivery Zone</SelectItem>
                    <SelectItem value="by_distance">By Distance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tax_name">Tax Name</Label>
                  <Input
                    id="tax_name"
                    value={settings.tax_settings.name}
                    onChange={(e) =>
                      updateSetting('tax_settings', { ...settings.tax_settings, name: e.target.value })
                    }
                    placeholder="e.g., Sales Tax"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax_rate">
                    Tax Rate (%)
                  </Label>
                  <Input
                    id="tax_rate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={(settings.tax_settings.rate * 100).toFixed(2)}
                    onChange={(e) =>
                      updateSetting('tax_settings', {
                        ...settings.tax_settings,
                        rate: parseFloat(e.target.value) / 100 || 0,
                      })
                    }
                  />
                </div>
              </div>

              <div className="rounded-lg bg-muted p-4 text-sm">
                <p className="font-medium">Current Tax: {(settings.tax_settings.rate * 100).toFixed(2)}%</p>
                <p className="text-muted-foreground mt-1">
                  Example: $10.00 item + {(settings.tax_settings.rate * 10).toFixed(2)} tax = ${(10 + settings.tax_settings.rate * 10).toFixed(2)}
                </p>
              </div>

              <Button
                onClick={() => saveSetting('tax_settings', settings.tax_settings)}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Tax Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Operating Hours */}
        <TabsContent value="hours">
          <Card>
            <CardHeader>
              <CardTitle>Operating Hours</CardTitle>
              <CardDescription>
                Set your bakery&apos;s opening and closing times
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {DAYS.map((day) => {
                const hours = settings.operating_hours[day];
                return (
                  <div key={day} className="flex items-center gap-4 py-2">
                    <div className="w-24 font-medium capitalize">{day}</div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={!hours.closed}
                        onCheckedChange={(checked) =>
                          updateSetting('operating_hours', {
                            ...settings.operating_hours,
                            [day]: { ...hours, closed: !checked },
                          })
                        }
                      />
                      <span className="text-sm text-muted-foreground w-12">
                        {hours.closed ? 'Closed' : 'Open'}
                      </span>
                    </div>
                    {!hours.closed && (
                      <>
                        <Input
                          type="time"
                          value={hours.open}
                          onChange={(e) =>
                            updateSetting('operating_hours', {
                              ...settings.operating_hours,
                              [day]: { ...hours, open: e.target.value },
                            })
                          }
                          className="w-32"
                        />
                        <span className="text-muted-foreground">to</span>
                        <Input
                          type="time"
                          value={hours.close}
                          onChange={(e) =>
                            updateSetting('operating_hours', {
                              ...settings.operating_hours,
                              [day]: { ...hours, close: e.target.value },
                            })
                          }
                          className="w-32"
                        />
                      </>
                    )}
                  </div>
                );
              })}

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Time Slot Settings</h4>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Slot Duration (minutes)</Label>
                    <Input
                      type="number"
                      value={settings.slot_settings.slot_duration_minutes}
                      onChange={(e) =>
                        updateSetting('slot_settings', {
                          ...settings.slot_settings,
                          slot_duration_minutes: parseInt(e.target.value) || 60,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Orders per Slot</Label>
                    <Input
                      type="number"
                      value={settings.slot_settings.max_orders_per_slot}
                      onChange={(e) =>
                        updateSetting('slot_settings', {
                          ...settings.slot_settings,
                          max_orders_per_slot: parseInt(e.target.value) || 5,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Advance Booking (days)</Label>
                    <Input
                      type="number"
                      value={settings.slot_settings.advance_booking_days}
                      onChange={(e) =>
                        updateSetting('slot_settings', {
                          ...settings.slot_settings,
                          advance_booking_days: parseInt(e.target.value) || 7,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={() => {
                  saveSetting('operating_hours', settings.operating_hours);
                  saveSetting('slot_settings', settings.slot_settings);
                }}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Hours & Slots
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delivery & Pickup */}
        <TabsContent value="delivery">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Settings</CardTitle>
                <CardDescription>
                  Configure delivery options and cutoff times
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Delivery</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow customers to choose delivery
                    </p>
                  </div>
                  <Switch
                    checked={settings.delivery_settings.enabled}
                    onCheckedChange={(checked) =>
                      updateSetting('delivery_settings', {
                        ...settings.delivery_settings,
                        enabled: checked,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Order Cutoff (hours before slot)</Label>
                  <Input
                    type="number"
                    value={settings.delivery_settings.cutoff_hours}
                    onChange={(e) =>
                      updateSetting('delivery_settings', {
                        ...settings.delivery_settings,
                        cutoff_hours: parseInt(e.target.value) || 24,
                      })
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Customers must order at least this many hours before their delivery slot
                  </p>
                </div>

                <Button
                  onClick={() => saveSetting('delivery_settings', settings.delivery_settings)}
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Delivery Settings
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pickup Settings</CardTitle>
                <CardDescription>
                  Configure in-store pickup options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Pickup</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow customers to pick up at the bakery
                    </p>
                  </div>
                  <Switch
                    checked={settings.pickup_settings.enabled}
                    onCheckedChange={(checked) =>
                      updateSetting('pickup_settings', {
                        ...settings.pickup_settings,
                        enabled: checked,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Order Cutoff (hours before slot)</Label>
                  <Input
                    type="number"
                    value={settings.pickup_settings.cutoff_hours}
                    onChange={(e) =>
                      updateSetting('pickup_settings', {
                        ...settings.pickup_settings,
                        cutoff_hours: parseInt(e.target.value) || 2,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Pickup Location Notes</Label>
                  <Textarea
                    value={settings.pickup_settings.location_notes}
                    onChange={(e) =>
                      updateSetting('pickup_settings', {
                        ...settings.pickup_settings,
                        location_notes: e.target.value,
                      })
                    }
                    placeholder="Instructions for customers picking up orders..."
                    rows={3}
                  />
                </div>

                <Button
                  onClick={() => saveSetting('pickup_settings', settings.pickup_settings)}
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Pickup Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Order Settings */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Order Settings</CardTitle>
              <CardDescription>
                Configure checkout and order options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow Guest Checkout</Label>
                  <p className="text-sm text-muted-foreground">
                    Let customers order without creating an account
                  </p>
                </div>
                <Switch
                  checked={settings.order_settings.allow_guest_checkout}
                  onCheckedChange={(checked) =>
                    updateSetting('order_settings', {
                      ...settings.order_settings,
                      allow_guest_checkout: checked,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Require Phone Number</Label>
                  <p className="text-sm text-muted-foreground">
                    Make phone number mandatory at checkout
                  </p>
                </div>
                <Switch
                  checked={settings.order_settings.require_phone}
                  onCheckedChange={(checked) =>
                    updateSetting('order_settings', {
                      ...settings.order_settings,
                      require_phone: checked,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Default Order Instructions</Label>
                <Textarea
                  value={settings.order_settings.default_instructions}
                  onChange={(e) =>
                    updateSetting('order_settings', {
                      ...settings.order_settings,
                      default_instructions: e.target.value,
                    })
                  }
                  placeholder="Default message shown to customers..."
                  rows={3}
                />
              </div>

              <Button
                onClick={() => saveSetting('order_settings', settings.order_settings)}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Order Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Configure which email notifications are sent to customers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Order Confirmation</Label>
                  <p className="text-sm text-muted-foreground">
                    Send email when order is placed
                  </p>
                </div>
                <Switch
                  checked={settings.notification_settings.email_order_confirmation}
                  onCheckedChange={(checked) =>
                    updateSetting('notification_settings', {
                      ...settings.notification_settings,
                      email_order_confirmation: checked,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Status Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Send email when order status changes
                  </p>
                </div>
                <Switch
                  checked={settings.notification_settings.email_status_updates}
                  onCheckedChange={(checked) =>
                    updateSetting('notification_settings', {
                      ...settings.notification_settings,
                      email_status_updates: checked,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Delivery Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Send reminder before delivery/pickup
                  </p>
                </div>
                <Switch
                  checked={settings.notification_settings.email_delivery_reminders}
                  onCheckedChange={(checked) =>
                    updateSetting('notification_settings', {
                      ...settings.notification_settings,
                      email_delivery_reminders: checked,
                    })
                  }
                />
              </div>

              <Button
                onClick={() => saveSetting('notification_settings', settings.notification_settings)}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
