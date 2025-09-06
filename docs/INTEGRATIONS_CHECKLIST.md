# Integrations Checklist and Effort Estimates

Scope: Production integrations needed for STD triage/testing, telehealth, identity/age verification, payments, notifications, and clinical interoperability. All vendors handling PHI must sign BAAs and support HIPAA-aligned controls.

## Legend
- Size/Effort: S (1–3 days), M (4–10 days), L (2–4 weeks), XL (1–2 months)
- Env: Sandbox first, then production with BAA

---

## 1) Labs & Diagnostics (Orders + Results)

Options
- Aggregators (recommended for v1):
  - Health Gorilla (FHIR/HL7, broad lab network)
  - 1health (lab enablement platform)
  - ixlayer (at-home kit programs)
- Direct labs (later): Quest Diagnostics, Labcorp

Requirements
- BAA signed; sandbox credentials; test patients and facilities
- Support for: ServiceRequest (orders), DiagnosticReport/Observation (results), LOINC/CPT mappings
- Webhooks/callbacks for result readiness; secure signature verification
- Patient identity verification flow before ordering
- Consent capture and storage (type, version, timestamp)
- At-home kits: shipping, returns, RMA, order tracking, invalid sample handling

Implementation Steps
1. Vendor selection, BAA, sandbox onboarding
2. Map test panels to LOINC/CPT and vendor panel codes
3. Implement order creation (FHIR ServiceRequest) and retrieve order docs (PDF if provided)
4. Set up results polling or webhook receiver with HMAC/signature validation
5. Transform results to internal model; generate plain-language interpretations
6. Handle edge cases: cancellations, recollects, indeterminate/invalid results
7. Build user flows: site selection, instructions, status tracking, results delivery

Acceptance Criteria
- Create order, receive results for CG_NAAT/HIV/Syphilis in sandbox
- Results available in-app with clear interpretations within SLA (1–3 business days)
- Robust webhook security (rotating secrets, replay protection)

Effort
- Aggregator: M–L (2–4 weeks including QA)
- Direct lab (per-lab): L–XL (4–8+ weeks)

---

## 2) Telehealth

Vendors
- Wheel, SteadyMD, OpenLoop (network + platform)

Requirements
- Provider network coverage by state; 18+ only; HIPAA compliance; BAA
- Scheduling APIs (sync/async), intake forms, secure messaging/video, document upload
- eRx support; jurisdiction-aware workflows (e.g., expedited partner therapy when lawful)
- Visit summaries and clinical documentation access

Implementation Steps
1. Vendor selection and BAA; sandbox accounts
2. Build visit scheduling and intake; pass triage context (with user consent)
3. Implement messaging/video session launch; handle time zones, cancellations
4. eRx confirmation flow; pharmacy selection if applicable
5. Store visit outcomes securely; generate user-friendly summaries

Acceptance Criteria
- Schedule, complete, and document a test video visit in sandbox
- eRx confirmation (test-only) recorded; visit summary returned and stored

Effort
- Vendor integration: M (1–2 weeks)
- Building in-house network: XL (not recommended for v1)

---

## 3) Identity & Age Verification (KYC/AML-lite)

Vendors
- Persona, Onfido, Veriff

Requirements
- 18+ verification with government ID and liveness where available
- PII minimization and secure tokenization; retention controls
- Retry flows and manual review fallback

Implementation Steps
1. Configure verification templates: document + selfie, 18+ rule
2. Implement SDK in-app; securely handle callbacks/webhooks
3. Store verification status token; do not retain raw PII images server-side

Acceptance Criteria
- Successful verification in sandbox; failure and retry paths tested

Effort
- S–M (3–5 days)

---

## 4) Payments

Vendors
- Stripe (Cards, Link, Apple/Google Pay, optional Connect for payouts)

Requirements
- HIPAA considerations (no PHI in payment metadata)
- PCI DSS SAQ A scope only (use hosted components)
- Tax and refund handling for lab orders

Implementation Steps
1. Create Products/Prices for panels and telehealth
2. Checkout Sessions with success/cancel webhooks
3. Reconcile payment status with lab orders and visit bookings

Acceptance Criteria
- Successful payment → lab order created; refunds reverse order when applicable

Effort
- S–M (3–5 days)

---

## 5) Notifications

Vendors
- APNs (iOS), FCM (Android)
- Optional relay: Firebase Cloud Messaging only; avoid third parties for PHI

Requirements
- Sensitive content hidden until unlock; notification channels/categories
- Token management and opt-in UX

Implementation Steps
1. Device token registration; environment separation (dev/prod)
2. Backend push endpoint; rate limiting; privacy-safe payloads
3. In-app routing and deep links

Acceptance Criteria
- Push received on both platforms; content redacted until app unlock

Effort
- S (2–3 days)

---

## 6) FHIR/Interoperability

Standards
- ServiceRequest (orders), DiagnosticReport + Observation (results), QuestionnaireResponse (PDQ), DocumentReference (reports)

Requirements
- OAuth2/SMART where needed; patient-authorized data sharing
- FHIR resource validation; version pinning (R4/R4B)

Implementation Steps
1. Define resource profiles and mappings from internal models
2. Implement FHIR proxy service with auth and audit logging
3. Generate shareable, time-limited links and consent tracking

Acceptance Criteria
- Valid FHIR bundles produced and accepted by vendor sandbox

Effort
- M (1–2 weeks)

---

## 7) Encrypted Backup (Optional)

Requirements
- End-to-end encryption; keys derived from device secret + user PIN
- Key rotation, recovery phrase, and remote wipe support

Implementation Steps
1. Local key management (Keychain/Keystore) and envelope encryption
2. Opaque blob storage (no server-side indexing)
3. Backup/restore flows with integrity checks

Acceptance Criteria
- Backup and restore roundtrip across fresh installs

Effort
- M–L (2–3 weeks)

---

## 8) Security & Compliance

Requirements
- BAAs with all PHI processors; access controls; least-privilege IAM
- Audit logging (privacy-preserving); incident response runbooks
- Threat modeling (STRIDE), SAST/DAST, dependency scanning; SBOM

Implementation Steps
1. Vendor BAAs; data flow diagrams; ROPA (GDPR) and DSRs
2. Secrets management and environment hardening; cert pinning
3. Pentest before production

Acceptance Criteria
- Passing pentest report; zero critical vulns; BAAs executed

Effort
- Ongoing; initial hardening M (1–2 weeks)

---

## 9) Monitoring & QA

Requirements
- Privacy-safe telemetry (opt-in); performance budgets; device matrix tests
- Synthetic and golden-image tests for ML pipeline

Implementation Steps
1. Add opt-in analytics; no PHI
2. Device farm tests (Firebase/BrowserStack); latency and memory tracking
3. Golden-image regression suite for analysis outputs

Acceptance Criteria
- CI green on device matrix; stable latency and memory; golden tests pass

Effort
- M (1–2 weeks) initial, ongoing maintenance

---

## Recommended v1 Path
- Use a lab aggregator (Health Gorilla or 1health) to reduce complexity
- Partner with a telehealth vendor (Wheel/SteadyMD) for 50-state coverage
- Persona for 18+ verification
- Stripe for payments
- Native APNs/FCM for notifications
- Minimal backend: FHIR proxy, webhook handlers, report generator