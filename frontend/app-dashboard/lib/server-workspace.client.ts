import api from './api';

export async function resolveActiveWorkspaceSlug(): Promise<string> {
  const savedSlug = localStorage.getItem('selected_tenant_slug');
  if (savedSlug) return savedSlug;

  try {
    const res = await api.get('/auth/workspaces');
    const workspaces = res.data;
    const workspaceList = Array.isArray(workspaces) ? workspaces : [];
    
    if (workspaceList.length > 0) {
      const slug = workspaceList[0].tenant?.slug || workspaceList[0].slug;
      if (slug) {
        localStorage.setItem('selected_tenant_slug', slug);
        return slug;
      }
    }
  } catch (error) {
    console.error('[ClientWorkspaceResolver] Failed to resolve workspace slug', error);
  }

  throw new Error('No active workspace found');
}
