export function resolveBaseDomain(hostname: string, configuredBaseDomain?: string | null) {
    const host = hostname.split(':')[0].toLowerCase();
    const configured = configuredBaseDomain?.trim().toLowerCase();

    if (configured && (host === configured || host.endsWith(`.${configured}`))) {
        return configured;
    }

    const parts = host.split('.');
    if (parts.length >= 2) {
        return parts.slice(-2).join('.');
    }

    return configured || 'aimstore.in';
}
