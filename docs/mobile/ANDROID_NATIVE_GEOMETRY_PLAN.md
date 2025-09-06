# Plan: Android Native Geometry & Segmentation Integration

## Objectives
- Run on-device segmentation to obtain a binary ROI mask per frame/burst image.
- Fit a centerline and compute arc length, straight length, max curvature angle, and hinge location.
- Fuse ArUco/Charuco scale for px/mm.

## Components
- SegmentationInterpreter (TFLite) → outputs 1×H×W mask (float or uint8)
- MarkerDetector (OpenCV) → px/mm and marker health
- GeometryLib (Kotlin + OpenCV):
  - Skeletonize binary mask (morphological thinning)
  - Extract ordered centerline path (endpoint tracking)
  - Compute arc length, straight length, max curvature angle, hinge index/ratio

## Pipeline
1) Acquire frame (YUV) → convert to RGB → resize for model
2) Segmentation: run TFLite; threshold to binary mask
3) Optional: denoise + close/open morphology
4) Skeletonize and extract centerline
5) Compute metrics; map px→mm using latest px/mm (from marker)
6) Output metrics + quality flags to UI

## Performance Targets
- Per-frame segmentation ≤ 30 ms on modern mid/high-tier devices
- Post-capture (best frame) full geometry ≤ 500 ms

## Robustness
- Handle missing/low-quality masks (return quality=low; prompt retake)
- Clip tiny regions; require minimum ROI area ratio
- Protect against self-intersections in skeletonization

## Validation
- Golden-image set on device; compare metrics to desktop prototype within tolerance
- Latency and thermals across device matrix (Pixel 5/7, Galaxy S21/S23)

## Phasing
- V1: single-frame post-capture geometry; live shows guidance only
- V1.5: light live centerline preview when confidence high
- V2: depth/stereo fusion when available