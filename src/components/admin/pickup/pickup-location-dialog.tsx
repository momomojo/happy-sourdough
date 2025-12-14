'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { PickupLocation } from '@/types/database';
import { createPickupLocation, updatePickupLocation, PickupLocationInsert } from '@/lib/pickup-locations.client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Pencil, Loader2 } from 'lucide-react';

const formSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    address: z.string().min(5, 'Address must be at least 5 characters'),
    city: z.string().min(2, 'City must be at least 2 characters'),
    state: z.string().min(2, 'State must be at least 2 characters'),
    zip: z.string().min(5, 'ZIP code must be at least 5 characters'),
    instructions: z.string().optional().nullable(),
    sort_order: z.coerce.number().min(0).default(0),
    is_active: z.boolean().default(true),
});

type PickupLocationFormValues = z.infer<typeof formSchema>;

interface PickupLocationDialogProps {
    mode: 'create' | 'edit';
    location?: PickupLocation;
}

export function PickupLocationDialog({ mode, location }: PickupLocationDialogProps) {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    const form = useForm<PickupLocationFormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            name: location?.name || '',
            address: location?.address || '',
            city: location?.city || '',
            state: location?.state || 'CA',
            zip: location?.zip || '',
            instructions: location?.instructions || '',
            sort_order: location?.sort_order ?? 0,
            is_active: location?.is_active ?? true,
        },
    });

    const onSubmit = async (values: PickupLocationFormValues) => {
        try {
            if (mode === 'create') {
                // Ensure proper type matching for insertion
                const submitData: PickupLocationInsert = {
                    ...values,
                    instructions: values.instructions || null,
                    operating_hours: null, // Default to null for now as it's not in the form
                };
                const result = await createPickupLocation(submitData);
                if (result.success) {
                    toast.success('Pickup location created');
                    setOpen(false);
                    form.reset();
                    router.refresh();
                } else {
                    toast.error('Failed to create location: ' + result.error);
                }
            } else {
                if (!location?.id) return;
                const updateData: Partial<PickupLocation> = {
                    ...values,
                    instructions: values.instructions || null,
                };
                const result = await updatePickupLocation(location.id, updateData);
                if (result.success) {
                    toast.success('Pickup location updated');
                    setOpen(false);
                    router.refresh();
                } else {
                    toast.error('Failed to update location: ' + result.error);
                }
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
            console.error(error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {mode === 'create' ? (
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Location
                    </Button>
                ) : (
                    <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{mode === 'create' ? 'Add Pickup Location' : 'Edit Pickup Location'}</DialogTitle>
                    <DialogDescription>
                        {mode === 'create'
                            ? 'Add a new location where customers can pick up their orders.'
                            : 'Update the details for this pickup location.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Location Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Downtown Branch" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="123 Main St" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="city"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>City</FormLabel>
                                        <FormControl>
                                            <Input placeholder="San Francisco" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="zip"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>ZIP Code</FormLabel>
                                        <FormControl>
                                            <Input placeholder="94105" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="instructions"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Pickup Instructions</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="e.g. Enter side door code 1234"
                                            className="resize-none"
                                            {...field}
                                            value={field.value || ''}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-between gap-4">
                            <FormField
                                control={form.control}
                                name="sort_order"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Sort Order</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="is_active"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm flex-1">
                                        <div className="space-y-0.5">
                                            <FormLabel>Active</FormLabel>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {mode === 'create' ? 'Create Location' : 'Save Changes'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
