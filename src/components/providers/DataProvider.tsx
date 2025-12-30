import { useEffect } from "react";
import { useOrders, useDrivers } from "@/hooks/useOrders";
import { useOrderStore } from "@/store/orderStore";

interface DataProviderProps {
  children: React.ReactNode;
}

export function DataProvider({ children }: DataProviderProps) {
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const { data: drivers, isLoading: driversLoading } = useDrivers();
  const { setOrders, setDrivers } = useOrderStore();

  // Sync Supabase data to Zustand store
  useEffect(() => {
    if (orders) {
      setOrders(orders);
    }
  }, [orders, setOrders]);

  useEffect(() => {
    if (drivers) {
      setDrivers(drivers);
    }
  }, [drivers, setDrivers]);

  // Show loading state
  if (ordersLoading || driversLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading data...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
