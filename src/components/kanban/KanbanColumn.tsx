import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Order } from "@/types/order";
import { OrderCard } from "@/components/ui/order-card";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  id: string;
  title: string;
  orders: Order[];
  className?: string;
}

export function KanbanColumn({ id, title, orders, className }: KanbanColumnProps) {
  return (
    <div
      className={cn(
        "flex flex-col min-w-[280px] w-[280px] bg-kanban-column rounded-xl border border-border/50",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <h3 className="font-semibold text-sm text-foreground">{title}</h3>
        <span className="px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground rounded-full">
          {orders.length}
        </span>
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "flex-1 p-2 overflow-y-auto scrollbar-thin min-h-[200px] transition-colors duration-200",
              snapshot.isDraggingOver && "bg-kanban-drop-zone"
            )}
          >
            <div className="space-y-2">
              {orders.map((order, index) => (
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
            
            {/* Empty state */}
            {orders.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex items-center justify-center h-24 text-xs text-muted-foreground border-2 border-dashed border-border rounded-lg">
                Drop orders here
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
