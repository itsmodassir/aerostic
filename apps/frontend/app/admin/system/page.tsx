"use client";

import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { useState } from "react";

export default function AdminSystemPage() {
    const [rotating, setRotating] = useState(false);
    const [message, setMessage] = useState("");

    const rotateTokens = async () => {
        setRotating(true);
        try {
            await api.post("/admin/tokens/rotate");
            setMessage("System Tokens Rotated Successfully");
        } catch (e) {
            setMessage("Failed to rotate tokens");
        } finally {
            setRotating(false);
        }
    };

    return (
        <div className="max-w-xl space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">System Operations</h1>

            <div className="p-6 border rounded-lg bg-white space-y-4">
                <h3 className="text-lg font-medium text-red-600">Danger Zone</h3>
                <p className="text-sm text-gray-500">
                    Rotating system tokens will re-encrypt all stored access tokens.
                    Ensure backups are present before proceeding.
                </p>
                <Button variant="destructive" onClick={rotateTokens} disabled={rotating}>
                    {rotating ? "Rotating..." : "Rotate All System Tokens"}
                </Button>
                {message && <p className="text-sm font-medium">{message}</p>}
            </div>
        </div>
    );
}
