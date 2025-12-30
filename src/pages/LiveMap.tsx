import { useOrderStore } from "@/store/orderStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Package, Phone, Map as MapIcon, Calendar, List } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type ViewMode = "week" | "calendar" | "map";

export default function LiveMap() {
  const { orders } = useOrderStore();
  const [selectedRSM, setSelectedRSM] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  // Active orders with coordinates
  const activeOrders = orders.filter(
    (o) => o.stage !== "completed" && o.customer.coordinates
  );

  const selectedOrderData = selectedOrder
    ? orders.find((o) => o.id === selectedOrder)
    : null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex flex-col gap-3 px-4 md:px-6 py-4 border-b border-border bg-card">
        <div className="flex items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">Live Map</h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
              Geographic view of all active orders
            </p>
          </div>

          {/* View Toggle - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
              <TabsList>
                <TabsTrigger value="week" className="gap-2">
                  <List className="w-4 h-4" />
                  Week
                </TabsTrigger>
                <TabsTrigger value="calendar" className="gap-2">
                  <Calendar className="w-4 h-4" />
                  Calendar
                </TabsTrigger>
                <TabsTrigger value="map" className="gap-2">
                  <MapIcon className="w-4 h-4" />
                  Map
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Select value={selectedRSM} onValueChange={setSelectedRSM}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="RSM" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All RSMs</SelectItem>
                <SelectItem value="Kyle">Kyle</SelectItem>
                <SelectItem value="Sarah">Sarah</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* View Toggle - Mobile */}
        <div className="md:hidden flex flex-col gap-2">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
            <TabsList className="w-full">
              <TabsTrigger value="week" className="flex-1 gap-1.5 text-xs">
                <List className="w-3.5 h-3.5" />
                Week
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex-1 gap-1.5 text-xs">
                <Calendar className="w-3.5 h-3.5" />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="map" className="flex-1 gap-1.5 text-xs">
                <MapIcon className="w-3.5 h-3.5" />
                Map
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Select value={selectedRSM} onValueChange={setSelectedRSM}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="RSM" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All RSMs</SelectItem>
              <SelectItem value="Kyle">Kyle</SelectItem>
              <SelectItem value="Sarah">Sarah</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Selected Order Panel */}
        <div className="md:w-80 border-b md:border-b-0 md:border-r border-border bg-card flex flex-col">
          <div className="p-3 md:p-4 border-b border-border">
            <h2 className="font-semibold text-sm md:text-base text-foreground">Selected Delivery</h2>
          </div>

          {selectedOrderData ? (
            <div className="flex-1 p-3 md:p-4 space-y-3 md:space-y-4 max-h-[35vh] md:max-h-none overflow-y-auto">
              <div>
                <h3 className="font-semibold text-base md:text-lg">{selectedOrderData.customer.name}</h3>
                <p className="text-xs md:text-sm text-muted-foreground">#{selectedOrderData.customer.id}</p>
              </div>

              <div className="space-y-2 md:space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-xs md:text-sm">{selectedOrderData.customer.address}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                  <p className="text-xs md:text-sm">{selectedOrderData.customer.phone}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-muted-foreground shrink-0" />
                  <p className="text-xs md:text-sm">
                    {selectedOrderData.items.length} items •{" "}
                    {selectedOrderData.items.reduce((a, i) => a + i.quantity, 0)} units
                  </p>
                </div>
              </div>

              <Card>
                <CardHeader className="py-2 md:py-3">
                  <CardTitle className="text-xs md:text-sm">Line Items</CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="space-y-1.5 md:space-y-2">
                    {selectedOrderData.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-xs md:text-sm">
                        <span>{item.partNumber}</span>
                        <span className="text-muted-foreground">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div
                className={cn(
                  "px-3 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium text-center",
                  selectedOrderData.stage === "picking" && "bg-status-picking/10 text-status-picking",
                  selectedOrderData.stage === "unassigned_driver" && "bg-status-unassigned/10 text-status-unassigned",
                  selectedOrderData.stage === "assigned_driver" && "bg-status-assigned/10 text-status-assigned",
                  selectedOrderData.stage === "completed" && "bg-status-completed/10 text-status-completed"
                )}
              >
                {selectedOrderData.stage.replace("_", " ").toUpperCase()}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-4 text-center text-muted-foreground min-h-[100px] md:min-h-0">
              <div>
                <MapPin className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs md:text-sm">Click a pin on the map to view order details</p>
              </div>
            </div>
          )}
        </div>

        {/* Map Area */}
        <div className="flex-1 relative bg-muted min-h-[300px] md:min-h-0">
          {/* Placeholder Map */}
          <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50">
            <svg className="w-full h-full opacity-10" viewBox="0 0 100 100">
              <path
                d="M10,50 Q30,20 50,50 T90,50"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
              />
              <path
                d="M10,70 Q50,40 90,70"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
              />
            </svg>
          </div>

          {/* Order Pins */}
          <div className="absolute inset-0 p-4 md:p-8">
            <div className="relative w-full h-full">
              {activeOrders.map((order, index) => {
                // Distribute pins across the map area for demo
                const x = 20 + (index % 4) * 20 + Math.random() * 10;
                const y = 20 + Math.floor(index / 4) * 25 + Math.random() * 10;

                return (
                  <button
                    key={order.id}
                    onClick={() => setSelectedOrder(order.id)}
                    className={cn(
                      "absolute transform -translate-x-1/2 -translate-y-full transition-all duration-200 hover:scale-110 z-10",
                      selectedOrder === order.id && "scale-125 z-20"
                    )}
                    style={{ left: `${x}%`, top: `${y}%` }}
                  >
                    <div
                      className={cn(
                        "w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center shadow-lg",
                        order.orderType === "DODD" && "bg-primary text-primary-foreground",
                        order.orderType === "JOBBER" && "bg-accent text-accent-foreground",
                        order.orderType === "HOTSHOT" && "bg-destructive text-destructive-foreground",
                        order.orderType === "PICKUP" && "bg-status-pickup text-white"
                      )}
                    >
                      <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    </div>
                    <div className="absolute left-1/2 -translate-x-1/2 mt-1 px-1.5 md:px-2 py-0.5 bg-card rounded text-[10px] md:text-xs font-medium shadow whitespace-nowrap">
                      {order.customer.name.slice(0, 12)}...
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Map placeholder text */}
          <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4 px-2 md:px-3 py-1.5 md:py-2 bg-card/80 backdrop-blur rounded-lg shadow">
            <p className="text-[10px] md:text-xs text-muted-foreground">
              Map visualization • {activeOrders.length} active orders
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
