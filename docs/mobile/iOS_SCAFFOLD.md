# iOS V1 Scaffold (Swift, AVFoundation, Core ML)

## Targets & Dependencies
- Min iOS: 15+
- SwiftPM: OpenCV (via wrapper or XCFramework), Charts (optional), Crypto libs
- Core ML models: segmentation_v1.mlmodelc (INT8 quantized)

## Modules
- CameraController (AVFoundation): session, focus/exposure, frame callbacks
- OverlayView (UIKit/SwiftUI): silhouette, meters, markers, centerline preview
- AutoCaptureScorer: lighting, stability, marker, distance, framing → 0..100
- AnalyzerBridge: C++/Objective‑C++ wrapper around OpenCV + geometry lib
- ResultsStore: encrypted store (Keychain/Keychain-based key + FileManager)
- PDFReportGenerator: uses PDFKit to embed overlay and metrics
- TriageEngine: local rules (mirror of CLI), optional runtime config

## Data Models (Swift)
- CaptureSession, AnalysisResult (metrics, uncertainty, quality, overlaysRef)
- TriageAssessment, LabOrderStub, LabResultStub

## Flow
1) Live session starts → markers/overlay update each frame
2) Scorer threshold maintained for N frames → burst capture
3) Best frame analysis on background queue → UI updates with metrics
4) Save result; update trends; allow PDF export/share

## Notes
- Use Metal Performance Shaders for pre/post if needed
- Gate depth APIs when available; fall back gracefully
- Accessibility: VoiceOver hints for guidance banners