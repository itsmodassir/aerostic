/**
 * Domain validation and utility functions
 */

export const validateDomainFormat = (domain: string): boolean => {
  const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
  return domainRegex.test(domain);
};

export const sanitizeDomain = (domain: string): string => {
  return domain.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
};

export const getDomainValidationErrors = (domain: string): string[] => {
  const errors: string[] = [];
  const sanitized = sanitizeDomain(domain);
  
  if (!sanitized) {
    errors.push("Domain name is required");
    return errors;
  }
  
  if (sanitized.length < 3) {
    errors.push("Domain name must be at least 3 characters");
  }
  
  if (sanitized.length > 253) {
    errors.push("Domain name must be less than 253 characters");
  }
  
  if (!validateDomainFormat(sanitized)) {
    errors.push("Invalid domain format");
  }
  
  if (sanitized.includes(' ')) {
    errors.push("Domain name cannot contain spaces");
  }
  
  if (sanitized.startsWith('-') || sanitized.endsWith('-')) {
    errors.push("Domain name cannot start or end with hyphen");
  }
  
  if (!sanitized.includes('.')) {
    errors.push("Domain name must include a top-level domain (e.g., .com)");
  }
  
  return errors;
};

export const isSubdomain = (domain: string): boolean => {
  const parts = domain.split('.');
  return parts.length > 2;
};

export const getDomainRoot = (domain: string): string => {
  const parts = domain.split('.');
  if (parts.length <= 2) return domain;
  return parts.slice(-2).join('.');
};

export const generateSubdomain = (websiteName: string): string => {
  const sanitized = websiteName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  return `${sanitized}.yourdomain.com`;
};

export const getDNSInstructions = (domain: string, serverIP: string = "192.168.1.100") => {
  return {
    aRecord: {
      name: "@",
      type: "A",
      value: serverIP,
      ttl: "3600"
    },
    wwwRecord: {
      name: "www",
      type: "CNAME",
      value: domain,
      ttl: "3600"
    },
    txtRecord: {
      name: "@",
      type: "TXT",
      value: "", // Will be generated during verification
      ttl: "3600"
    }
  };
};

export const formatDomainStatus = (status: string): { label: string; color: string } => {
  switch (status) {
    case 'verified':
      return { label: 'Verified', color: 'green' };
    case 'pending':
      return { label: 'Pending', color: 'yellow' };
    case 'failed':
      return { label: 'Failed', color: 'red' };
    case 'expired':
      return { label: 'Expired', color: 'orange' };
    default:
      return { label: 'Unknown', color: 'gray' };
  }
};