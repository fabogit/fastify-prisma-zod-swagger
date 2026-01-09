# Sentinel Journal

## 2026-01-09 - Hardcoded CORS Origin
**Vulnerability:** The application had a hardcoded `origin: "*"` in the CORS configuration, allowing any website to make requests to the API.
**Learning:** Hardcoding security configurations prevents deployment-specific hardening and exposes the application to Cross-Origin attacks in production environments.
**Prevention:** Use environment variables for security-sensitive configurations like CORS origins, and validate them using a schema (Zod in this case).
