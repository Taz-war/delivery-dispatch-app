import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Search, Plus, MapPin, Phone, History } from "lucide-react";

// Mock customers
const customers = [
  { id: "AZ-4521", name: "AutoZone #4521", address: "123 Main Street, Dallas, TX 75201", phone: "(214) 555-0123", orders: 24 },
  { id: "OR-8832", name: "O'Reilly Auto Parts", address: "456 Commerce Blvd, Fort Worth, TX 76102", phone: "(817) 555-0456", orders: 18 },
  { id: "PB-112", name: "Pep Boys #112", address: "789 Auto Lane, Arlington, TX 76010", phone: "(682) 555-0789", orders: 31 },
  { id: "NAPA-3301", name: "NAPA Auto Care", address: "321 Parts Way, Plano, TX 75074", phone: "(972) 555-0321", orders: 12 },
  { id: "AAP-7745", name: "Advance Auto Parts", address: "555 Mechanic Drive, Irving, TX 75039", phone: "(469) 555-0555", orders: 27 },
];

export default function Customers() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground">
            Customer database and order history
          </p>
        </div>
        <Button className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
          <Plus className="w-4 h-4" />
          Add Customer
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search customers by name or ID..." className="pl-10" />
      </div>

      {/* Customers Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {customers.map((customer) => (
          <Card key={customer.id} className="hover:shadow-card-hover transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{customer.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">#{customer.id}</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{customer.address}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{customer.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t border-border">
                <History className="w-4 h-4" />
                <span>{customer.orders} total orders</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
