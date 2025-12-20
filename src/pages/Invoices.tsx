import { useOrderStore } from "@/store/orderStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Search, Download, Eye, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Invoices() {
  const { orders } = useOrderStore();
  
  // Completed orders would have invoices
  const completedOrders = orders.filter(o => o.stage === "completed");
  
  // For demo, show all orders as if they were completed
  const allOrdersAsInvoices = orders;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Invoices</h1>
          <p className="text-muted-foreground">
            Completed orders with delivery proof
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export All
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search invoices..." className="pl-10" />
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <div className="col-span-2">Order ID</div>
              <div className="col-span-3">Customer</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-1">Items</div>
              <div className="col-span-2">Actions</div>
            </div>

            {/* Rows */}
            {allOrdersAsInvoices.map((order) => (
              <div
                key={order.id}
                className="grid grid-cols-12 gap-4 items-center px-4 py-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="col-span-2">
                  <span className="font-medium text-sm">{order.id}</span>
                </div>
                <div className="col-span-3">
                  <p className="font-medium text-sm truncate">{order.customer.name}</p>
                  <p className="text-xs text-muted-foreground">#{order.customer.id}</p>
                </div>
                <div className="col-span-2">
                  <span
                    className={cn(
                      "px-2 py-1 text-xs font-medium rounded",
                      order.orderType === "DODD" && "bg-primary/10 text-primary",
                      order.orderType === "JOBBER" && "bg-accent/10 text-accent",
                      order.orderType === "HOTSHOT" && "bg-destructive/10 text-destructive",
                      order.orderType === "PICKUP" && "bg-status-pickup/10 text-status-pickup"
                    )}
                  >
                    {order.orderType}
                  </span>
                </div>
                <div className="col-span-2 text-sm text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString()}
                </div>
                <div className="col-span-1 text-sm">
                  {order.items.length}
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Download className="w-4 h-4" />
                  </Button>
                  {order.invoicePhotoUrl && (
                    <CheckCircle className="w-4 h-4 text-status-completed" />
                  )}
                </div>
              </div>
            ))}

            {allOrdersAsInvoices.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No invoices yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
