# CECUREUS — App Store & Google Play Compliance Guide

Documentation of mobile security, privacy, and regulatory disclosures required for Google Play Store and Apple App Store review.

---

## 1. Account Deletion Requirement (Apple Guideline 5.1.1(v) & Google Play Policy)

Both Apple and Google strictly require that any app supporting account creation MUST offer in-app account deletion.

### CECUREUS Implementation:
- **Location in App**: Profile Screen → "Delete Account & Data" (prominently accessible).
- **Confirmation**: Native modal alerting the user of permanent anonymization.
- **Backend API**: `DELETE /api/auth/account`.
- **Database Action**:
  1. Revokes all active user sessions immediately.
  2. Deactivates all push notification device tokens.
  3. Anonymizes PII (replaces name with "Deleted User", email with `NULL`, phone with `deleted_<uuid>`).
  4. Preserves referential integrity for historical audit logs without retaining personal data.

---

## 2. Emergency Crisis & Medical Disclaimer

Because CECUREUS is a mental wellness and psychological counselling platform:
- **Emergency Helpline**: Displayed prominently across the Home, Counsellor, and Profile screens (`1800 121 9497` — Available 24/7, Confidential, Free).
- **Ally AI Companion Disclaimer**: Clear in-app communication that Ally is an AI mental wellness assistant for self-reflection and coping strategies, not a replacement for emergency psychiatric intervention.

---

## 3. Google Play Data Safety Form

| Data Category | Data Collected | Purpose | Shared with 3rd Parties? | Encrypted in Transit? | Ephemeral / Deletable? |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Personal Info** | Name, Phone, Email | Account management, authentication | No (Self-hosted) | Yes (TLS 1.3) | Yes (User-deletable) |
| **Health Info** | Mood logs, Assessment scores | App functionality, user progress | No (Self-hosted) | Yes (TLS 1.3) | Yes (User-deletable) |
| **Messages** | Ally chat logs | Conversational wellness support | No (Self-hosted) | Yes (TLS 1.3) | Yes (User-deletable) |
| **Device IDs** | Push token, Device model | Push notifications, session security | No (Self-hosted) | Yes (TLS 1.3) | Yes (User-deletable) |

---

## 4. Apple Privacy Nutrition Labels

- **Data Used to Track You**: None.
- **Data Linked to You**: Contact Info (Phone, Name), Health & Fitness (Wellness entries), Identifiers (User ID).
- **Data Not Linked to You**: Diagnostic crash reports.
