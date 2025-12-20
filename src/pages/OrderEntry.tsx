import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOrderStore } from "@/store/orderStore";
import { Order, OrderType, LineItem } from "@/types/order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2, Save, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const orderTypes: OrderType[] = ["DODD", "JOBBER", "HOTSHOT", "PICKUP"];

const orderTypeDescriptions: Record<OrderType, string> = {
  DODD: "Daily Overnight Delivery",
  JOBBER: "Jobber Account",
  HOTSHOT: "Urgent Priority",
  PICKUP: "Customer Pickup",
};

export default function OrderEntry() {
  const navigate = useNavigate();
  const { addOrder } = useOrderStore();

  const [formData, setFormData] = useState({
    customerName: "",
    customerId: "",
    address: "",
    deliverTo: "",
    phone: "",
    orderType: "DODD" as OrderType,
    comments: "",
    scheduledDate: undefined as Date | undefined,
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { partNumber: "", quantity: 1, poNumber: "" },
  ]);

  const addLineItem = () => {
    setLineItems([...lineItems, { partNumber: "", quantity: 1, poNumber: "" }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newOrder: Order = {
      id: `ORD-${Date.now().toString(36).toUpperCase()}`,
      customer: {
        name: formData.customerName,
        id: formData.customerId,
        address: formData.address,
        phone: formData.phone,
        coordinates: { lat: 32.7767, lng: -96.797 }, // Default coords
      },
      items: lineItems.filter((item) => item.partNumber.trim() !== ""),
      stage: formData.orderType === "PICKUP" ? "pickup_store" : "picking",
      scheduledDate: formData.scheduledDate || null,
      assignedDay: null,
      rsm: "Kyle",
      assignedDriverId: null,
      orderType: formData.orderType,
      invoicePhotoUrl: null,
      comments: formData.comments,
      createdAt: new Date(),
      pickingColumn: "Unassigned",
    };

    addOrder(newOrder);
    
    toast({
      title: "Order Created",
      description: `Order ${newOrder.id} has been added to the ${formData.orderType === "PICKUP" ? "Pickup" : "Picking"} Board.`,
    });

    navigate(formData.orderType === "PICKUP" ? "/pickup" : "/picking");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">New Order</h1>
          <p className="text-sm text-muted-foreground">
            Create a new delivery or pickup order
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                placeholder="e.g., AutoZone #4521"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerId">ID #</Label>
              <Input
                id="customerId"
                placeholder="e.g., AZ-4521"
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="Street address, city, state, zip"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone #</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(555) 555-5555"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="deliverTo">Deliver To</Label>
              <Input
                id="deliverTo"
                placeholder="Specific delivery instructions or location"
                value={formData.deliverTo}
                onChange={(e) => setFormData({ ...formData, deliverTo: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Line Items</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
              <Plus className="w-4 h-4 mr-2" />
              Add Row
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Header */}
              <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <div className="col-span-5">Part #</div>
                <div className="col-span-2">Qty</div>
                <div className="col-span-4">PO #</div>
                <div className="col-span-1"></div>
              </div>

              {/* Rows */}
              {lineItems.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5">
                    <Input
                      placeholder="Part number"
                      value={item.partNumber}
                      onChange={(e) => updateLineItem(index, "partNumber", e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(index, "quantity", parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="col-span-4">
                    <Input
                      placeholder="PO number"
                      value={item.poNumber}
                      onChange={(e) => updateLineItem(index, "poNumber", e.target.value)}
                    />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLineItem(index)}
                      disabled={lineItems.length === 1}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Order Type */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {orderTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, orderType: type })}
                  className={cn(
                    "flex flex-col items-center p-4 rounded-lg border-2 transition-all",
                    formData.orderType === type
                      ? type === "DODD"
                        ? "border-primary bg-primary/5"
                        : type === "JOBBER"
                        ? "border-accent bg-accent/5"
                        : type === "HOTSHOT"
                        ? "border-destructive bg-destructive/5"
                        : "border-status-pickup bg-status-pickup/5"
                      : "border-border hover:border-muted-foreground/30"
                  )}
                >
                  <span className="font-semibold text-foreground">{type}</span>
                  <span className="text-xs text-muted-foreground text-center mt-1">
                    {orderTypeDescriptions[type]}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Comments & Date */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Comments</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Additional notes or instructions..."
                value={formData.comments}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                rows={4}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Delivery Date</CardTitle>
            </CardHeader>
            <CardContent>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.scheduledDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.scheduledDate ? (
                      format(formData.scheduledDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.scheduledDate}
                    onSelect={(date) => setFormData({ ...formData, scheduledDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </CardContent>
          </Card>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Save className="w-4 h-4 mr-2" />
            Create Order
          </Button>
        </div>
      </form>
    </div>
  );
}
