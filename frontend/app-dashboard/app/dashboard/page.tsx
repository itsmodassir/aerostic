import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardResolverClient from './DashboardResolverClient';

export default async function DashboardResolverPage() {
    const cookieStore = await cookies();
    if (!cookieStore.get('access_token')) {
        redirect('/login');
    }

    return <DashboardResolverClient />;
}
