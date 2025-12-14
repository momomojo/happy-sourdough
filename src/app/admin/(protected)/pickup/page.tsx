import { Suspense } from 'react';
import { getActivePickupLocations, getAllPickupLocations } from '@/lib/pickup-locations';
import { PickupLocationList } from '@/components/admin/pickup/pickup-location-list';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PickupLocationDialog } from '@/components/admin/pickup/pickup-location-dialog';

// Server component for fetching data
async function PickupLocationsContent() {
    const locations = await getAllPickupLocations();
    return <PickupLocationList initialLocations={locations} />;
}

export default function PickupLocationsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Pickup Locations</h1>
                    <p className="text-muted-foreground">
                        Manage available pickup locations for customers.
                    </p>
                </div>
                <PickupLocationDialog mode="create" />
            </div>

            <Suspense fallback={<div>Loading locations...</div>}>
                <PickupLocationsContent />
            </Suspense>
        </div>
    );
}
