import { DragDropContext, DropResult, Droppable, Draggable } from "@hello-pangea/dnd";
import { useOrderStore } from "@/store/orderStore";
import { OrderCard } from "@/components/ui/order-card";
import { cn } from "@/lib/utils";
import { Store, CheckCircle } from "lucide-react";

type PickupColumn = "today" | "next-day" | "not-picked-up";

export default function PickupBoard() {
  const { orders, updateOrder } = useOrderStore();

  // Filter only PICKUP orders
  const pickupOrders = orders.filter((o) => o.orderType === "PICKUP");

  // Simple column assignment based on created date
  const getOrderColumn = (order: typeof orders[0]): PickupColumn => {
    const today = new Date();
    const orderDate = new Date(order.createdAt);
    const daysDiff = Math.floor((today.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));

    if (order.stage === "completed") return "not-picked-up"; // Just for demo
    if (daysDiff === 0) return "today";
    if (daysDiff === 1) return "next-day";
    return "not-picked-up";
  };

  const columns: { id: PickupColumn; title: string; icon: React.ElementType }[] = [
    { id: "today", title: "Today", icon: Store },
    { id: "next-day", title: "Next Day", icon: Store },
    { id: "not-picked-up", title: "Not Picked Up", icon: CheckCircle },
  ];

  const getOrdersForColumn = (columnId: PickupColumn) =>
    pickupOrders.filter((o) => getOrderColumn(o) === columnId);

  const handleDragEnd = (result: DropResult) => {
    // For now, just a placeholder - could update stage on drop
    console.log("Dropped:", result);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 md:px-6 py-4 border-b border-border bg-card">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Pickup @ Store</h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Manage customer pickup orders
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-status-pickup/10 rounded-lg">
          <Store className="w-4 h-4 text-status-pickup" />
          <span className="text-xs md:text-sm font-medium text-status-pickup">
            {pickupOrders.length} pickup orders
          </span>
        </div>
      </header>

      {/* Board */}
      <div className="flex-1 p-3 md:p-6 overflow-auto">
        <DragDropContext onDragEnd={handleDragEnd}>
          {/* Mobile: Vertical stack, Desktop: Horizontal grid */}
          <div className="flex flex-col md:grid md:grid-cols-3 gap-4 md:gap-6 md:h-full md:min-h-0">
            {columns.map((column) => {
              const columnOrders = getOrdersForColumn(column.id);
              return (
                <div
                  key={column.id}
                  className={cn(
                    "flex flex-col bg-kanban-column rounded-xl border border-border/50 min-h-[200px] md:min-h-0",
                    column.id === "not-picked-up" && "bg-destructive/5 border-destructive/20"
                  )}
                >
                  <div className="flex items-center justify-between px-3 md:px-4 py-2.5 md:py-3 border-b border-border/50">
                    <div className="flex items-center gap-2">
                      <column.icon className="w-4 h-4 text-muted-foreground" />
                      <h3 className="font-semibold text-sm text-foreground">{column.title}</h3>
                    </div>
                    <span className="px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground rounded-full">
                      {columnOrders.length}
                    </span>
                  </div>
                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                          "flex-1 p-2 md:p-3 overflow-y-auto scrollbar-thin",
                          snapshot.isDraggingOver && "bg-kanban-drop-zone"
                        )}
                      >
                        {/* Cards grid: keep 1-up until large screens to avoid squeezed cards */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-3">
                          {columnOrders.map((order, index) => (
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
                        {columnOrders.length === 0 && !snapshot.isDraggingOver && (
                          <div className="flex items-center justify-center h-24 md:h-32 text-xs md:text-sm text-muted-foreground border-2 border-dashed border-border rounded-lg">
                            No orders
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}
