'use client';

import React from 'react';
import AuthenticatedAppShell from '@/components/layouts/AuthenticatedAppShell';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return <AuthenticatedAppShell>{children}</AuthenticatedAppShell>;
}
