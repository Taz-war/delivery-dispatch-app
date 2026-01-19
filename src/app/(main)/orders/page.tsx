'use client';

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2 } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useOrders } from "@/hooks/useOrders";
import { format } from "date-fns";

const stageColors: Record<string, string> = {
    picking: "bg-yellow-100 text-yellow-800 border-yellow-200",
    unassigned_driver: "bg-orange-100 text-orange-800 border-orange-200",
    assigned_driver: "bg-blue-100 text-blue-800 border-blue-200",
    pickup_store: "bg-purple-100 text-purple-800 border-purple-200",
    completed: "bg-green-100 text-green-800 border-green-200",
};

const stageLabels: Record<string, string> = {
    picking: "Picking",
    unassigned_driver: "Unassigned",
    assigned_driver: "Assigned",
    pickup_store: "At Store",
    completed: "Completed",
};

const typeColors: Record<string, string> = {
    DODD: "bg-primary/10 text-primary border-primary/20",
    JOBBER: "bg-accent/10 text-accent-foreground border-accent/20",
    HOTSHOT: "bg-destructive/10 text-destructive border-destructive/20",
    PICKUP: "bg-muted text-muted-foreground border-border",
};

export default function Orders() {
    const [searchQuery, setSearchQuery] = useState("");
    const { data: orders = [], isLoading } = useOrders();

    const filteredOrders = orders.filter(
        (order) =>
            order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customer.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Orders</h1>
                    <p className="text-muted-foreground">
                        View and manage all orders
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Search by order #, customer name, or ID..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Orders Table */}
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[120px]">Order ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Stage</TableHead>
                            <TableHead>Day</TableHead>
                            <TableHead>Created</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : filteredOrders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    {searchQuery ? "No orders found matching your search" : "No orders yet."}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredOrders.map((order) => (
                                <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50">
                                    <TableCell className="font-mono text-sm font-medium">
                                        {order.id.slice(0, 8)}
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{order.customer.name}</p>
                                            {order.customer.id && (
                                                <p className="text-xs text-muted-foreground">{order.customer.id}</p>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={typeColors[order.orderType]}>
                                            {order.orderType}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={stageColors[order.stage]}>
                                            {stageLabels[order.stage]}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {order.assignedDay || "-"}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {format(order.createdAt, "MMM d, yyyy")}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Summary */}
            {!isLoading && filteredOrders.length > 0 && (
                <p className="text-sm text-muted-foreground">
                    Showing {filteredOrders.length} of {orders.length} orders
                </p>
            )}
        </div>
    );
}
