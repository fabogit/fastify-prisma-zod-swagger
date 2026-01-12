## 2024-01-12 - User Enumeration via Timing Attack
**Vulnerability:** The login endpoint was vulnerable to username enumeration because the server would return immediately if a user was not found, but perform a slow hashing operation if the user existed.
**Learning:** Checking for user existence before performing expensive operations (like password hashing) leaks information about which users exist in the database.
**Prevention:** Ensure that the time taken to process a login request is consistent regardless of whether the user exists. This is achieved by performing a dummy hash operation when the user is not found.
