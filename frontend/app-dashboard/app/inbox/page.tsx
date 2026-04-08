import { redirectToActiveWorkspace } from '@/lib/server-workspace';

export default async function InboxPage() {
  await redirectToActiveWorkspace('/inbox');
}
