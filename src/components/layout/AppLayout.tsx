import { AppSidebar } from "./AppSidebar";
import { MobileHeader } from "./MobileHeader";
import { MobileBottomNav } from "./MobileBottomNav";
import { Outlet } from "react-router-dom";

export function AppLayout() {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        {/* Mobile Header - visible only on mobile */}
        <MobileHeader />

        {/* Main Content */}
        <main className="flex-1 overflow-auto pb-16 md:pb-0">
          <Outlet />
        </main>

        {/* Mobile Bottom Nav - visible only on mobile */}
        <MobileBottomNav />
      </div>
    </div>
  );
}
