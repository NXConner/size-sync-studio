# Android V1 Scaffold (Kotlin, CameraX, TFLite/NNAPI)

## Targets & Dependencies
- Min SDK: 26; Target SDK: latest
- CameraX, TFLite (GPU/NNAPI delegate), OpenCV Android SDK

## Modules
- CameraXController: preview, frame analysis use case
- OverlayView (Compose/View): silhouette, meters, markers, centerline preview
- AutoCaptureScorer: lighting/stability/marker/distance/framing → 0..100
- AnalyzerWorker: segmentation + geometry on background dispatcher
- ResultsStore: EncryptedFile + MasterKey (Jetpack Security)
- PdfReportGenerator: Android PdfDocument
- TriageEngine: local rules (mirror of CLI)

## Flow
1) Start preview; compute guidance and score per frame
2) Threshold sustained → capture burst; run analysis on best frame
3) Persist results; update charts; enable export/share

## Notes
- Prefer NNAPI/GPU delegate for segmentation
- Power guardrails: frame skipping, ROI crop when stable
- Permissions: CAMERA, NOTIFICATIONS (optional), BIOMETRIC for app lock