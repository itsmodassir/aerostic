import { redirectToActiveWorkspace } from '@/lib/server-workspace';

export default async function BillingPage() {
  await redirectToActiveWorkspace('/billing');
}
