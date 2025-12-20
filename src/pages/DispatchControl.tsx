import { DragDropContext, DropResult, Droppable, Draggable } from "@hello-pangea/dnd";
import { useOrderStore } from "@/store/orderStore";
import { OrderCard } from "@/components/ui/order-card";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { User, Users } from "lucide-react";

type DispatchView = "assign-driver" | "driver-schedule";

export default function DispatchControl() {
  const { orders, drivers, assignOrderToDriver, moveOrderToColumn } = useOrderStore();
  const [view, setView] = useState<DispatchView>("assign-driver");
  const [selectedRSM, setSelectedRSM] = useState("all");
  const [selectedDriver, setSelectedDriver] = useState(drivers[0]?.id || "");

  // Orders ready to be assigned to drivers
  const unassignedOrders = orders.filter((o) => o.stage === "unassigned_driver");

  const handleDragEnd = (result: DropResult) => {
    const { destination, draggableId } = result;
    if (!destination) return;

    if (view === "assign-driver") {
      // Assign order to driver
      const driverId = destination.droppableId;
      if (driverId && driverId !== "unassigned") {
        assignOrderToDriver(draggableId, driverId);
      }
    } else {
      // Move within driver's schedule
      const newColumn = destination.droppableId;
      moveOrderToColumn(draggableId, newColumn as any);
    }
  };

  // Get orders assigned to a specific driver
  const getDriverOrders = (driverId: string) =>
    orders.filter((o) => o.assignedDriverId === driverId);

  // Days for driver schedule
  const days = ["Unassigned", "Mon", "Tue", "Wed", "Thu", "Fri"];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dispatch Control</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Assign orders to drivers and manage schedules
          </p>
        </div>

        {/* View Toggle */}
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
      </header>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <DragDropContext onDragEnd={handleDragEnd}>
          {view === "assign-driver" ? (
            <div className="flex h-full">
              {/* Unassigned Orders Sidebar */}
              <div className="w-80 border-r border-border bg-muted/30 flex flex-col">
                <div className="p-4 border-b border-border">
                  <h2 className="font-semibold text-foreground">Unassigned Orders</h2>
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
                        "flex-1 p-4 overflow-y-auto scrollbar-thin",
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
                                <OrderCard order={order} isDragging={snapshot.isDragging} />
                              </div>
                            )}
                          </Draggable>
                        ))}
                      </div>
                      {provided.placeholder}
                      {unassignedOrders.length === 0 && (
                        <div className="text-center text-sm text-muted-foreground py-8">
                          No orders awaiting dispatch
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>

              {/* Driver Columns */}
              <div className="flex-1 p-6 overflow-x-auto">
                <div className="flex gap-4 h-full">
                  {drivers.map((driver) => (
                    <div
                      key={driver.id}
                      className="flex flex-col min-w-[280px] w-[280px] bg-kanban-column rounded-xl border border-border/50"
                    >
                      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
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
                              "flex-1 p-3 overflow-y-auto scrollbar-thin min-h-[200px]",
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
                                      <OrderCard order={order} isDragging={snapshot.isDragging} />
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                            </div>
                            {provided.placeholder}
                            {getDriverOrders(driver.id).length === 0 && !snapshot.isDraggingOver && (
                              <div className="flex items-center justify-center h-24 text-xs text-muted-foreground border-2 border-dashed border-border rounded-lg">
                                Drag orders here
                              </div>
                            )}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {/* Filters */}
              <div className="flex items-center gap-4 px-6 py-3 border-b border-border bg-muted/30">
                <Select value={selectedRSM} onValueChange={setSelectedRSM}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by RSM" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All RSMs</SelectItem>
                    <SelectItem value="Kyle">Kyle</SelectItem>
                    <SelectItem value="Sarah">Sarah</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                  <SelectTrigger className="w-48">
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

              {/* Week View */}
              <div className="flex-1 p-6 overflow-x-auto">
                <div className="flex gap-4 h-full">
                  {days.map((day) => (
                    <div
                      key={day}
                      className={cn(
                        "flex flex-col min-w-[200px] flex-1 bg-kanban-column rounded-xl border border-border/50",
                        day === "Unassigned" && "bg-status-unassigned/5 border-status-unassigned/20"
                      )}
                    >
                      <div className="px-4 py-3 border-b border-border/50">
                        <h3 className="font-semibold text-sm text-foreground">{day}</h3>
                      </div>
                      <Droppable droppableId={day}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={cn(
                              "flex-1 p-2 overflow-y-auto scrollbar-thin min-h-[200px]",
                              snapshot.isDraggingOver && "bg-kanban-drop-zone"
                            )}
                          >
                            <div className="space-y-2">
                              {orders
                                .filter(
                                  (o) =>
                                    o.assignedDriverId === selectedDriver &&
                                    (day === "Unassigned"
                                      ? o.assignedDay === null
                                      : o.assignedDay === day)
                                )
                                .map((order, index) => (
                                  <Draggable key={order.id} draggableId={order.id} index={index}>
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                      >
                                        <OrderCard order={order} isDragging={snapshot.isDragging} />
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
                  ))}
                </div>
              </div>
            </div>
          )}
        </DragDropContext>
      </div>
    </div>
  );
}
