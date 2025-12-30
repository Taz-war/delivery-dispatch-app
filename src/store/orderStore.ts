import { create } from 'zustand';
import { Order, PickingColumn, Driver } from '@/types/order';

// Mock data for demo
const mockOrders: Order[] = [
  {
    id: "ORD-001",
    customer: {
      name: "AutoZone #4521",
      id: "AZ-4521",
      address: "123 Main Street, Dallas, TX 75201",
      phone: "(214) 555-0123",
      coordinates: { lat: 32.7767, lng: -96.7970 }
    },
    items: [
      { partNumber: "BRK-2045", quantity: 4, poNumber: "PO-78945" },
      { partNumber: "OIL-5W30", quantity: 12, poNumber: "PO-78945" }
    ],
    stage: "picking",
    scheduledDate: null,
    assignedDay: null,
    rsm: "Kyle",
    assignedDriverId: null,
    orderType: "DODD",
    invoicePhotoUrl: null,
    comments: "Urgent - customer waiting",
    createdAt: new Date(),
    pickingColumn: "Unassigned",
    orderDocumentUrl: null,
    presellNumber: null
  },
  {
    id: "ORD-002",
    customer: {
      name: "O'Reilly Auto Parts",
      id: "OR-8832",
      address: "456 Commerce Blvd, Fort Worth, TX 76102",
      phone: "(817) 555-0456",
      coordinates: { lat: 32.7555, lng: -97.3308 }
    },
    items: [
      { partNumber: "FLT-AIR-22", quantity: 6, poNumber: "PO-44521" }
    ],
    stage: "picking",
    scheduledDate: null,
    assignedDay: "Mon",
    rsm: "Kyle",
    assignedDriverId: null,
    orderType: "JOBBER",
    invoicePhotoUrl: null,
    comments: "",
    createdAt: new Date(),
    pickingColumn: "Mon",
    orderDocumentUrl: null,
    presellNumber: "PS-44521"
  },
  {
    id: "ORD-003",
    customer: {
      name: "Pep Boys #112",
      id: "PB-112",
      address: "789 Auto Lane, Arlington, TX 76010",
      phone: "(682) 555-0789",
      coordinates: { lat: 32.7357, lng: -97.1081 }
    },
    items: [
      { partNumber: "BAT-12V", quantity: 2, poNumber: "PO-99012" },
      { partNumber: "WIP-22IN", quantity: 8, poNumber: "PO-99012" }
    ],
    stage: "picking",
    scheduledDate: null,
    assignedDay: "Tue",
    rsm: "Sarah",
    assignedDriverId: null,
    orderType: "HOTSHOT",
    invoicePhotoUrl: null,
    comments: "Call before delivery",
    createdAt: new Date(),
    pickingColumn: "Tue",
    orderDocumentUrl: null,
    presellNumber: null
  },
  {
    id: "ORD-004",
    customer: {
      name: "NAPA Auto Care",
      id: "NAPA-3301",
      address: "321 Parts Way, Plano, TX 75074",
      phone: "(972) 555-0321",
      coordinates: { lat: 33.0198, lng: -96.6989 }
    },
    items: [
      { partNumber: "SPK-PLAT", quantity: 16, poNumber: "PO-55667" }
    ],
    stage: "picking",
    scheduledDate: null,
    assignedDay: null,
    rsm: "Kyle",
    assignedDriverId: null,
    orderType: "PICKUP",
    invoicePhotoUrl: null,
    comments: "",
    createdAt: new Date(),
    pickingColumn: "Unassigned",
    orderDocumentUrl: null,
    presellNumber: null
  },
  {
    id: "ORD-005",
    customer: {
      name: "Advance Auto Parts",
      id: "AAP-7745",
      address: "555 Mechanic Drive, Irving, TX 75039",
      phone: "(469) 555-0555",
      coordinates: { lat: 32.8140, lng: -96.9489 }
    },
    items: [
      { partNumber: "ALT-REMAN", quantity: 1, poNumber: "PO-11223" }
    ],
    stage: "unassigned_driver",
    scheduledDate: null,
    assignedDay: null,
    rsm: "Kyle",
    assignedDriverId: null,
    orderType: "DODD",
    invoicePhotoUrl: null,
    comments: "",
    createdAt: new Date(),
    pickingColumn: "Picked",
    orderDocumentUrl: null,
    presellNumber: null
  }
];

const mockDrivers: Driver[] = [
  { id: "DRV-001", name: "Mike Johnson", phone: "(214) 555-1001", vehicleType: "truck", isActive: true },
  { id: "DRV-002", name: "Carlos Rodriguez", phone: "(214) 555-1002", vehicleType: "van", isActive: true },
  { id: "DRV-003", name: "James Wilson", phone: "(214) 555-1003", vehicleType: "hotshot", isActive: true },
];

interface OrderStore {
  orders: Order[];
  drivers: Driver[];
  addOrder: (order: Order) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  moveOrderToColumn: (orderId: string, newColumn: PickingColumn) => void;
  assignOrderToDriver: (orderId: string, driverId: string) => void;
  getOrdersByStage: (stage: Order['stage']) => Order[];
  getOrdersByPickingColumn: (column: PickingColumn) => Order[];
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: mockOrders,
  drivers: mockDrivers,
  
  addOrder: (order) => set((state) => ({ 
    orders: [...state.orders, order] 
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
