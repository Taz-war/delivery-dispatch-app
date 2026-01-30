'use client';

import { useState } from "react";
import { useOrderStore } from "@/store/orderStore";
import { useUpdateOrder } from "@/hooks/useOrders";
import { Order } from "@/types/order";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
    Truck,
    Package,
    MapPin,
    Clock,
    CheckCircle,
    Tag,
    User
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const orderTypeStyles: Record<string, string> = {
    DODD: "bg-primary/10 text-primary border-primary/20",
    JOBBER: "bg-accent/10 text-accent border-accent/20",
    HOTSHOT: "bg-destructive/10 text-destructive border-destructive/20",
    PICKUP: "bg-status-pickup/10 text-status-pickup border-status-pickup/20",
};

export default function DriverPortal() {
    const { orders, drivers, updateOrder } = useOrderStore();
    const updateOrderMutation = useUpdateOrder();
    const [selectedDriverId, setSelectedDriverId] = useState<string>("");

    const selectedDriver = drivers.find(d => d.id === selectedDriverId);

    // Get orders assigned to the selected driver (only ready orders)
    const driverOrders = orders.filter(o =>
        o.assignedDriverId === selectedDriverId &&
        o.stage !== "completed" &&
        o.isReady !== false // Hide orders not yet processed
    );

    // Get completed orders for the driver (last 7 days)
    const completedOrders = orders.filter(o =>
        o.assignedDriverId === selectedDriverId &&
        o.stage === "completed" &&
        (!o.completedAt || (new Date().getTime() - new Date(o.completedAt).getTime()) < 7 * 24 * 60 * 60 * 1000)
    );

    const handleMarkDelivered = (order: Order) => {
        // Optimistic update
        updateOrder(order.id, { stage: "completed" });

        // Persist to database
        updateOrderMutation.mutate(
            { id: order.id, updates: { stage: "completed" } },
            {
                onSuccess: () => {
                    toast.success(`Order for ${order.customer.name} marked as delivered`);
                },
                onError: () => {
                    toast.error('Failed to update order');
                }
            }
        );
    };

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Driver Portal</h1>
                    <p className="text-muted-foreground">
                        View and manage your assigned deliveries
                    </p>
                </div>

                {/* Driver Selection */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <User className="w-5 h-5 text-muted-foreground" />
                            <div className="flex-1">
                                <Select value={selectedDriverId} onValueChange={setSelectedDriverId}>
                                    <SelectTrigger className="w-full md:w-72">
                                        <SelectValue placeholder="Select your name..." />
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
                            </div>
                        </div>
                        {selectedDriver && (
                            <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                    <Truck className="w-4 h-4" />
                                    {selectedDriver.truckNumber || 'No truck assigned'}
                                </span>
                                <span className="capitalize">{selectedDriver.vehicleType}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {!selectedDriverId ? (
                <div className="text-center py-12 text-muted-foreground">
                    <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select your name to view your assigned orders</p>
                </div>
            ) : (
                <>
                    {/* Active Orders */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Package className="w-5 h-5 text-primary" />
                                Active Orders
                            </h2>
                            <Badge variant="secondary">{driverOrders.length}</Badge>
                        </div>

                        {driverOrders.length === 0 ? (
                            <Card>
                                <CardContent className="py-8 text-center text-muted-foreground">
                                    No active orders assigned
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {driverOrders.map((order) => (
                                    <Card key={order.id} className="overflow-hidden">
                                        <CardContent className="p-4">
                                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div>
                                                            <h3 className="font-semibold">{order.customer.name}</h3>
                                                            <p className="text-sm text-muted-foreground">#{order.customer.id}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Badge
                                                                variant="outline"
                                                                className={cn("font-medium", orderTypeStyles[order.orderType])}
                                                            >
                                                                {order.orderType}
                                                            </Badge>
                                                            {order.pickingStatus === "picked" && (
                                                                <Badge className="bg-green-500 text-white">Picked</Badge>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
                                                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                        <span>{order.customer.address}</span>
                                                    </div>

                                                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                        <Package className="w-4 h-4" />
                                                        <span>
                                                            {order.items.length} item{order.items.length !== 1 ? 's' : ''} •
                                                            {order.items.reduce((acc, item) => acc + item.quantity, 0)} units
                                                        </span>
                                                    </div>

                                                    {order.orderType === "JOBBER" && order.presellNumber && (
                                                        <div className="flex items-center gap-1.5 text-sm text-accent">
                                                            <Tag className="w-4 h-4" />
                                                            <span className="font-medium">PRE SELL: {order.presellNumber}</span>
                                                        </div>
                                                    )}

                                                    {order.comments && (
                                                        <p className="text-sm text-muted-foreground italic">
                                                            "{order.comments}"
                                                        </p>
                                                    )}

                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        <span>Created {format(order.createdAt, "MMM d, h:mm a")}</span>
                                                    </div>
                                                </div>

                                                <Button
                                                    onClick={() => handleMarkDelivered(order)}
                                                    className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white"
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                    Mark Delivered
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Completed Orders */}
                    {completedOrders.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    Completed Today
                                </h2>
                                <Badge variant="outline" className="border-green-500 text-green-600">
                                    {completedOrders.length}
                                </Badge>
                            </div>

                            <div className="space-y-2">
                                {completedOrders.map((order) => (
                                    <Card key={order.id} className="bg-muted/30">
                                        <CardContent className="p-3 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                                <div>
                                                    <p className="font-medium text-sm">{order.customer.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {order.customer.address}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className={cn("text-xs", orderTypeStyles[order.orderType])}
                                            >
                                                {order.orderType}
                                            </Badge>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
