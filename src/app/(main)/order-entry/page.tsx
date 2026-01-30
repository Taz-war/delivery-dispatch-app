'use client';

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCreateOrder } from "@/hooks/useOrders";
import { useCreateCustomer } from "@/hooks/useCustomers";
import { useOrderStore } from "@/store/orderStore";
import { OrderType, LineItem, FulfillmentType } from "@/types/order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2, Save, ArrowLeft, Upload, FileText, X, Truck, UserPlus, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { CustomerSearch } from "@/components/order/CustomerSearch";
import { Checkbox } from "@/components/ui/checkbox";

const deliveryOrderTypes: OrderType[] = ["DODD", "JOBBER", "HOTSHOT", "RESTOCK"];

const orderTypeDescriptions: Partial<Record<OrderType, string>> = {
    DODD: "Daily Overnight Delivery",
    JOBBER: "Jobber Account",
    HOTSHOT: "Urgent Priority",
    RESTOCK: "Stock Replenishment",
};

const fulfillmentTypes: FulfillmentType[] = ["Pickup", "Delivery", "Back Order"];

export default function OrderEntry() {
    const router = useRouter();
    const createOrder = useCreateOrder();
    const createCustomer = useCreateCustomer();
    const { drivers } = useOrderStore();

    const [formData, setFormData] = useState({
        customerName: "",
        customerId: "",
        address: "",
        deliverTo: "",
        phone: "",
        fulfillmentType: "Delivery" as FulfillmentType,
        orderType: "DODD" as OrderType,
        isReady: false,
        comments: "",
        scheduledDate: undefined as Date | undefined,
        presellNumber: "",
        assignedDriverId: "" as string,
    });

    const [lineItems, setLineItems] = useState<LineItem[]>([
        { partNumber: "", quantity: 1, poNumber: "" },
    ]);

    const [orderDocument, setOrderDocument] = useState<{ name: string; url: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file type
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
            if (!validTypes.includes(file.type)) {
                toast({
                    title: "Invalid file type",
                    description: "Please upload an image (JPG, PNG, GIF, WEBP) or PDF file.",
                    variant: "destructive",
                });
                return;
            }
            // Check file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                toast({
                    title: "File too large",
                    description: "Please upload a file smaller than 10MB.",
                    variant: "destructive",
                });
                return;
            }
            // Create a local URL for preview (in production, this would upload to storage)
            const url = URL.createObjectURL(file);
            setOrderDocument({ name: file.name, url });
        }
    };

    const removeDocument = () => {
        if (orderDocument?.url) {
            URL.revokeObjectURL(orderDocument.url);
        }
        setOrderDocument(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const addLineItem = () => {
        setLineItems([...lineItems, { partNumber: "", quantity: 1, poNumber: "" }]);
    };

    const removeLineItem = (index: number) => {
        if (lineItems.length > 1) {
            setLineItems(lineItems.filter((_, i) => i !== index));
        }
    };

    const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
        const updated = [...lineItems];
        updated[index] = { ...updated[index], [field]: value };
        setLineItems(updated);
    };

    const handleCreateCustomer = async () => {
        if (!formData.customerName.trim()) {
            toast({
                title: "Validation Error",
                description: "Customer Name is required to create a new customer.",
                variant: "destructive",
            });
            return;
        }

        try {
            const newCustomer = await createCustomer.mutateAsync({
                name: formData.customerName,
                address: formData.address || null,
                phone: formData.phone || null,
                customer_code: "", // Will be auto-generated by hook
            });

            // Update form with new customer ID
            setFormData(prev => ({
                ...prev,
                customerId: newCustomer.customer_code,
                // Ensure name/address/phone stay consistent just in case
                customerName: newCustomer.name,
                address: newCustomer.address || prev.address,
                phone: newCustomer.phone || prev.phone,
            }));

        } catch (error) {
            // Error handling is managed by the mutation hook mainly
            console.error("Failed to create customer from order entry:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // Determine initial stage based on Fulfillment Type and Ready status
            let stage: any = "unassigned_driver";

            if (!formData.isReady) {
                // If not ready, it conceptually goes to "Processing Board"
                // Ideally we'd have a specific stage for this, but for now we might use a placeholder
                // or just keep it unassigned but filter by isReady flag in views.
                // Reusing 'unassigned_driver' but reliance on isReady flag to hide it from dispatch board.
                stage = "unassigned_driver";
            } else {
                if (formData.fulfillmentType === "Pickup") {
                    stage = "pickup_store";
                } else if (formData.fulfillmentType === "Delivery" || formData.fulfillmentType === "Back Order") {
                    stage = "unassigned_driver";
                }
            }

            const newOrder = await createOrder.mutateAsync({
                customer: {
                    name: formData.customerName,
                    id: formData.customerId,
                    address: formData.address,
                    phone: formData.phone,
                    coordinates: { lat: 32.7767, lng: -96.797 }, // Default coords
                },
                items: lineItems.filter((item) => item.partNumber.trim() !== ""),
                stage: formData.assignedDriverId ? "assigned_driver" : stage,
                scheduledDate: formData.scheduledDate || null,
                assignedDay: null,
                rsm: "Kyle", // Hardcoded per existing logic
                assignedDriverId: formData.assignedDriverId || null,
                orderType: formData.orderType,
                invoicePhotoUrl: null,
                comments: formData.comments,
                pickingColumn: "Unassigned",
                orderDocumentUrl: orderDocument?.url || null,
                presellNumber: formData.orderType === "JOBBER" ? formData.presellNumber : null,
                fulfillmentType: formData.fulfillmentType,
                isReady: formData.isReady,
            });

            // If we assigned a local driver (one that starts with 'driver-'), 
            // we need to set it in the store manually since the DB insert ignored it
            if (formData.assignedDriverId && formData.assignedDriverId.startsWith('driver-')) {
                const { assignOrderToDriver } = useOrderStore.getState();
                assignOrderToDriver(newOrder.id, formData.assignedDriverId);
            }

            let destination = "Dispatch Control";
            if (formData.fulfillmentType === "Pickup" && formData.isReady) {
                destination = "Pickup Board";
            } else if (!formData.isReady) {
                destination = "Processing Board";
            }

            toast({
                title: "Order Created",
                description: `Order has been saved to ${destination}.`,
            });

            // Route based on destination
            if (formData.fulfillmentType === "Pickup" && formData.isReady) {
                router.push("/pickup");
            } else if (!formData.isReady) {
                router.push("/picking"); // Go to Processing Board for non-ready orders
            } else {
                router.push("/dispatch");
            }
        } catch (error) {
            console.error("Error creating order:", error);
            toast({
                title: "Error",
                description: "Failed to create order. Please try again.",
                variant: "destructive",
            });
        }
    };

    const isCreatingCustomer = createCustomer.isPending;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">New Order</h1>
                    <p className="text-sm text-muted-foreground">
                        Create a new delivery, pickup, or restock order
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Customer Information */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">Customer Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <CustomerSearch
                                value={{
                                    customerName: formData.customerName,
                                    customerId: formData.customerId,
                                    address: formData.address,
                                    phone: formData.phone,
                                }}
                                onChange={(data) =>
                                    setFormData({
                                        ...formData,
                                        customerName: data.customerName,
                                        customerId: data.customerId,
                                        address: data.address,
                                        phone: data.phone,
                                    })
                                }
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label htmlFor="deliverTo" className="text-sm font-medium">Deliver To</label>
                            <Input
                                id="deliverTo"
                                placeholder="Specific delivery instructions or location"
                                value={formData.deliverTo}
                                onChange={(e) => setFormData({ ...formData, deliverTo: e.target.value })}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end border-t pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="bg-accent/10 hover:bg-accent/20 text-accent border-accent/20"
                            onClick={handleCreateCustomer}
                            disabled={isCreatingCustomer || !formData.customerName || !!formData.customerId}
                        >
                            {isCreatingCustomer ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    {formData.customerId ? "Customer Selected" : "Create Customer"}
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>

                {/* Line Items */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">Line Items</CardTitle>
                        <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Row
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {/* Header */}
                            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                <div className="col-span-5">Part #</div>
                                <div className="col-span-2">Qty</div>
                                <div className="col-span-4">PO #</div>
                                <div className="col-span-1"></div>
                            </div>

                            {/* Rows */}
                            {lineItems.map((item, index) => (
                                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                                    <div className="col-span-5">
                                        <Input
                                            placeholder="Part number"
                                            value={item.partNumber}
                                            onChange={(e) => updateLineItem(index, "partNumber", e.target.value)}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <Input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => updateLineItem(index, "quantity", parseInt(e.target.value) || 1)}
                                        />
                                    </div>
                                    <div className="col-span-4">
                                        <Input
                                            placeholder="PO number"
                                            value={item.poNumber}
                                            onChange={(e) => updateLineItem(index, "poNumber", e.target.value)}
                                        />
                                    </div>
                                    <div className="col-span-1 flex justify-center">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeLineItem(index)}
                                            disabled={lineItems.length === 1}
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Fulfillment Type & Order Type */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg text-accent">Fulfillment Type</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Fulfillment Selector */}
                        <div className="grid grid-cols-3 gap-3">
                            {fulfillmentTypes.map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, fulfillmentType: type })}
                                    className={cn(
                                        "flex items-center justify-center p-4 rounded-lg border-2 transition-all font-semibold",
                                        formData.fulfillmentType === type
                                            ? "border-accent text-accent bg-accent/10"
                                            : "border-border hover:border-muted-foreground/30 text-muted-foreground"
                                    )}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>

                        {/* Order Type - Only if Delivery */}
                        {formData.fulfillmentType === "Delivery" && (
                            <div className="space-y-3 pt-4 border-t">
                                <Label className="text-base">Order Type</Label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {deliveryOrderTypes.map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, orderType: type, presellNumber: type !== "JOBBER" ? "" : formData.presellNumber })}
                                            className={cn(
                                                "flex flex-col items-center p-3 rounded-lg border-2 transition-all",
                                                formData.orderType === type
                                                    ? type === "RESTOCK"
                                                        ? "border-accent bg-accent/10"
                                                        : "border-accent bg-accent/10"
                                                    : "border-border hover:border-muted-foreground/30"
                                            )}
                                        >
                                            <span className={cn(
                                                "font-semibold",
                                                formData.orderType === type ? "text-accent" : "text-foreground"
                                            )}>{type}</span>
                                            <span className="text-[10px] text-muted-foreground text-center mt-1">
                                                {orderTypeDescriptions[type]}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* PRE SELL field - only visible for JOBBER orders */}
                        {formData.fulfillmentType === "Delivery" && formData.orderType === "JOBBER" && (
                            <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg space-y-2 animate-in fade-in slide-in-from-top-2">
                                <Label htmlFor="presellNumber" className="text-accent font-medium">
                                    PRE SELL Number
                                </Label>
                                <Input
                                    id="presellNumber"
                                    placeholder="Enter Pre-Sell number"
                                    value={formData.presellNumber}
                                    onChange={(e) => setFormData({ ...formData, presellNumber: e.target.value })}
                                    className="border-accent/30 focus:border-accent"
                                />
                                <p className="text-xs text-muted-foreground">
                                    This number will be visible to drivers on the order card.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Ready Checkbox */}
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="ready"
                        checked={formData.isReady}
                        onCheckedChange={(checked) => setFormData({ ...formData, isReady: !!checked })}
                        className="data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                    />
                    <label
                        htmlFor="ready"
                        className="text-lg font-bold text-accent leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Ready to go out
                    </label>
                </div>

                {/* Order Document Upload */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Order Document</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                Upload an image or PDF of the order for driver reference.
                            </p>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*,.pdf"
                                onChange={handleFileUpload}
                                className="hidden"
                                id="orderDocumentUpload"
                            />

                            {!orderDocument ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full h-24 border-dashed border-2 hover:border-accent hover:bg-accent/5"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        <Upload className="w-6 h-6 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">
                                            Click to upload image or PDF
                                        </span>
                                    </div>
                                </Button>
                            ) : (
                                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border">
                                    <FileText className="w-8 h-8 text-accent flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{orderDocument.name}</p>
                                        <p className="text-xs text-muted-foreground">Document attached</p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={removeDocument}
                                        className="text-muted-foreground hover:text-destructive"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Assign Driver (Optional) */}
                {formData.fulfillmentType !== "Pickup" && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Truck className="w-5 h-5 text-accent" />
                                Assign Driver (Optional)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <p className="text-sm text-muted-foreground">
                                    Optionally assign a driver now, or assign later from Dispatch Control.
                                </p>
                                <Select
                                    value={formData.assignedDriverId}
                                    onValueChange={(value) => setFormData({ ...formData, assignedDriverId: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a driver..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {drivers.filter(d => d.isActive).map((driver) => (
                                            <SelectItem key={driver.id} value={driver.id}>
                                                <div className="flex items-center gap-2">
                                                    <span>{driver.name}</span>
                                                    {driver.truckNumber && (
                                                        <span className="text-xs text-muted-foreground">({driver.truckNumber})</span>
                                                    )}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {drivers.length === 0 && (
                                    <p className="text-xs text-amber-600">
                                        No drivers found. Add drivers in Supabase first.
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Comments & Date */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Comments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                placeholder="Additional notes or instructions..."
                                value={formData.comments}
                                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                                rows={4}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Fulfilment Day</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !formData.scheduledDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {formData.scheduledDate ? (
                                            format(formData.scheduledDate, "PPP")
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={formData.scheduledDate}
                                        onSelect={(date) => setFormData({ ...formData, scheduledDate: date })}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </CardContent>
                    </Card>
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">
                        <Save className="w-4 h-4 mr-2" />
                        Create Order
                    </Button>
                </div>
            </form>
        </div>
    );
}
