import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCustomers, Customer } from "@/hooks/useCustomers";

interface CustomerSearchProps {
  value: {
    customerName: string;
    customerId: string;
    address: string;
    phone: string;
  };
  onChange: (data: {
    customerName: string;
    customerId: string;
    address: string;
    phone: string;
  }) => void;
}

export function CustomerSearch({ value, onChange }: CustomerSearchProps) {
  const [searchQuery, setSearchQuery] = useState(value.customerName || "");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync internal search query if external value changes (e.g. cleared by parent)
  useEffect(() => {
    if (value.customerName !== searchQuery) {
      // Only update if it's significantly different or cleared to avoid typing loops
      // But simplistic approach: if value.customerName is empty, clear search
      if (!value.customerName) {
        setSearchQuery("");
        setSelectedCustomer(null);
      }
    }
  }, [value.customerName]);


  // Fetch customers using the hook
  const { data: customers = [] } = useCustomers();

  // Filter customers based on search query
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.customer_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle customer selection
  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setSearchQuery(customer.name);
    onChange({
      customerName: customer.name,
      customerId: customer.customer_code,
      address: customer.address || "",
      phone: customer.phone || "",
    });
    setIsOpen(false);
  };

  // Clear selection
  const handleClear = () => {
    setSelectedCustomer(null);
    setSearchQuery("");
    onChange({
      customerName: "",
      customerId: "",
      address: "",
      phone: "",
    });
  };

  return (
    <div ref={containerRef} className="space-y-4">
      {/* Customer Name Search */}
      <div className="space-y-2">
        <Label htmlFor="customerSearch">Customer Name</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="customerSearch"
            placeholder="Search customer..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsOpen(true);
              if (selectedCustomer) {
                setSelectedCustomer(null);
                onChange({
                  customerName: e.target.value,
                  customerId: "",
                  address: "",
                  phone: "",
                });
              } else {
                onChange({ ...value, customerName: e.target.value });
              }
            }}
            onFocus={() => setIsOpen(true)}
            className="pl-9"
          />
          {selectedCustomer && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-2 text-xs"
              onClick={handleClear}
            >
              Clear
            </Button>
          )}
        </div>

        {/* Dropdown */}
        {isOpen && searchQuery && (
          <div className="absolute z-50 w-full max-w-md mt-1 bg-popover border rounded-md shadow-lg overflow-hidden">
            <div className="max-h-60 overflow-auto">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.slice(0, 10).map((customer) => (
                  <button
                    key={customer.id}
                    type="button"
                    onClick={() => handleSelectCustomer(customer)}
                    className={cn(
                      "w-full px-3 py-2 text-left hover:bg-muted flex items-center justify-between",
                      selectedCustomer?.id === customer.id && "bg-muted"
                    )}
                  >
                    <div>
                      <p className="font-medium text-sm">{customer.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {customer.customer_code}
                        {customer.address && ` • ${customer.address}`}
                      </p>
                    </div>
                    {selectedCustomer?.id === customer.id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  No customers found.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Customer ID - readonly when selected */}
      <div className="space-y-2">
        <Label htmlFor="customerId">ID #</Label>
        <Input
          id="customerId"
          placeholder="Auto-generated or select customer"
          value={value.customerId}
          onChange={(e) => onChange({ ...value, customerId: e.target.value })}
          readOnly={!!selectedCustomer}
          className={cn(selectedCustomer && "bg-muted")}
        />
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          placeholder="Street address, city, state, zip"
          value={value.address}
          onChange={(e) => onChange({ ...value, address: e.target.value })}
        />
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone">Phone #</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="(555) 555-5555"
          value={value.phone}
          onChange={(e) => onChange({ ...value, phone: e.target.value })}
        />
      </div>
    </div>
  );
}
