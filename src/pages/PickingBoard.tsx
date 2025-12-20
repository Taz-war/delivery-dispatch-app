import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { KanbanColumn } from "@/components/kanban/KanbanColumn";
import { useOrderStore } from "@/store/orderStore";
import { PickingColumn } from "@/types/order";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const columns: PickingColumn[] = ["Unassigned", "Mon", "Tue", "Wed", "Thu", "Fri", "Picked"];

export default function PickingBoard() {
  const { orders, moveOrderToColumn } = useOrderStore();
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  // Filter orders that are in picking stage
  const pickingOrders = orders.filter(
    (o) => o.stage === "picking" || o.pickingColumn === "Picked"
  );

  const handleDragEnd = (result: DropResult) => {
    const { destination, draggableId } = result;

    if (!destination) return;

    const newColumn = destination.droppableId as PickingColumn;
    moveOrderToColumn(draggableId, newColumn);
  };

  const getOrdersForColumn = (column: PickingColumn) =>
    pickingOrders.filter((o) => o.pickingColumn === column);

  // Calculate week dates
  const getWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1) + currentWeekOffset * 7);
    
    return {
      start: monday.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      end: new Date(monday.getTime() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    };
  };

  const weekDates = getWeekDates();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Picking Board</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Schedule and track warehouse picking
          </p>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentWeekOffset((prev) => prev - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {weekDates.start} - {weekDates.end}
            </span>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentWeekOffset((prev) => prev + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          {currentWeekOffset !== 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentWeekOffset(0)}
            >
              Today
            </Button>
          )}
        </div>
      </header>

      {/* Board */}
      <div className="flex-1 overflow-x-auto p-6">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 h-full min-w-min">
            {columns.map((column) => (
              <KanbanColumn
                key={column}
                id={column}
                title={column}
                orders={getOrdersForColumn(column)}
                className={
                  column === "Picked"
                    ? "bg-status-completed/5 border-status-completed/20"
                    : column === "Unassigned"
                    ? "bg-status-unassigned/5 border-status-unassigned/20"
                    : undefined
                }
              />
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}
