'use client';

import { useState } from "react";
import { useOrderStore } from "@/store/orderStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Car, Truck, Zap, Plus, Phone, Search, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { DriverFormDialog } from "@/components/fleet/DriverFormDialog";
import { Driver } from "@/types/order";

const vehicleIcons = {
    truck: Truck,
    van: Car,
    hotshot: Zap,
};

export default function Fleet() {
    const { drivers } = useOrderStore();
    const [searchQuery, setSearchQuery] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

    const filteredDrivers = drivers.filter(driver =>
        driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (driver.truckNumber && driver.truckNumber.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleAddDriver = () => {
        setEditingDriver(null);
        setIsFormOpen(true);
    };

    const handleEditDriver = (driver: Driver) => {
        setEditingDriver(driver);
        setIsFormOpen(true);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Fleet Management</h1>
                    <p className="text-muted-foreground">
                        Manage vehicles and drivers
                    </p>
                </div>
                <Button
                    className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
                    onClick={handleAddDriver}
                >
                    <Plus className="w-4 h-4" />
                    Add Driver
                </Button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Search drivers..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Drivers Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredDrivers.map((driver) => {
                    const VehicleIcon = vehicleIcons[driver.vehicleType];
                    return (
                        <Card key={driver.id} className="hover:shadow-card-hover transition-shadow group relative">
                            {/* Edit Button - Absolute on top right */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                                onClick={() => handleEditDriver(driver)}
                            >
                                <Pencil className="w-4 h-4" />
                            </Button>

                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center",
                                                driver.isActive
                                                    ? "bg-status-assigned/10 text-status-assigned"
                                                    : "bg-muted text-muted-foreground"
                                            )}
                                        >
                                            <VehicleIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base">{driver.name}</CardTitle>
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs text-muted-foreground capitalize">
                                                    {driver.vehicleType}
                                                </p>
                                                {driver.truckNumber && (
                                                    <span className="text-xs bg-muted px-1.5 py-0.5 rounded text-foreground font-mono">
                                                        {driver.truckNumber}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <span
                                        className={cn(
                                            "px-2 py-0.5 text-xs font-medium rounded-full",
                                            driver.isActive
                                                ? "bg-status-assigned/10 text-status-assigned"
                                                : "bg-muted text-muted-foreground"
                                        )}
                                    >
                                        {driver.isActive ? "Active" : "Inactive"}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Phone className="w-4 h-4" />
                                    <span>{driver.phone || 'No phone'}</span>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <DriverFormDialog
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                driver={editingDriver}
            />
        </div>
    );
}
