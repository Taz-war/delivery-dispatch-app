import { Order } from "@/types/order";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { OrderTimeline } from "./OrderTimeline";
import { 
  Package, 
  MapPin, 
  Clock, 
  FileText, 
  Tag, 
  User,
  History
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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
  if (!order) return null;

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
