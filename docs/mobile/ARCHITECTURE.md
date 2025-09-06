# Mobile V1 Architecture (On-Device, Privacy-First)

## Goals
- On-device inference for curvature screening with live overlays and auto-capture
- Evidence-based STD triage; lab ordering via backend proxy; telehealth partner
- Encrypted local storage; optional end-to-end encrypted backups
- Low latency (≤120 ms live), ≤2 s post-capture analysis; inclusive performance

## App Modules
- Capture & Analysis (Camera, Overlays, Auto-Capture, AnalyzerBridge)
- Results & Trends (metrics, uncertainty, charts, PDQ)
- STD Triage & Testing (questionnaire, panel recommendations, status)
- Reports (PDF), Sharing (time-limited link, FHIR export via backend)
- Settings (privacy, backups, notifications, accessibility)

## CV/ML Pipeline (on-device)
1) Preprocess: denoise, lens distortion correction
2) Scale/marker detection: ArUco/Charuco (OpenCV)
3) Segmentation: model v1 (DeepLabv3+-class, quantized)
4) Keypoints (optional v1.5): base/tip/midline
5) Geometry fit: centerline spline, arc/straight length, hinge location
6) Uncertainty: lightweight ensemble or MC dropout (v2); P0: empirical CI
7) Outputs: metrics + confidence; overlays

### Threading & Scheduling
- Live: camera → preprocess → scale detect (every N frames) → segmentation ROI → overlay render
- Auto-capture scorer aggregates lighting/stability/marker/distance/framing
- Post-capture: full geometry/metrics on worker queue (background thread)

### Performance Budgets
- Live overlay: ≤120 ms/frame on iPhone 12+/modern Android
- Post-capture: ≤2 s end-to-end
- Memory: ≤250 MB peak; ROI cropping when stable

### Security & Privacy
- Local-only by default; encrypted at rest (Keychain/Keystore)
- Optional end-to-end encrypted backup; no third-party analytics for PHI
- Strict age gating (18+), consent tracking, data minimization

### Data Flow (mobile ↔ backend)
- Mobile handles capture/analysis/trends
- Backend provides lab/telehealth/FHIR proxy and report link generation
- All PHI encrypted in transit; minimal metadata retained server-side

### Observability
- Opt-in, privacy-safe telemetry (latency, crash traces only)
- Golden-image regression tests packaged with app for pipeline sanity