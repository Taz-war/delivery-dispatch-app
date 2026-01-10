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
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
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

export function AppSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <Truck className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="font-bold text-sidebar-accent-foreground text-lg">
                DispatchPro
              </h1>
              <p className="text-xs text-sidebar-foreground -mt-0.5">Logistics</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-4">
        {navigation.map((group) => (
          <div key={group.title} className="mb-6">
            {!collapsed && (
              <h2 className="px-4 mb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">
                {group.title}
              </h2>
            )}
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
                      <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive && "animate-scale-in")} />
                      {!collapsed && (
                        <span className="animate-fade-in truncate">{item.title}</span>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User Menu & Collapse Button */}
      <div className="p-4 border-t border-sidebar-border space-y-3">
        <div className={cn("flex items-center", collapsed ? "justify-center" : "justify-between")}>
          {!collapsed && <span className="text-sm text-sidebar-foreground">Account</span>}
          <UserMenu />
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5 mr-2" />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
