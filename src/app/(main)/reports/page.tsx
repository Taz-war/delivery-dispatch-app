'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useOrderStore } from "@/store/orderStore";
import { BarChart3, Download, FileSpreadsheet, Calendar } from "lucide-react";

export default function Reports() {
    const { orders, drivers } = useOrderStore();

    const stats = {
        totalOrders: orders.length,
        byType: {
            DODD: orders.filter(o => o.orderType === "DODD").length,
            JOBBER: orders.filter(o => o.orderType === "JOBBER").length,
            HOTSHOT: orders.filter(o => o.orderType === "HOTSHOT").length,
            PICKUP: orders.filter(o => o.orderType === "PICKUP").length,
        },
    };

    const exportToCSV = () => {
        const headers = ["Order ID", "Customer", "Type", "Stage", "Date"];
        const rows = orders.map(o => [
            o.id,
            o.customer.name,
            o.orderType,
            o.stage,
            new Date(o.createdAt).toLocaleDateString()
        ]);

        const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "orders-report.csv";
        a.click();
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Reports</h1>
                    <p className="text-muted-foreground">
                        Analytics and data exports
                    </p>
                </div>
                <Button onClick={exportToCSV} className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                    <Download className="w-4 h-4" />
                    Export CSV
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">DODD Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.byType.DODD}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">JOBBER Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.byType.JOBBER}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">HOTSHOT Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.byType.HOTSHOT}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">PICKUP Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.byType.PICKUP}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Report Actions */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="hover:shadow-card-hover transition-shadow cursor-pointer">
                    <CardContent className="flex items-center gap-4 py-6">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FileSpreadsheet className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Orders Report</h3>
                            <p className="text-sm text-muted-foreground">Export all orders data</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-card-hover transition-shadow cursor-pointer">
                    <CardContent className="flex items-center gap-4 py-6">
                        <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                            <BarChart3 className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Driver Performance</h3>
                            <p className="text-sm text-muted-foreground">Deliveries per driver</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-card-hover transition-shadow cursor-pointer">
                    <CardContent className="flex items-center gap-4 py-6">
                        <div className="w-12 h-12 rounded-lg bg-status-completed/10 flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-status-completed" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Monthly Summary</h3>
                            <p className="text-sm text-muted-foreground">Month-over-month trends</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
