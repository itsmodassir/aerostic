import { URL } from "url";
import * as net from "net";

/**
 * Utility to prevent SSRF by validating URLs against private/internal IP ranges.
 */
export class SafeUrlUtil {
  private static readonly PRIVATE_IP_RANGES = [
    /^127\./,
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^192\.168\./,
    /^169\.254\./,
    /^fc00:/,
    /^fe80:/,
    /^::1$/,
  ];

  private static readonly RESERVED_HOSTNAMES = ["localhost", "metadata.google.internal"];

  /**
   * Validates if a URL is safe for server-side requests.
   * @param urlString The absolute URL to validate
   * @returns true if the URL is safe, false otherwise
   */
  static isSafeUrl(urlString: string): boolean {
    try {
      const url = new URL(urlString);
      
      // 1. Only allow HTTP and HTTPS
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        return false;
      }

      const hostname = url.hostname.toLowerCase();

      // 2. Block reserved hostnames
      if (this.RESERVED_HOSTNAMES.includes(hostname)) {
        return false;
      }

      // 3. Block IP literals in private ranges
      if (net.isIP(hostname)) {
        return !this.PRIVATE_IP_RANGES.some((range) => range.test(hostname));
      }

      // Note: Full protection requires DNS resolution to check the actual IP,
      // but IP literal blocking is a major first step for SSRF protection in workflows.
      return true;
    } catch (e) {
      return false;
    }
  }
}
