# Android Quality Gating and Auto-Capture (Design)

## Goals
- Real-time quality scoring to guide users and prevent poor captures
- Auto-capture burst when quality is stable and above threshold
- Efficient background-thread processing to preserve UI FPS

## Signals and Metrics
- Brightness (Y channel mean): favor mid-range (avoid dark/overexposed)
- Motion blur (Laplacian variance or optical flow magnitude)
- Size fraction (mask area / frame area)
- Edge proximity (mask near borders)
- Pose/tilt (Charuco/Aruco or device sensors): within tolerance
- Confidence (model output confidence / geometry elongation/solidity proxies)

Combine into qualityScore ∈ [0,1]:
- brightness 0.25, blur 0.30, size 0.20, edge 0.10, pose 0.15 (weights tunable)

## Pipeline
- CameraX Preview -> YUV to RGB buffer
- Background worker thread:
  1) Resize to model/input size
  2) Run segmentation (TFLite GPU/NNAPI where available; CPU fallback)
  3) Compute mask-derived metrics (area, borders, elongation/solidity approx)
  4) Update quality and confidence; post results to main thread
- UI thread renders overlay (axis, width samples), HUD bars, textual tips

## Auto-Capture
- Maintain sliding window (e.g., 1.5s) of length/girth/confidence
- If ranges within tolerance and qualityScore >= threshold and cooldown ok:
  - Trigger burst capture (3–6 frames) and select best by score

## Implementation Notes
- Use HandlerThread or CoroutineDispatcher for background work
- Allocate reusable buffers; avoid per-frame allocations
- Model packaging under android/app/src/main/assets/segmentation.tflite
- Expose settings for thresholds and tolerances in app UI

## Telemetry
- Optional: record anonymous aggregate quality histograms (on-device only)
- Provide a debug overlay to visualize intermediate signals