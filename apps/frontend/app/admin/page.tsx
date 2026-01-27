"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        api.get("/admin/system-logs")
            .then((res) => setStats(res.data))
            .catch((err) => console.error("Failed to fetch system stats", err));
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Super Admin Dashboard</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.uptime ? Math.floor(stats.uptime / 60) + ' mins' : '...'}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.memoryUsage?.heapUsed ? Math.floor(stats.memoryUsage.heapUsed / 1024 / 1024) + ' MB' : '...'}</div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
