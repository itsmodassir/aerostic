"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    items: {
        name: string;
        href: string;
        icon?: any;
    }[];
}

export function Sidebar({ className, items }: SidebarProps) {
    const pathname = usePathname();

    return (
        <div className={cn("pb-12", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                        Aimstors Solution
                    </h2>
                    <div className="space-y-1">
                        {items.map((item) => (
                            <Link key={item.href} href={item.href}>
                                <Button
                                    variant={pathname === item.href ? "secondary" : "ghost"}
                                    className="w-full justify-start"
                                >
                                    {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                                    {item.name}
                                </Button>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
