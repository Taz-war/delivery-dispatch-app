'use client';

import { useOrderStore } from "@/store/orderStore";
import {
    Package,
    Truck,
    Clock,
    CheckCircle,
    TrendingUp,
    Users,
    AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ElementType;
    trend?: { value: number; isPositive: boolean };
    className?: string;
}

function StatCard({ title, value, subtitle, icon: Icon, trend, className }: StatCardProps) {
    return (
        <Card className={cn("relative overflow-hidden", className)}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <Icon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold text-foreground">{value}</div>
                {subtitle && (
                    <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
                )}
                {trend && (
                    <div
                        className={cn(
                            "flex items-center gap-1 text-xs font-medium mt-2",
                            trend.isPositive ? "text-status-completed" : "text-destructive"
                        )}
                    >
                        <TrendingUp
                            className={cn("w-3 h-3", !trend.isPositive && "rotate-180")}
                        />
                        <span>
                            {trend.isPositive ? "+" : ""}
                            {trend.value}% from yesterday
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default function Dashboard() {
    const { orders, drivers } = useOrderStore();

    const stats = {
        totalOrders: orders.length,
        pendingPicking: orders.filter((o) => o.stage === "picking").length,
        awaitingDispatch: orders.filter((o) => o.stage === "unassigned_driver").length,
        activeDeliveries: orders.filter((o) => o.stage === "assigned_driver").length,
        completed: orders.filter((o) => o.stage === "completed").length,
        activeDrivers: drivers.filter((d) => d.isActive).length,
        urgentOrders: orders.filter((o) => o.orderType === "HOTSHOT").length,
    };

    const recentOrders = orders.slice(0, 5);

    // Mobile quick action tiles (matching the screenshot design pattern)
    const quickActions = [
        { title: "Picking", href: "/picking", icon: Package, color: "bg-blue-500" },
        { title: "Dispatch", href: "/dispatch", icon: Truck, color: "bg-emerald-500" },
        { title: "Map", href: "/map", icon: TrendingUp, color: "bg-orange-500" },
        { title: "Pickup", href: "/pickup", icon: Clock, color: "bg-purple-500" },
        { title: "Fleet", href: "/fleet", icon: Users, color: "bg-amber-500" },
        { title: "Orders", href: "/order-entry", icon: Package, color: "bg-blue-800" },
    ];

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Header - hidden on mobile (shown in MobileHeader) */}
            <div className="hidden md:block">
                <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground">
                    Overview of your logistics operations
                </p>
            </div>

            {/* Mobile Quick Actions Grid */}
            <div className="grid grid-cols-3 gap-3 md:hidden">
                {quickActions.map((action) => (
                    <Link
                        key={action.href}
                        href={action.href}
                        className={cn(
                            "flex flex-col items-center justify-center gap-2 p-4 rounded-xl text-white aspect-square",
                            action.color
                        )}
                    >
                        <action.icon className="w-8 h-8" />
                        <span className="text-sm font-medium">{action.title}</span>
                    </Link>
                ))}
            </div>

            {/* Stats Grid - Desktop */}
            <div className="hidden md:grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Orders"
                    value={stats.totalOrders}
                    subtitle="All time"
                    icon={Package}
                    trend={{ value: 12, isPositive: true }}
                />
                <StatCard
                    title="Pending Picking"
                    value={stats.pendingPicking}
                    subtitle="In warehouse queue"
                    icon={Clock}
                    className="border-l-4 border-l-status-picking"
                />
                <StatCard
                    title="Awaiting Dispatch"
                    value={stats.awaitingDispatch}
                    subtitle="Ready for drivers"
                    icon={Truck}
                    className="border-l-4 border-l-status-unassigned"
                />
                <StatCard
                    title="Active Drivers"
                    value={stats.activeDrivers}
                    subtitle={`${drivers.length} total drivers`}
                    icon={Users}
                    className="border-l-4 border-l-status-assigned"
                />
            </div>

            {/* Mobile Stats Summary */}
            <div className="md:hidden space-y-3">
                <Card>
                    <CardContent className="p-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                                <p className="text-2xl font-bold text-foreground">{stats.pendingPicking}</p>
                                <p className="text-xs text-muted-foreground">Pending Pick</p>
                            </div>
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                                <p className="text-2xl font-bold text-foreground">{stats.awaitingDispatch}</p>
                                <p className="text-xs text-muted-foreground">To Dispatch</p>
                            </div>
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                                <p className="text-2xl font-bold text-foreground">{stats.activeDeliveries}</p>
                                <p className="text-xs text-muted-foreground">En Route</p>
                            </div>
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                                <p className="text-2xl font-bold text-foreground">{stats.completed}</p>
                                <p className="text-xs text-muted-foreground">Completed</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Secondary Stats - Desktop only */}
            <div className="hidden md:grid gap-4 md:grid-cols-3">
                <StatCard
                    title="Active Deliveries"
                    value={stats.activeDeliveries}
                    subtitle="En route to customers"
                    icon={Truck}
                />
                <StatCard
                    title="Completed Today"
                    value={stats.completed}
                    subtitle="Successfully delivered"
                    icon={CheckCircle}
                />
                <StatCard
                    title="Urgent (Hotshot)"
                    value={stats.urgentOrders}
                    subtitle="Priority orders"
                    icon={AlertTriangle}
                    className={stats.urgentOrders > 0 ? "border-destructive/50 bg-destructive/5" : ""}
                />
            </div>

            {/* Recent Orders */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base md:text-lg">Recent Orders</CardTitle>
                </CardHeader>
                <CardContent className="p-3 md:p-6 pt-0 md:pt-0">
                    <div className="space-y-3">
                        {recentOrders.map((order) => (
                            <div
                                key={order.id}
                                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                            >
                                <div className="flex items-center gap-3 md:gap-4 min-w-0">
                                    <div
                                        className={cn(
                                            "w-2 h-2 rounded-full shrink-0",
                                            order.stage === "picking" && "bg-status-picking",
                                            order.stage === "unassigned_driver" && "bg-status-unassigned",
                                            order.stage === "assigned_driver" && "bg-status-assigned",
                                            order.stage === "completed" && "bg-status-completed"
                                        )}
                                    />
                                    <div className="min-w-0">
                                        <p className="font-medium text-sm truncate">{order.customer.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {order.id} • {order.items.length} items
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right shrink-0 ml-2">
                                    <span
                                        className={cn(
                                            "px-2 py-1 text-xs font-medium rounded",
                                            order.orderType === "DODD" && "bg-primary/10 text-primary",
                                            order.orderType === "JOBBER" && "bg-accent/10 text-accent",
                                            order.orderType === "HOTSHOT" && "bg-destructive/10 text-destructive",
                                            order.orderType === "PICKUP" && "bg-status-pickup/10 text-status-pickup"
                                        )}
                                    >
                                        {order.orderType}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
