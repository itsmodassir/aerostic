import { redirect } from 'next/navigation';
import { resolveActiveWorkspaceSlug } from '@/lib/server-workspace';

export default async function DashboardResolverPage() {
    const workspaceSlug = await resolveActiveWorkspaceSlug();
    redirect(`/dashboard/${workspaceSlug}`);
}
