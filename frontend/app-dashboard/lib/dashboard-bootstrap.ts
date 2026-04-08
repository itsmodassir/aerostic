'use client';

import api from './api';
import {
  isUuid,
  persistWorkspaceMemberships,
  resolveTenantIdFromWorkspaceSlug,
  setActiveWorkspaceContext,
} from './workspace-context';

const BOOTSTRAP_TTL_MS = 60_000;
const MEMBERSHIP_CACHE_KEY = 'dashboard_membership_cache';
const SUBSCRIPTION_CACHE_KEY = 'dashboard_subscription_cache';
const WORKSPACES_CACHE_KEY = 'dashboard_workspaces_cache';

type CachedValue<T> = {
  fetchedAt: number;
  value: T;
};

type WorkspaceMembership = {
  id?: string;
  role?: string;
  slug?: string;
  tenantId?: string;
  tenant?: {
    id?: string;
    slug?: string;
    name?: string;
    type?: string;
  };
};

let membershipPromise: Promise<any> | null = null;
let subscriptionPromise: Promise<any> | null = null;
let workspacesPromise: Promise<WorkspaceMembership[]> | null = null;

function readCache<T>(key: string): CachedValue<T> | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedValue<T>;
    if (!parsed?.fetchedAt) return null;
    if (Date.now() - parsed.fetchedAt > BOOTSTRAP_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;

  localStorage.setItem(
    key,
    JSON.stringify({
      fetchedAt: Date.now(),
      value,
    } satisfies CachedValue<T>),
  );
}

export function getCachedMembership<T = any>(): T | null {
  return readCache<T>(MEMBERSHIP_CACHE_KEY)?.value ?? null;
}

export function getCachedSubscription<T = any>(): T | null {
  return readCache<T>(SUBSCRIPTION_CACHE_KEY)?.value ?? null;
}

export function getCachedWorkspaces<T = WorkspaceMembership[]>(): T | null {
  return readCache<T>(WORKSPACES_CACHE_KEY)?.value ?? null;
}

export function primeMembershipCache(value: any) {
  writeCache(MEMBERSHIP_CACHE_KEY, value);
}

export async function loadMembership(options?: { force?: boolean }) {
  if (!options?.force) {
    const cached = getCachedMembership();
    if (cached) return cached;
  }

  if (!membershipPromise) {
    membershipPromise = api
      .get('/auth/membership')
      .then((response) => {
        writeCache(MEMBERSHIP_CACHE_KEY, response.data);
        return response.data;
      })
      .finally(() => {
        membershipPromise = null;
      });
  }

  return membershipPromise;
}

export async function loadSubscription(options?: { force?: boolean }) {
  if (!options?.force) {
    const cached = getCachedSubscription();
    if (cached) return cached;
  }

  if (!subscriptionPromise) {
    subscriptionPromise = api
      .get('/billing/subscription')
      .then((response) => {
        writeCache(SUBSCRIPTION_CACHE_KEY, response.data);
        return response.data;
      })
      .finally(() => {
        subscriptionPromise = null;
      });
  }

  return subscriptionPromise;
}

export async function loadWorkspaces(options?: { force?: boolean }) {
  if (!options?.force) {
    const cached = getCachedWorkspaces();
    if (cached) return cached;
  }

  if (!workspacesPromise) {
    workspacesPromise = api
      .get('/auth/workspaces')
      .then((response) => {
        const memberships = Array.isArray(response.data) ? response.data : [];
        persistWorkspaceMemberships(memberships);
        writeCache(WORKSPACES_CACHE_KEY, memberships);
        return memberships;
      })
      .finally(() => {
        workspacesPromise = null;
      });
  }

  return workspacesPromise;
}

export async function ensureWorkspaceContext(workspaceSlugOrId?: string | null) {
  if (!workspaceSlugOrId || typeof window === 'undefined') {
    return null;
  }

  if (isUuid(workspaceSlugOrId)) {
    setActiveWorkspaceContext({ id: workspaceSlugOrId, slug: workspaceSlugOrId });
    return workspaceSlugOrId;
  }

  const cachedTenantId = resolveTenantIdFromWorkspaceSlug(workspaceSlugOrId);
  if (cachedTenantId) {
    setActiveWorkspaceContext({ id: cachedTenantId, slug: workspaceSlugOrId });
    return cachedTenantId;
  }

  const memberships = await loadWorkspaces();
  const activeMembership = memberships.find(
    (membership) =>
      membership?.tenant?.slug === workspaceSlugOrId || membership?.tenant?.id === workspaceSlugOrId,
  );

  if (activeMembership?.tenant?.id) {
    setActiveWorkspaceContext({
      id: activeMembership.tenant.id,
      slug: activeMembership.tenant.slug || workspaceSlugOrId,
    });
    return activeMembership.tenant.id;
  }

  return null;
}
