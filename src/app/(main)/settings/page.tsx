'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, Users, Tags, Bell, Shield } from "lucide-react";

export default function Settings() {
    return (
        <div className="p-6 space-y-6 max-w-4xl">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-foreground">Settings</h1>
                <p className="text-muted-foreground">
                    Configure driver permissions and system settings
                </p>
            </div>

            {/* Driver Permissions */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle>Driver Permissions</CardTitle>
                            <CardDescription>Control what drivers can access</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">View All Orders</p>
                            <p className="text-sm text-muted-foreground">Allow drivers to see orders assigned to others</p>
                        </div>
                        <Switch />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Upload Photos</p>
                            <p className="text-sm text-muted-foreground">Allow drivers to upload delivery proof photos</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Mark Complete</p>
                            <p className="text-sm text-muted-foreground">Allow drivers to mark orders as completed</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                </CardContent>
            </Card>

            {/* Order Tags */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                            <Tags className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                            <CardTitle>Order Type Configuration</CardTitle>
                            <CardDescription>Manage order type tags and colors</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4">
                        {["DODD", "JOBBER", "HOTSHOT", "PICKUP"].map((tag) => (
                            <div key={tag} className="flex items-center gap-4">
                                <Input defaultValue={tag} className="max-w-[200px]" />
                                <Input type="color" defaultValue="#f97316" className="w-12 h-10 p-1" />
                                <Button variant="ghost" size="sm">Remove</Button>
                            </div>
                        ))}
                    </div>
                    <Button variant="outline" size="sm">Add Order Type</Button>
                </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-status-assigned/10 flex items-center justify-center">
                            <Bell className="w-5 h-5 text-status-assigned" />
                        </div>
                        <div>
                            <CardTitle>Notifications</CardTitle>
                            <CardDescription>Configure alert preferences</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">New Order Alerts</p>
                            <p className="text-sm text-muted-foreground">Get notified when new orders are created</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Delivery Completed</p>
                            <p className="text-sm text-muted-foreground">Alert when drivers complete deliveries</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                    Save Changes
                </Button>
            </div>
        </div>
    );
}
