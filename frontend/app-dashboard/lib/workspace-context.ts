'use client';

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const WORKSPACE_MAP_KEY = 'workspace_slug_map';

type WorkspaceRecord = {
  id?: string | null;
  slug?: string | null;
};

export function isUuid(value?: string | null): value is string {
  return !!value && UUID_V4_REGEX.test(value);
}

export function persistWorkspaceMemberships(memberships: any[]) {
  if (typeof window === 'undefined') return;

  const nextMap: Record<string, string> = {};
  for (const membership of Array.isArray(memberships) ? memberships : []) {
    const tenantId = membership?.tenant?.id || membership?.tenantId || membership?.id;
    const tenantSlug = membership?.tenant?.slug || membership?.slug;
    if (tenantSlug && isUuid(tenantId)) {
      nextMap[tenantSlug] = tenantId;
    }
  }

  if (Object.keys(nextMap).length > 0) {
    localStorage.setItem(WORKSPACE_MAP_KEY, JSON.stringify(nextMap));
  }
}

export function getStoredWorkspaceMap(): Record<string, string> {
  if (typeof window === 'undefined') return {};

  const raw = localStorage.getItem(WORKSPACE_MAP_KEY);
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed ? parsed : {};
  } catch {
    return {};
  }
}

export function setActiveWorkspaceContext(workspace: WorkspaceRecord) {
  if (typeof window === 'undefined') return;

  const tenantId = workspace.id;
  const tenantSlug = workspace.slug;

  if (tenantSlug) {
    localStorage.setItem('selected_tenant_slug', tenantSlug);

    const currentMap = getStoredWorkspaceMap();
    if (isUuid(tenantId) && currentMap[tenantSlug] !== tenantId) {
      localStorage.setItem(
        WORKSPACE_MAP_KEY,
        JSON.stringify({ ...currentMap, [tenantSlug]: tenantId }),
      );
    }

    document.cookie = `selected_tenant=${encodeURIComponent(tenantSlug)}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;
  }

  if (isUuid(tenantId)) {
    localStorage.setItem('x-tenant-id', tenantId);
    localStorage.setItem('selected_tenant_id', tenantId);
  }
}

export function resolveTenantIdFromWorkspaceSlug(slug?: string | null): string | null {
  if (!slug) return null;
  const workspaceMap = getStoredWorkspaceMap();
  const mappedId = workspaceMap[slug];
  return isUuid(mappedId) ? mappedId : null;
}
