## 2024-05-22 - User Enumeration via Timing Attack
**Vulnerability:** The login function returned immediately when a user wasn't found, but performed a slow `bcrypt.hash` operation when the user existed.
**Learning:** This codebase stores per-user salts in the database, requiring an explicit `bcrypt.hash` call with the retrieved salt. This architecture makes the standard `bcrypt.compare` usage impossible and necessitates a manual dummy hash to prevent timing attacks.
**Prevention:** Always ensure that authentication paths have consistent execution time, regardless of whether the user exists or not. When using custom salt storage, explicitly handle the "user not found" case with a dummy hash operation.
