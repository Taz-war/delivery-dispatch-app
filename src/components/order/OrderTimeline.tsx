import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { 
  Package, 
  Truck, 
  User, 
  CheckCircle, 
  Clock, 
  ArrowRight,
  Store,
  Columns
} from "lucide-react";
import { format } from "date-fns";

interface TimelineEvent {
  id: string;
  status: string;
  previousStatus: string | null;
  changedAt: Date;
  notes: string | null;
}

interface OrderTimelineProps {
  orderId: string;
}

const getStatusIcon = (status: string) => {
  if (status === "created") return Package;
  if (status === "picking") return Columns;
  if (status === "unassigned_driver") return Truck;
  if (status === "assigned_driver") return User;
  if (status === "driver_assigned") return User;
  if (status === "pickup_store") return Store;
  if (status === "completed") return CheckCircle;
  if (status.startsWith("column_")) return Columns;
  return Clock;
};

const getStatusLabel = (status: string) => {
  if (status === "created") return "Order Created";
  if (status === "picking") return "In Picking";
  if (status === "unassigned_driver") return "Ready for Dispatch";
  if (status === "assigned_driver") return "Assigned to Driver";
  if (status === "driver_assigned") return "Driver Assigned";
  if (status === "pickup_store") return "Ready for Pickup";
  if (status === "completed") return "Completed";
  if (status.startsWith("column_")) {
    const column = status.replace("column_", "");
    return `Moved to ${column}`;
  }
  return status;
};

const getStatusColor = (status: string) => {
  if (status === "created") return "bg-primary/10 text-primary border-primary/20";
  if (status === "picking") return "bg-accent/10 text-accent border-accent/20";
  if (status === "unassigned_driver") return "bg-status-unassigned/10 text-status-unassigned border-status-unassigned/20";
  if (status === "assigned_driver" || status === "driver_assigned") return "bg-blue-500/10 text-blue-600 border-blue-500/20";
  if (status === "pickup_store") return "bg-status-pickup/10 text-status-pickup border-status-pickup/20";
  if (status === "completed") return "bg-status-completed/10 text-status-completed border-status-completed/20";
  if (status.startsWith("column_")) return "bg-muted text-muted-foreground border-border";
  return "bg-muted text-muted-foreground border-border";
};

export function OrderTimeline({ orderId }: OrderTimelineProps) {
  const { data: events, isLoading } = useQuery({
    queryKey: ["order-timeline", orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_timeline")
        .select("*")
        .eq("order_id", orderId)
        .order("changed_at", { ascending: true });

      if (error) throw error;
      
      return data.map((event: any): TimelineEvent => ({
        id: event.id,
        status: event.status,
        previousStatus: event.previous_status,
        changedAt: new Date(event.changed_at),
        notes: event.notes,
      }));
    },
  });

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-muted rounded-full" />
              <div className="flex-1 h-4 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        No timeline events yet
      </div>
    );
  }

  return (
    <div className="p-4 space-y-0">
      {events.map((event, index) => {
        const Icon = getStatusIcon(event.status);
        const isLast = index === events.length - 1;
        
        return (
          <div key={event.id} className="relative flex gap-3">
            {/* Vertical line */}
            {!isLast && (
              <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-border" />
            )}
            
            {/* Icon */}
            <div
              className={cn(
                "relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2",
                getStatusColor(event.status)
              )}
            >
              <Icon className="w-4 h-4" />
            </div>
            
            {/* Content */}
            <div className={cn("flex-1 pb-4", isLast && "pb-0")}>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-foreground">
                  {getStatusLabel(event.status)}
                </span>
                {event.previousStatus && (
                  <>
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      from {getStatusLabel(event.previousStatus)}
                    </span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {format(event.changedAt, "MMM d, yyyy 'at' h:mm a")}
                </span>
              </div>
              {event.notes && (
                <p className="text-xs text-muted-foreground mt-1 italic">
                  {event.notes}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
