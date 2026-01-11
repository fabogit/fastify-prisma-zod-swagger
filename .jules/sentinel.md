## 2025-02-18 - Timing Attack in Authentication
**Vulnerability:** User enumeration via timing attack in login endpoint.
**Learning:** The application was returning early when a user was not found, while performing a slow bcrypt hash when a user was found. This allowed attackers to distinguish between valid and invalid emails based on response time.
**Prevention:** Always perform a hash operation of comparable duration even if the user is not found.
