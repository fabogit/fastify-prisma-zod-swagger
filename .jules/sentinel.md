## 2025-01-20 - User Enumeration via Timing Attack
**Vulnerability:** The `findUserByEmailAndPassword` function returned early if a user was not found, skipping the expensive `bcrypt` hash operation. This created a timing discrepancy (approx. 100ms vs <10ms), allowing attackers to enumerate valid email addresses.
**Learning:** Checking "user not found" early is a common performance optimization but creates a side channel in authentication flows. `bcrypt.compare` (or `hash`) is intentionally slow.
**Prevention:** Always ensure the work done for "invalid user" is computationally equivalent to "valid user + invalid password". I added a dummy hash operation in the "not found" path using a pre-generated salt with the same cost factor.
