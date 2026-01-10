import { Menu, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  Package,
  Truck,
  Store,
  Map,
  Car,
  Users,
  FileText,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserMenu } from "@/components/auth/UserMenu";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navigation: NavGroup[] = [
  {
    title: "Operations",
    items: [
      { title: "Dashboard", href: "/", icon: LayoutDashboard },
      { title: "Order Entry", href: "/order-entry", icon: ClipboardList },
      { title: "Picking Board", href: "/picking", icon: Package },
      { title: "Dispatch Control", href: "/dispatch", icon: Truck },
      { title: "Pickup Board", href: "/pickup", icon: Store },
      { title: "Live Map", href: "/map", icon: Map },
    ],
  },
  {
    title: "Management",
    items: [
      { title: "Fleet", href: "/fleet", icon: Car },
      { title: "Customers", href: "/customers", icon: Users },
      { title: "Invoices", href: "/invoices", icon: FileText },
    ],
  },
  {
    title: "Admin",
    items: [
      { title: "Reports", href: "/reports", icon: BarChart3 },
      { title: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function MobileHeader() {
  const location = useLocation();

  // Get current page title
  const currentPage = navigation
    .flatMap((g) => g.items)
    .find((item) => item.href === location.pathname);

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-14 px-4 bg-card border-b border-border md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="shrink-0">
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0 bg-sidebar">
          {/* Logo */}
          <div className="flex items-center h-14 px-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
                <Truck className="w-5 h-5 text-sidebar-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-sidebar-accent-foreground text-lg">
                  DispatchPro
                </h1>
                <p className="text-xs text-sidebar-foreground -mt-0.5">Logistics</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto scrollbar-thin py-4">
            {navigation.map((group) => (
              <div key={group.title} className="mb-6">
                <h2 className="px-4 mb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">
                  {group.title}
                </h2>
                <ul className="space-y-1 px-2">
                  {group.items.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <li key={item.href}>
                        <NavLink
                          to={item.href}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                            isActive
                              ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/20"
                              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          )}
                        >
                          <item.icon className="w-5 h-5 flex-shrink-0" />
                          <span className="truncate">{item.title}</span>
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      <h1 className="text-lg font-semibold text-foreground">
        {currentPage?.title || "DispatchPro"}
      </h1>

      <UserMenu />
    </header>
  );
}
