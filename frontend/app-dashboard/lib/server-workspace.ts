import 'server-only';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

function isRedirectSignal(error: unknown): boolean {
  return !!(error as { digest?: string })?.digest?.startsWith('NEXT_REDIRECT');
}

async function fetchWorkspaceSlug(accessToken: string, preferredSlug?: string | null) {
  const apiUrl =
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_INTERNAL_API_URL ||
    'http://localhost:3001';

  const response = await fetch(`${apiUrl}/api/v1/auth/workspaces`, {
    headers: {
      Cookie: `access_token=${accessToken}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    return null;
  }

  const workspaces = await response.json();
  const workspaceList = Array.isArray(workspaces) ? workspaces : [];

  const preferred = preferredSlug
    ? workspaceList.find((workspace: any) => workspace?.tenant?.slug === preferredSlug)
    : null;

  const selected = preferred || workspaceList[0];
  return selected?.tenant?.slug || selected?.slug || null;
}

export async function resolveActiveWorkspaceSlug(): Promise<string> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;
  const preferredSlug = cookieStore.get('selected_tenant')?.value || null;

  if (!accessToken) {
    redirect('/login');
  }

  if (preferredSlug) {
    return preferredSlug;
  }

  try {
    const slug = await fetchWorkspaceSlug(accessToken, preferredSlug);
    if (slug) {
      return slug;
    }
  } catch (error) {
    if (isRedirectSignal(error)) {
      throw error;
    }
    console.error('[WorkspaceResolver] Failed to resolve active workspace', error);
  }

  redirect('/workspaces/new');
}

export async function redirectToActiveWorkspace(suffix: string) {
  const slug = await resolveActiveWorkspaceSlug();
  const normalizedSuffix = suffix.startsWith('/') ? suffix : `/${suffix}`;
  redirect(`/dashboard/${slug}${normalizedSuffix}`);
}
