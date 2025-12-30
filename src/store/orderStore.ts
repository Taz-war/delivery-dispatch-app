import { create } from 'zustand';
import { Order, PickingColumn, Driver } from '@/types/order';

// This store now acts as a client-side cache that syncs with Supabase
// The actual data fetching is done via React Query hooks in useOrders.ts

interface OrderStore {
  orders: Order[];
  drivers: Driver[];
  setOrders: (orders: Order[]) => void;
  setDrivers: (drivers: Driver[]) => void;
  addOrder: (order: Order) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  moveOrderToColumn: (orderId: string, newColumn: PickingColumn) => void;
  assignOrderToDriver: (orderId: string, driverId: string) => void;
  getOrdersByStage: (stage: Order['stage']) => Order[];
  getOrdersByPickingColumn: (column: PickingColumn) => Order[];
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: [],
  drivers: [],
  
  setOrders: (orders) => set({ orders }),
  
  setDrivers: (drivers) => set({ drivers }),
  
  addOrder: (order) => set((state) => ({ 
    orders: [order, ...state.orders] 
  })),
  
  updateOrder: (id, updates) => set((state) => ({
    orders: state.orders.map(order => 
      order.id === id ? { ...order, ...updates } : order
    )
  })),
  
  moveOrderToColumn: (orderId, newColumn) => set((state) => ({
    orders: state.orders.map(order => {
      if (order.id !== orderId) return order;
      
      const updates: Partial<Order> = { pickingColumn: newColumn };
      
      // Update assignedDay based on column
      if (newColumn === "Unassigned" || newColumn === "Picked") {
        updates.assignedDay = null;
      } else {
        updates.assignedDay = newColumn as Order['assignedDay'];
      }
      
      // When moved to "Picked", update stage
      if (newColumn === "Picked") {
        updates.stage = "unassigned_driver";
      }
      
      return { ...order, ...updates };
    })
  })),
  
  assignOrderToDriver: (orderId, driverId) => set((state) => ({
    orders: state.orders.map(order => 
      order.id === orderId 
        ? { ...order, assignedDriverId: driverId, stage: "assigned_driver" as const }
        : order
    )
  })),
  
  getOrdersByStage: (stage) => get().orders.filter(o => o.stage === stage),
  
  getOrdersByPickingColumn: (column) => get().orders.filter(o => o.pickingColumn === column),
}));
