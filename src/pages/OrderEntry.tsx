import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateOrder } from "@/hooks/useOrders";
import { OrderType, LineItem } from "@/types/order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2, Save, ArrowLeft, Upload, FileText, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { CustomerSearch } from "@/components/order/CustomerSearch";

const orderTypes: OrderType[] = ["DODD", "JOBBER", "HOTSHOT", "PICKUP"];

const orderTypeDescriptions: Record<OrderType, string> = {
  DODD: "Daily Overnight Delivery",
  JOBBER: "Jobber Account",
  HOTSHOT: "Urgent Priority",
  PICKUP: "Customer Pickup",
};

export default function OrderEntry() {
  const navigate = useNavigate();
  const createOrder = useCreateOrder();

  const [formData, setFormData] = useState({
    customerName: "",
    customerId: "",
    address: "",
    deliverTo: "",
    phone: "",
    orderType: "DODD" as OrderType,
    comments: "",
    scheduledDate: undefined as Date | undefined,
    presellNumber: "",
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { partNumber: "", quantity: 1, poNumber: "" },
  ]);

  const [orderDocument, setOrderDocument] = useState<{ name: string; url: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image (JPG, PNG, GIF, WEBP) or PDF file.",
          variant: "destructive",
        });
        return;
      }
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }
      // Create a local URL for preview (in production, this would upload to storage)
      const url = URL.createObjectURL(file);
      setOrderDocument({ name: file.name, url });
    }
  };

  const removeDocument = () => {
    if (orderDocument?.url) {
      URL.revokeObjectURL(orderDocument.url);
    }
    setOrderDocument(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Non-pickup orders now default to 'unassigned_driver' stage (bypassing picking)
      const stage = formData.orderType === "PICKUP" ? "pickup_store" : "unassigned_driver";
      
      const newOrder = await createOrder.mutateAsync({
        customer: {
          name: formData.customerName,
          id: formData.customerId,
          address: formData.address,
          phone: formData.phone,
          coordinates: { lat: 32.7767, lng: -96.797 }, // Default coords
        },
        items: lineItems.filter((item) => item.partNumber.trim() !== ""),
        stage,
        scheduledDate: formData.scheduledDate || null,
        assignedDay: null,
        rsm: "Kyle",
        assignedDriverId: null,
        orderType: formData.orderType,
        invoicePhotoUrl: null,
        comments: formData.comments,
        pickingColumn: "Unassigned",
        orderDocumentUrl: orderDocument?.url || null,
        presellNumber: formData.orderType === "JOBBER" ? formData.presellNumber : null,
      });
      
      toast({
        title: "Order Created",
        description: `Order has been saved to ${formData.orderType === "PICKUP" ? "Pickup Board" : "Dispatch Control (Unassigned)"}.`,
      });

      navigate(formData.orderType === "PICKUP" ? "/pickup" : "/dispatch");
    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        title: "Error",
        description: "Failed to create order. Please try again.",
        variant: "destructive",
      });
    }
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
            <div className="md:col-span-2">
              <CustomerSearch
                value={{
                  customerName: formData.customerName,
                  customerId: formData.customerId,
                  address: formData.address,
                  phone: formData.phone,
                }}
                onChange={(data) =>
                  setFormData({
                    ...formData,
                    customerName: data.customerName,
                    customerId: data.customerId,
                    address: data.address,
                    phone: data.phone,
                  })
                }
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="deliverTo" className="text-sm font-medium">Deliver To</label>
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
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {orderTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, orderType: type, presellNumber: type !== "JOBBER" ? "" : formData.presellNumber })}
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

            {/* PRE SELL field - only visible for JOBBER orders */}
            {formData.orderType === "JOBBER" && (
              <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg space-y-2">
                <Label htmlFor="presellNumber" className="text-accent font-medium">
                  PRE SELL Number
                </Label>
                <Input
                  id="presellNumber"
                  placeholder="Enter Pre-Sell number"
                  value={formData.presellNumber}
                  onChange={(e) => setFormData({ ...formData, presellNumber: e.target.value })}
                  className="border-accent/30 focus:border-accent"
                />
                <p className="text-xs text-muted-foreground">
                  This number will be visible to drivers on the order card.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Document Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Document</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Upload an image or PDF of the order for driver reference.
              </p>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="orderDocumentUpload"
              />

              {!orderDocument ? (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-24 border-dashed border-2 hover:border-accent hover:bg-accent/5"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-6 h-6 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Click to upload image or PDF
                    </span>
                  </div>
                </Button>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border">
                  <FileText className="w-8 h-8 text-accent flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{orderDocument.name}</p>
                    <p className="text-xs text-muted-foreground">Document attached</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={removeDocument}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
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
              <CardTitle className="text-lg">Fulfilment Day</CardTitle>
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
