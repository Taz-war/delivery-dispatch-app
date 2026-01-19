'use client';

import { useState } from "react";
import { DragDropContext, DropResult, Droppable, Draggable } from "@hello-pangea/dnd";
import { useOrderStore } from "@/store/orderStore";
import { useAssignOrderToDriver, useUpdateOrder } from "@/hooks/useOrders";
import { OrderCard } from "@/components/ui/order-card";
import { OrderDetailSheet } from "@/components/order/OrderDetailSheet";
import { Order } from "@/types/order";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { User, Users, CheckCircle } from "lucide-react";

type DispatchView = "assign-driver" | "driver-schedule";

export default function DispatchControl() {
    const { orders, drivers, assignOrderToDriver, moveOrderToColumn, updateOrder } = useOrderStore();
    const assignOrderMutation = useAssignOrderToDriver();
    const updateOrderMutation = useUpdateOrder();
    const [view, setView] = useState<DispatchView>("assign-driver");
    const [selectedRSM, setSelectedRSM] = useState("all");
    const [selectedDriver, setSelectedDriver] = useState(drivers[0]?.id || "");
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);

    // Orders ready to be assigned to drivers (non-pickup, unassigned)
    const unassignedOrders = orders.filter(
        (o) => o.stage === "unassigned_driver" && o.orderType !== "PICKUP"
    );

    // Completed orders (non-pickup) - Visible for 7 days only
    const completedOrders = orders.filter(
        (o) => o.stage === "completed" &&
            o.orderType !== "PICKUP" &&
            (!o.completedAt || (new Date().getTime() - new Date(o.completedAt).getTime()) < 7 * 24 * 60 * 60 * 1000)
    );

    const handleDragEnd = (result: DropResult) => {
        const { destination, draggableId } = result;
        if (!destination) return;

        if (view === "assign-driver") {
            const driverId = destination.droppableId;

            if (driverId === "completed") {
                // Move to completed
                updateOrder(draggableId, { stage: "completed" });
                updateOrderMutation.mutate({ id: draggableId, updates: { stage: "completed" } });
            } else if (driverId && driverId !== "unassigned") {
                // Assign order to driver - optimistic update
                assignOrderToDriver(draggableId, driverId);
                // Only persist to Supabase for real database drivers
                if (!driverId.startsWith('driver-')) {
                    assignOrderMutation.mutate({ orderId: draggableId, driverId });
                }
            }
        } else {
            // Move within driver's schedule
            const newColumn = destination.droppableId;
            if (newColumn === "Completed") {
                updateOrder(draggableId, { stage: "completed" });
                updateOrderMutation.mutate({ id: draggableId, updates: { stage: "completed" } });
            } else {
                moveOrderToColumn(draggableId, newColumn as any);
            }
        }
    };

    // Get orders assigned to a specific driver (excluding completed)
    const getDriverOrders = (driverId: string) =>
        orders.filter((o) => o.assignedDriverId === driverId && o.stage !== "completed");

    // Days for driver schedule
    const days = ["Unassigned", "Mon", "Tue", "Wed", "Thu", "Fri", "Completed"];

    const handleOrderClick = (order: Order) => {
        setSelectedOrder(order);
        setSheetOpen(true);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <header className="flex flex-col gap-3 px-4 md:px-6 py-4 border-b border-border bg-card">
                <div className="flex items-start md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-foreground">Dispatch Control</h1>
                        <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                            Assign orders to drivers and manage schedules
                        </p>
                    </div>

                    {/* View Toggle - Desktop */}
                    <div className="hidden md:block">
                        <Tabs value={view} onValueChange={(v) => setView(v as DispatchView)}>
                            <TabsList>
                                <TabsTrigger value="assign-driver" className="gap-2">
                                    <Users className="w-4 h-4" />
                                    Assign Driver
                                </TabsTrigger>
                                <TabsTrigger value="driver-schedule" className="gap-2">
                                    <User className="w-4 h-4" />
                                    Driver Schedule
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>

                {/* View Toggle - Mobile */}
                <div className="md:hidden">
                    <Tabs value={view} onValueChange={(v) => setView(v as DispatchView)}>
                        <TabsList className="w-full">
                            <TabsTrigger value="assign-driver" className="flex-1 gap-1.5 text-xs">
                                <Users className="w-3.5 h-3.5" />
                                Assign Driver
                            </TabsTrigger>
                            <TabsTrigger value="driver-schedule" className="flex-1 gap-1.5 text-xs">
                                <User className="w-3.5 h-3.5" />
                                Driver Schedule
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-auto">
                <DragDropContext onDragEnd={handleDragEnd}>
                    {view === "assign-driver" ? (
                        <div className="flex flex-col md:flex-row h-full">
                            {/* Unassigned Orders Sidebar */}
                            <div className="md:w-80 border-b md:border-b-0 md:border-r border-border bg-muted/30 flex flex-col">
                                <div className="p-3 md:p-4 border-b border-border">
                                    <h2 className="font-semibold text-foreground text-sm md:text-base">Unassigned Orders</h2>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {unassignedOrders.length} orders ready for dispatch
                                    </p>
                                </div>
                                <Droppable droppableId="unassigned">
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={cn(
                                                "flex-1 p-3 md:p-4 overflow-y-auto scrollbar-thin max-h-[40vh] md:max-h-none",
                                                snapshot.isDraggingOver && "bg-kanban-drop-zone"
                                            )}
                                        >
                                            <div className="space-y-3">
                                                {unassignedOrders.map((order, index) => (
                                                    <Draggable key={order.id} draggableId={order.id} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                            >
                                                                <OrderCard
                                                                    order={order}
                                                                    isDragging={snapshot.isDragging}
                                                                    onClick={() => handleOrderClick(order)}
                                                                />
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                            </div>
                                            {provided.placeholder}
                                            {unassignedOrders.length === 0 && (
                                                <div className="text-center text-xs md:text-sm text-muted-foreground py-6 md:py-8">
                                                    No orders awaiting dispatch
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </Droppable>
                            </div>

                            {/* Driver Columns + Completed Column */}
                            <div className="flex-1 p-3 md:p-6 overflow-auto">
                                <div className="flex flex-col md:flex-row gap-4 md:h-full">
                                    {/* Driver columns */}
                                    {drivers.map((driver) => (
                                        <div
                                            key={driver.id}
                                            className="flex flex-col md:min-w-[280px] md:w-[280px] bg-kanban-column rounded-xl border border-border/50"
                                        >
                                            <div className="flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 border-b border-border/50">
                                                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <User className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-sm text-foreground truncate">
                                                        {driver.name}
                                                    </h3>
                                                    <p className="text-xs text-muted-foreground capitalize">
                                                        {driver.vehicleType}
                                                    </p>
                                                </div>
                                                <span className="px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground rounded-full">
                                                    {getDriverOrders(driver.id).length}
                                                </span>
                                            </div>
                                            <Droppable droppableId={driver.id}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.droppableProps}
                                                        className={cn(
                                                            "flex-1 p-2 md:p-3 overflow-y-auto scrollbar-thin min-h-[120px] md:min-h-[200px]",
                                                            snapshot.isDraggingOver && "bg-kanban-drop-zone"
                                                        )}
                                                    >
                                                        <div className="space-y-2">
                                                            {getDriverOrders(driver.id).map((order, index) => (
                                                                <Draggable key={order.id} draggableId={order.id} index={index}>
                                                                    {(provided, snapshot) => (
                                                                        <div
                                                                            ref={provided.innerRef}
                                                                            {...provided.draggableProps}
                                                                            {...provided.dragHandleProps}
                                                                        >
                                                                            <OrderCard
                                                                                order={order}
                                                                                isDragging={snapshot.isDragging}
                                                                                onClick={() => handleOrderClick(order)}
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </Draggable>
                                                            ))}
                                                        </div>
                                                        {provided.placeholder}
                                                        {getDriverOrders(driver.id).length === 0 && !snapshot.isDraggingOver && (
                                                            <div className="flex items-center justify-center h-20 md:h-24 text-xs text-muted-foreground border-2 border-dashed border-border rounded-lg">
                                                                Drag orders here
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </Droppable>
                                        </div>
                                    ))}

                                    {/* Completed Column */}
                                    <div className="flex flex-col md:min-w-[280px] md:w-[280px] bg-status-completed/5 rounded-xl border border-status-completed/20">
                                        <div className="flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 border-b border-status-completed/20">
                                            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-status-completed/10 flex items-center justify-center">
                                                <CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-status-completed" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-sm text-foreground">Completed</h3>
                                                <p className="text-xs text-muted-foreground">Finished orders</p>
                                            </div>
                                            <span className="px-2 py-0.5 text-xs font-medium bg-status-completed/10 text-status-completed rounded-full">
                                                {completedOrders.length}
                                            </span>
                                        </div>
                                        <Droppable droppableId="completed">
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.droppableProps}
                                                    className={cn(
                                                        "flex-1 p-2 md:p-3 overflow-y-auto scrollbar-thin min-h-[120px] md:min-h-[200px]",
                                                        snapshot.isDraggingOver && "bg-kanban-drop-zone"
                                                    )}
                                                >
                                                    <div className="space-y-2">
                                                        {completedOrders.map((order, index) => (
                                                            <Draggable key={order.id} draggableId={order.id} index={index}>
                                                                {(provided, snapshot) => (
                                                                    <div
                                                                        ref={provided.innerRef}
                                                                        {...provided.draggableProps}
                                                                        {...provided.dragHandleProps}
                                                                    >
                                                                        <OrderCard
                                                                            order={order}
                                                                            isDragging={snapshot.isDragging}
                                                                            onClick={() => handleOrderClick(order)}
                                                                        />
                                                                    </div>
                                                                )}
                                                            </Draggable>
                                                        ))}
                                                    </div>
                                                    {provided.placeholder}
                                                    {completedOrders.length === 0 && !snapshot.isDraggingOver && (
                                                        <div className="flex items-center justify-center h-20 md:h-24 text-xs text-muted-foreground border-2 border-dashed border-status-completed/30 rounded-lg">
                                                            Drag to complete
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </Droppable>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full">
                            {/* Filters */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 px-3 md:px-6 py-3 border-b border-border bg-muted/30">
                                <Select value={selectedRSM} onValueChange={setSelectedRSM}>
                                    <SelectTrigger className="w-full sm:w-40">
                                        <SelectValue placeholder="Filter by RSM" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All RSMs</SelectItem>
                                        <SelectItem value="Kyle">Kyle</SelectItem>
                                        <SelectItem value="Sarah">Sarah</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                                    <SelectTrigger className="w-full sm:w-48">
                                        <SelectValue placeholder="Select driver" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {drivers.map((driver) => (
                                            <SelectItem key={driver.id} value={driver.id}>
                                                {driver.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Week View with Completed */}
                            <div className="flex-1 p-3 md:p-6 overflow-auto">
                                <div className="flex flex-col md:flex-row gap-3 md:gap-4 md:h-full">
                                    {days.map((day) => {
                                        const isCompleted = day === "Completed";
                                        return (
                                            <div
                                                key={day}
                                                className={cn(
                                                    "flex flex-col md:min-w-[200px] md:flex-1 bg-kanban-column rounded-xl border border-border/50",
                                                    day === "Unassigned" && "bg-status-unassigned/5 border-status-unassigned/20",
                                                    isCompleted && "bg-status-completed/5 border-status-completed/20"
                                                )}
                                            >
                                                <div className="px-3 md:px-4 py-2.5 md:py-3 border-b border-border/50 flex items-center gap-2">
                                                    {isCompleted && <CheckCircle className="w-4 h-4 text-status-completed" />}
                                                    <h3 className="font-semibold text-sm text-foreground">{day}</h3>
                                                </div>
                                                <Droppable droppableId={day}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.droppableProps}
                                                            className={cn(
                                                                "flex-1 p-2 overflow-y-auto scrollbar-thin min-h-[100px] md:min-h-[200px]",
                                                                snapshot.isDraggingOver && "bg-kanban-drop-zone"
                                                            )}
                                                        >
                                                            <div className="space-y-2">
                                                                {orders
                                                                    .filter((o) => {
                                                                        if (isCompleted) {
                                                                            return o.assignedDriverId === selectedDriver && o.stage === "completed";
                                                                        }
                                                                        return (
                                                                            o.assignedDriverId === selectedDriver &&
                                                                            o.stage !== "completed" &&
                                                                            (day === "Unassigned"
                                                                                ? o.assignedDay === null
                                                                                : o.assignedDay === day)
                                                                        );
                                                                    })
                                                                    .map((order, index) => (
                                                                        <Draggable key={order.id} draggableId={order.id} index={index}>
                                                                            {(provided, snapshot) => (
                                                                                <div
                                                                                    ref={provided.innerRef}
                                                                                    {...provided.draggableProps}
                                                                                    {...provided.dragHandleProps}
                                                                                >
                                                                                    <OrderCard
                                                                                        order={order}
                                                                                        isDragging={snapshot.isDragging}
                                                                                        onClick={() => handleOrderClick(order)}
                                                                                    />
                                                                                </div>
                                                                            )}
                                                                        </Draggable>
                                                                    ))}
                                                            </div>
                                                            {provided.placeholder}
                                                        </div>
                                                    )}
                                                </Droppable>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </DragDropContext>
            </div>

            {/* Order Detail Sheet */}
            <OrderDetailSheet
                order={selectedOrder}
                open={sheetOpen}
                onOpenChange={setSheetOpen}
            />
        </div>
    );
}
