'use client';

import { useEffect, useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { getActivePickupLocationsClient } from '@/lib/pickup-locations.client';
import { PickupLocation } from '@/types/database';
import { Loader2 } from 'lucide-react';

interface PickupLocationSelectorProps {
    value?: string;
    onChange: (value: string) => void;
}

export function PickupLocationSelector({ value, onChange }: PickupLocationSelectorProps) {
    const [locations, setLocations] = useState<PickupLocation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadLocations() {
            try {
                const data = await getActivePickupLocationsClient();
                setLocations(data);
                // Select first location by default if none selected and data exists
                if (!value && data.length > 0) {
                    onChange(data[0].id);
                }
            } catch (err) {
                console.error('Failed to load locations', err);
            } finally {
                setLoading(false);
            }
        }
        loadLocations();
    }, []);

    if (loading) {
        return <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading locations...</div>;
    }

    if (locations.length === 0) {
        return <div className="text-sm text-destructive">No active pickup locations found.</div>;
    }

    return (
        <RadioGroup value={value} onValueChange={onChange} className="grid gap-4">
            {locations.map((loc) => (
                <Card key={loc.id} className={value === loc.id ? 'border-primary ring-1 ring-primary' : ''}>
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            <RadioGroupItem value={loc.id} id={loc.id} className="mt-1" />
                            <Label htmlFor={loc.id} className="flex-1 cursor-pointer">
                                <div className="font-semibold">{loc.name}</div>
                                <div className="text-sm text-muted-foreground">
                                    <div>{loc.address}</div>
                                    <div>{loc.city}, {loc.state} {loc.zip}</div>
                                </div>
                                {loc.instructions && (
                                    <div className="text-xs text-muted-foreground mt-2 italic">
                                        Note: {loc.instructions}
                                    </div>
                                )}
                            </Label>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </RadioGroup>
    );
}
