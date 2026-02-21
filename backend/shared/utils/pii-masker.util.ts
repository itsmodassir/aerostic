export class PiiMasker {
  private static readonly EMAIL_REGEX =
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  private static readonly PHONE_REGEX = /(\+?\d{1,4}[-.\s]?)?(\d{10})/g;
  private static readonly SECRET_PATTERNS = [
    /sk_live_[a-zA-Z0-9]{24,}/g,
    /ask_live_[a-zA-Z0-9]{24,}/g,
    /access_token=[a-zA-Z0-9._-]+/g,
    /refresh_token=[a-zA-Z0-9._-]+/g,
    /password=[a-zA-Z0-9._-]+/g,
  ];

  /**
   * Recursively masks PII in an object or string
   */
  static mask(data: any): any {
    if (typeof data === "string") {
      return this.maskString(data);
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.mask(item));
    }

    if (data !== null && typeof data === "object") {
      const maskedObj: any = {};
      for (const [key, value] of Object.entries(data)) {
        // Skip keys that are clearly not PII or already masked
        if (typeof value === "string" || typeof value === "object") {
          maskedObj[key] = this.mask(value);
        } else {
          maskedObj[key] = value;
        }
      }
      return maskedObj;
    }

    return data;
  }

  private static maskString(str: string): string {
    let masked = str;

    // Mask Emails: u***r@example.com
    masked = masked.replace(this.EMAIL_REGEX, (email) => {
      const [user, domain] = email.split("@");
      if (user.length <= 2) return `${user[0]}***@${domain}`;
      return `${user[0]}***${user[user.length - 1]}@${domain}`;
    });

    // Mask Phones: +91*******89
    masked = masked.replace(this.PHONE_REGEX, (phone) => {
      const cleaned = phone.replace(/[-.\s]/g, "");
      if (cleaned.length < 4) return "********";
      return `${cleaned.substring(0, cleaned.length - 4)}****`;
    });

    // Mask Secrets
    for (const pattern of this.SECRET_PATTERNS) {
      masked = masked.replace(pattern, (match) => {
        const [key, val] = match.includes("=") ? match.split("=") : [match, ""];
        if (val) return `${key}=**********`;
        return `${match.substring(0, 8)}**********`;
      });
    }

    return masked;
  }
}
