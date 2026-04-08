import { loadWorkspaces } from './dashboard-bootstrap';
import { setActiveWorkspaceContext } from './workspace-context';

export async function resolveActiveWorkspaceSlug(): Promise<string> {
  const savedSlug = localStorage.getItem('selected_tenant_slug');
  if (savedSlug) return savedSlug;

  try {
    const workspaces = await loadWorkspaces();
    const workspaceList = Array.isArray(workspaces) ? workspaces : [];
    
    if (workspaceList.length > 0) {
      const firstWorkspace = workspaceList[0];
      const slug = firstWorkspace.tenant?.slug || firstWorkspace.slug;
      const tenantId = firstWorkspace.tenant?.id || firstWorkspace.tenantId || firstWorkspace.id;
      if (slug) {
        setActiveWorkspaceContext({ id: tenantId, slug });
        return slug;
      }
    }
  } catch (error) {
    console.error('[ClientWorkspaceResolver] Failed to resolve workspace slug', error);
  }

  throw new Error('No active workspace found');
}
