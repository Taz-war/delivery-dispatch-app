import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { DataProvider } from "./components/providers/DataProvider";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import OrderEntry from "./pages/OrderEntry";
import PickingBoard from "./pages/PickingBoard";
import DispatchControl from "./pages/DispatchControl";
import PickupBoard from "./pages/PickupBoard";
import LiveMap from "./pages/LiveMap";
import Fleet from "./pages/Fleet";
import Customers from "./pages/Customers";
import Orders from "./pages/Orders";
import Invoices from "./pages/Invoices";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route
            element={
              <ProtectedRoute>
                <DataProvider>
                  <AppLayout />
                </DataProvider>
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/order-entry" element={<OrderEntry />} />
            <Route path="/picking" element={<PickingBoard />} />
            <Route path="/dispatch" element={<DispatchControl />} />
            <Route path="/pickup" element={<PickupBoard />} />
            <Route path="/map" element={<LiveMap />} />
            <Route path="/fleet" element={<Fleet />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
