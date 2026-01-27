'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
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
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type Customer = Tables<'customers'>;

const customerFormSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
});

type CustomerFormValues = z.infer<typeof customerFormSchema>;

interface CustomerFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    customer?: Customer | null; // If provided, we're in edit mode
}

function generateCustomerCode(): string {
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `CUST-${randomPart}`;
}

export function CustomerFormDialog({ open, onOpenChange, customer }: CustomerFormDialogProps) {
    const queryClient = useQueryClient();
    const isEditMode = !!customer;

    const form = useForm<CustomerFormValues>({
        resolver: zodResolver(customerFormSchema),
        defaultValues: {
            name: customer?.name ?? '',
            address: customer?.address ?? '',
            phone: customer?.phone ?? '',
            email: customer?.email ?? '',
        },
    });

    // Reset form when dialog opens or customer changes
    useEffect(() => {
        if (open) {
            form.reset({
                name: customer?.name ?? '',
                address: customer?.address ?? '',
                phone: customer?.phone ?? '',
                email: customer?.email ?? '',
            });
        }
    }, [open, customer, form]);

    const mutation = useMutation({
        mutationFn: async (values: CustomerFormValues) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            if (isEditMode && customer) {
                // Update existing customer
                const { error } = await supabase
                    .from('customers')
                    .update({
                        name: values.name,
                        address: values.address || null,
                        phone: values.phone || null,
                        // Note: email field requires database migration to be applied
                        // email: values.email || null,
                    })
                    .eq('id', customer.id);
                if (error) throw error;
            } else {
                // Insert new customer
                const { error } = await supabase
                    .from('customers')
                    .insert({
                        customer_code: generateCustomerCode(),
                        name: values.name,
                        address: values.address || null,
                        phone: values.phone || null,
                        // Note: email field requires database migration to be applied
                        // email: values.email || null,
                        user_id: user.id,
                    });
                if (error) throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            toast.success(isEditMode ? 'Customer updated successfully' : 'Customer added successfully');
            form.reset();
            onOpenChange(false);
        },
        onError: (error) => {
            toast.error(`Failed to ${isEditMode ? 'update' : 'add'} customer: ${error.message}`);
        },
    });

    const onSubmit = (values: CustomerFormValues) => {
        mutation.mutate(values);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? 'Update the customer details below.'
                            : 'Fill in the details to add a new customer. Customer ID will be auto-generated.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Customer ID (read-only, shown only in edit mode) */}
                        {isEditMode && customer && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Customer ID</label>
                                <Input
                                    value={customer.customer_code}
                                    disabled
                                    className="bg-muted font-mono"
                                />
                            </div>
                        )}

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Customer name" {...field} />
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
                                        <Input placeholder="Customer address" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Phone number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="Email address" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={mutation.isPending}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={mutation.isPending}>
                                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isEditMode ? 'Save Changes' : 'Add Customer'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
