'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, MapPin, Phone, Loader2 } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function Customers() {
    const [searchQuery, setSearchQuery] = useState("");

    const { data: customers = [], isLoading } = useQuery({
        queryKey: ["customers"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("customers")
                .select("*")
                .order("name");
            if (error) throw error;
            return data;
        },
    });

    // Get order counts per customer
    const { data: orderCounts = {} } = useQuery({
        queryKey: ["customer-order-counts"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("orders")
                .select("customer_id");
            if (error) throw error;

            const counts: Record<string, number> = {};
            data.forEach((order) => {
                if (order.customer_id) {
                    counts[order.customer_id] = (counts[order.customer_id] || 0) + 1;
                }
            });
            return counts;
        },
    });

    const filteredCustomers = customers.filter(
        (customer) =>
            customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            customer.customer_code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Customers</h1>
                    <p className="text-muted-foreground">
                        Customer database and order history
                    </p>
                </div>
                <Button className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                    <Plus className="w-4 h-4" />
                    Add Customer
                </Button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Search customers by name or ID..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Customers Table */}
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[120px]">Customer ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead className="text-right">Total Orders</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : filteredCustomers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    {searchQuery ? "No customers found matching your search" : "No customers yet. Add your first customer!"}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredCustomers.map((customer) => (
                                <TableRow key={customer.id} className="cursor-pointer hover:bg-muted/50">
                                    <TableCell className="font-mono text-sm">
                                        {customer.customer_code}
                                    </TableCell>
                                    <TableCell className="font-medium">{customer.name}</TableCell>
                                    <TableCell>
                                        {customer.address && (
                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                                                <span className="truncate max-w-[300px]">{customer.address}</span>
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {customer.phone && (
                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                                <Phone className="w-3.5 h-3.5" />
                                                <span>{customer.phone}</span>
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {orderCounts[customer.customer_code] || 0}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
