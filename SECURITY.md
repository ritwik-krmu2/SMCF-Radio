# SMCF Radio — Security Architecture & Hardening Guide

## 1. Security Architecture Overview
SMCF Radio implements a defense-in-depth security model to safeguard broadcast assets, student account credentials, moderation workflows, and station infrastructure.

---

## 2. Authentication & Session Security

### Dual-Layer Identity Validation
1. **Cloud Mode (Supabase Auth)**:
   - Utilizes cryptographically signed JSON Web Tokens (JWT) adhering to RFC 7519.
   - Passwords hashed using standard `bcrypt` with adaptive salt work factors.
   - Session tokens stored securely with short-lived access lifecycles and automatic refresh.
2. **Local Fallback Mode**:
   - Isolates session tokens in partitioned browser storage.
   - Authenticates against strict regex-validated email and student identifiers.

### Role-Based Access Control (RBAC) Matrix
| Privilege | Student | RJ Creator | Station Admin |
| :--- | :---: | :---: | :---: |
| Listen to Live Streams & Vault Episodes | ✅ | ✅ | ✅ |
| Save Bookmarks & View Listening History | ✅ | ✅ | ✅ |
| Submit Friday Song Requests & Dedications | ✅ | ✅ | ✅ |
| Post Episode Comments & Reviews | ✅ | ✅ | ✅ |
| Access RJ Creator Studio | ❌ | ✅ | ✅ |
| Upload & Edit Episode Metadata | ❌ | ✅ | ✅ |
| Access Station Admin Console | ❌ | ❌ | ✅ |
| Approve / Reject Creator Episodes | ❌ | ❌ | ✅ |
| Moderate Song Requests & Comments | ❌ | ❌ | ✅ |
| Switch User Roles & Permissions | ❌ | ❌ | ✅ |
| Publish Official Campus Bulletins | ❌ | ❌ | ✅ |
| Inspect Security & Activity Audit Logs | ❌ | ❌ | ✅ |

---

## 3. Threat Vectors & Mitigations

### 1. Cross-Site Scripting (XSS)
- **Threat**: Malicious scripts injected into student review comments, song shoutouts, or announcement bodies.
- **Mitigation**:
  - React 19's virtual DOM natively escapes all interpolated strings during rendering.
  - No `dangerouslySetInnerHTML` is used in any component across the application.
  - Strict input trimming and length bounds applied in both `StudentPortal.tsx` and `RJStudio.tsx`.

### 2. Audio Injection & SSRF
- **Threat**: Malicious actors supplying arbitrary external URLs to exploit audio rendering engines or bypass network boundaries.
- **Mitigation**:
  - Spoken audio files are served from static local assets (`/audio/*.wav`) or verified Google Drive domains.
  - The audio pipeline rejects non-audio mime-types and handles decode errors without freezing application state.

### 3. Privilege Escalation
- **Threat**: A student modifying client-side session states to access the Admin Console or RJ Studio.
- **Mitigation**:
  - Route guards verify `user.role` on every component render.
  - In cloud deployments, PostgreSQL Row Level Security (RLS) validates the user's role claim within database transactions, rejecting unauthorized updates at the database engine level.

### 4. Credential & Secret Management
- **Audit Verification**:
  - No secrets, private API keys, or live credentials exist in repository tracking.
  - `.env.example` provides sanitized placeholders.
  - Build processes strip development comments and minimize production bundles.

---

## 4. Recommended Content Security Policy (CSP)
For production deployment on web servers or cloud CDNs, apply the following HTTP headers:

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; media-src 'self' https://ice6.somafm.com https://docs.google.com https://drive.google.com; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co https://ice6.somafm.com;
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: microphone=(), camera=(), geolocation=()
```

---

## 5. Security Audit Logging
Every significant administrative event (role change, episode deletion, live broadcast override, announcement broadcast) is automatically recorded to the audit log (`databaseService.logActivity`). Audit records contain timestamps, actor usernames, and descriptive action payloads for compliance reviews.

