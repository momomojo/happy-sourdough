'use client';

import { useState } from 'react';
import { PickupLocation } from '@/types/database';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { PickupLocationDialog } from './pickup-location-dialog';
import { deletePickupLocation } from '@/lib/pickup-locations.client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface PickupLocationListProps {
    initialLocations: PickupLocation[];
}

export function PickupLocationList({ initialLocations }: PickupLocationListProps) {
    const [locations, setLocations] = useState(initialLocations);
    const router = useRouter();

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this location?')) return;

        const result = await deletePickupLocation(id);
        if (result.success) {
            toast.success('Location deleted successfully');
            setLocations(locations.filter((loc) => loc.id !== id));
            router.refresh(); // Refresh server data
        } else {
            toast.error('Failed to delete location: ' + result.error);
        }
    };

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Sort</TableHead>
                        <TableHead>Location Name</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>City/Zip</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {locations.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                                No pickup locations found. Create one to get started.
                            </TableCell>
                        </TableRow>
                    ) : (
                        locations.map((location) => (
                            <TableRow key={location.id}>
                                <TableCell>{location.sort_order}</TableCell>
                                <TableCell className="font-medium">{location.name}</TableCell>
                                <TableCell>{location.address}</TableCell>
                                <TableCell>
                                    {location.city}, {location.state} {location.zip}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={location.is_active ? 'default' : 'secondary'}>
                                        {location.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <PickupLocationDialog mode="edit" location={location} />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(location.id)}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                            <span className="sr-only">Delete</span>
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
