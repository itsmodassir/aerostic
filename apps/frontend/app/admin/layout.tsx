import { Sidebar } from "@/components/ui/sidebar";
import { Users, Server, FileText, LayoutDashboard } from "lucide-react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const adminNav = [
        { name: "Overview", href: "/admin", icon: LayoutDashboard },
        { name: "Tenants", href: "/admin/tenants", icon: Users },
        { name: "System Logs", href: "/admin/system", icon: Server },
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar className="w-64 border-r bg-white" items={adminNav} />
            <main className="flex-1 overflow-y-auto p-8">
                <div className="mx-auto max-w-7xl">{children}</div>
            </main>
        </div>
    );
}
