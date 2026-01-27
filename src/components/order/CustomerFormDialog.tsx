
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Assuming Textarea component exists, otherwise use Input
import { useCreateCustomer, useUpdateCustomer, Customer } from "@/hooks/useCustomers";
import { Loader2 } from "lucide-react";

const customerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    phone: z.string().optional(),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    address: z.string().optional(),
    customer_code: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

interface CustomerFormDialogProps {
    isOpen: boolean;
    onClose: () => void;
    customerToEdit?: Customer | null;
    initialName?: string; // Pre-fill name if coming from search
}

export function CustomerFormDialog({
    isOpen,
    onClose,
    customerToEdit,
    initialName = "",
}: CustomerFormDialogProps) {
    const createCustomer = useCreateCustomer();
    const updateCustomer = useUpdateCustomer();
    const isEditing = !!customerToEdit;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
        setValue
    } = useForm<CustomerFormValues>({
        resolver: zodResolver(customerSchema),
        defaultValues: {
            name: "",
            phone: "",
            email: "",
            address: "",
            customer_code: "",
        },
    });

    useEffect(() => {
        if (isOpen) {
            if (customerToEdit) {
                reset({
                    name: customerToEdit.name,
                    phone: customerToEdit.phone || "",
                    email: customerToEdit.email || "",
                    address: customerToEdit.address || "",
                    customer_code: customerToEdit.customer_code,
                });
            } else {
                reset({
                    name: initialName,
                    phone: "",
                    email: "",
                    address: "",
                    customer_code: "", // Will be auto-generated if left empty
                });
            }
        }
    }, [isOpen, customerToEdit, initialName, reset]);

    const onSubmit = async (data: CustomerFormValues) => {
        try {
            if (isEditing && customerToEdit) {
                await updateCustomer.mutateAsync({
                    id: customerToEdit.id,
                    updates: {
                        name: data.name,
                        phone: data.phone || null,
                        email: data.email || null,
                        address: data.address || null,
                        customer_code: data.customer_code || customerToEdit.customer_code, // Keep original if not provided
                    },
                });
            } else {
                await createCustomer.mutateAsync({
                    name: data.name,
                    phone: data.phone || null, // Convert empty string to null
                    email: data.email || null,
                    address: data.address || null,
                    customer_code: data.customer_code || "", // Hook handles auto-generation if empty string/undefined generally
                });
            }
            onClose();
        } catch (error) {
            // Error handling is done in the hook's onError
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Customer" : "Create New Customer"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
                        <Input id="name" {...register("name")} placeholder="Customer Name" />
                        {errors.name && (
                            <p className="text-sm text-destructive">{errors.name.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" {...register("phone")} placeholder="(555) 555-5555" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" {...register("email")} placeholder="customer@example.com" />
                        {errors.email && (
                            <p className="text-sm text-destructive">{errors.email.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Textarea
                            id="address"
                            {...register("address")}
                            placeholder="Full address"
                            className="resize-none"
                            rows={3}
                        />
                    </div>

                    {!isEditing && (
                        <div className="space-y-2">
                            <Label htmlFor="customer_code">Customer Code (Optional)</Label>
                            <Input id="customer_code" {...register("customer_code")} placeholder="Auto-generated if blank" />
                            <p className="text-xs text-muted-foreground">Leave blank to auto-generate.</p>
                        </div>
                    )}

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="bg-accent text-accent-foreground hover:bg-accent/90">
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                isEditing ? "Update Customer" : "Create Customer"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
