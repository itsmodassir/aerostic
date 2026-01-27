"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function AdminTenantsPage() {
    const [tenants, setTenants] = useState<any[]>([]);

    useEffect(() => {
        api.get("/admin/tenants")
            .then((res) => setTenants(res.data))
            .catch((err) => console.error(err));
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Tenants & Workspaces</h1>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tenant Name</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created At</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tenants.map((tenant) => (
                            <TableRow key={tenant.id}>
                                <TableCell className="font-medium">{tenant.name}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">{tenant.plan}</Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge className={tenant.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}>
                                        {tenant.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>{new Date(tenant.createdAt).toLocaleDateString()}</TableCell>
                            </TableRow>
                        ))}
                        {tenants.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center p-4">No tenants found</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
