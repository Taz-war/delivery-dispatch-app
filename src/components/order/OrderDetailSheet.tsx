import { Order } from "@/types/order";
import { useOrderStore } from "@/store/orderStore";
import { useAssignOrderToDriver } from "@/hooks/useOrders";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OrderTimeline } from "./OrderTimeline";
import {
  Package,
  MapPin,
  Clock,
  FileText,
  Tag,
  User,
  History,
  Truck
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface OrderDetailSheetProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const orderTypeStyles: Record<string, string> = {
  DODD: "bg-primary/10 text-primary border-primary/20",
  JOBBER: "bg-accent/10 text-accent border-accent/20",
  HOTSHOT: "bg-destructive/10 text-destructive border-destructive/20",
  PICKUP: "bg-status-pickup/10 text-status-pickup border-status-pickup/20",
};

const stageLabels: Record<string, string> = {
  picking: "Picking",
  unassigned_driver: "Unassigned",
  assigned_driver: "Assigned",
  pickup_store: "Pickup",
  completed: "Completed",
};

export function OrderDetailSheet({ order, open, onOpenChange }: OrderDetailSheetProps) {
  const { drivers, assignOrderToDriver } = useOrderStore();
  const assignOrderMutation = useAssignOrderToDriver();

  if (!order) return null;

  const handleDriverAssign = (driverId: string) => {
    if (!order) return;

    // Optimistic update - this always works locally
    assignOrderToDriver(order.id, driverId);

    const driver = drivers.find(d => d.id === driverId);

    // Check if this is a local-only driver (starts with 'driver-')
    if (driverId.startsWith('driver-')) {
      // Local-only driver - just show success, don't persist to database
      toast.success(`Order assigned to ${driver?.name || 'driver'} (local)`);
      return;
    }

    // Persist to database for real database drivers
    assignOrderMutation.mutate(
      { orderId: order.id, driverId },
      {
        onSuccess: () => {
          toast.success(`Order assigned to ${driver?.name || 'driver'}`);
        },
        onError: () => {
          toast.error('Failed to assign driver');
        }
      }
    );
  };

  const assignedDriver = drivers.find(d => d.id === order.assignedDriverId);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <SheetTitle className="text-lg">{order.customer.name}</SheetTitle>
              <p className="text-sm text-muted-foreground">#{order.customer.id}</p>
            </div>
            <Badge
              variant="outline"
              className={cn("font-medium", orderTypeStyles[order.orderType])}
            >
              {order.orderType}
            </Badge>
          </div>
        </SheetHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="details" className="gap-1.5">
              <Package className="w-4 h-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="timeline" className="gap-1.5">
              <History className="w-4 h-4" />
              Timeline
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-4 space-y-4">
            {/* Assign Driver */}
            {order.stage !== "completed" && order.stage !== "pickup_store" && (
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Assign Driver</span>
                </div>
                <Select
                  value={order.assignedDriverId || ""}
                  onValueChange={handleDriverAssign}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a driver..." />
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
                {assignedDriver && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Currently assigned to: <span className="font-medium text-foreground">{assignedDriver.name}</span>
                    {assignedDriver.truckNumber && <span> • {assignedDriver.truckNumber}</span>}
                  </p>
                )}
              </div>
            )}

            {/* Status */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Status</span>
              </div>
              <Badge variant="secondary">
                {stageLabels[order.stage] || order.stage}
              </Badge>
            </div>

            {/* Address */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Address</span>
              </div>
              <p className="text-sm text-muted-foreground">{order.customer.address}</p>
            </div>

            {/* Items */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  Items ({order.items.length})
                </span>
              </div>
              <div className="space-y-1">
                {order.items.map((item, idx) => (
                  <div key={idx} className="text-sm text-muted-foreground flex justify-between">
                    <span>{item.partNumber}</span>
                    <span>x{item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* PRE SELL for JOBBER */}
            {order.orderType === "JOBBER" && order.presellNumber && (
              <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium text-accent">
                    PRE SELL: {order.presellNumber}
                  </span>
                </div>
              </div>
            )}

            {/* RSM */}
            {order.rsm && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">RSM:</span> {order.rsm}
                  </span>
                </div>
              </div>
            )}

            {/* Comments */}
            {order.comments && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Comments</span>
                </div>
                <p className="text-sm text-muted-foreground">{order.comments}</p>
              </div>
            )}

            {/* Created */}
            <div className="text-xs text-muted-foreground pt-2 border-t">
              Created {format(order.createdAt, "MMM d, yyyy 'at' h:mm a")}
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="mt-4">
            <OrderTimeline orderId={order.id} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

