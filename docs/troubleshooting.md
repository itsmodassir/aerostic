# 🔧 Aerostic Troubleshooting Guide

Common solutions for issues encountered during deployment and configuration.

## 🔐 Meta OAuth Issues

### 1. "Redirect URI Mismatch" Error
**Symptom:** Error 36008 "redirect_uri is not identical..."
**Fix:**
- Ensure your Meta App > Facebook Login > Settings > Valid OAuth Redirect URIs includes: `https://app.aerostic.com/meta/callback`
- Verify `META_REDIRECT_URI` env var matches exactly.

### 2. "Application not configured for Embedded Signup"
**Symptom:** Embedded signup popup fails to load.
**Fix:**
- Your Meta App must be in **Live** mode.
- You must have "WhatsApp Embedded Signup" product added.
- The `config_id` used in frontend must match the configuration created in Meta Business Manager.

## 📡 Webhook Issues

### 1. Webhook Verification Failed
**Symptom:** Meta dashboard says verification failed.
**Fix:**
- Ensure `META_WEBHOOK_VERIFY_TOKEN` in your `.env` matches what you entered in Meta dashboard.
- Check logs: `docker logs aerostic-webhook`
- Ensure Nginx is correctly forwarding `/webhooks/meta` to the webhook service.

## 📝 Registration Issues

### 1. "Bad Request Exception" on Register
**Symptom:** 400 Error on Signup button click.
**Fix:**
- Ensure `phone` number is in international format (e.g., `+919876543210`).
- Ensure `workspace` slug is unique.
- Ensure all required fields (Name, Email, Password) are filled.

---

## 🆘 Still Stuck?
Check the `docker logs` for detailed error messages:
```bash
docker logs aerostic-backend
docker logs aerostic-frontend
```
