# Plan: Android Inference Integration (TFLite/NNAPI)

## Packaging
- Convert ONNX → TFLite (float32, then INT8 with calibration)
- Place model at `app/src/main/assets/segmentation.tflite`
- Version in `BuildConfig` and remote config; support hot-swap updates

## Runtime
- Interpreter with GPU/NNAPI delegate where available; fallback to CPU
- Preprocess: YUV → RGB → resize → normalize (0..1)
- Postprocess: sigmoid → threshold → binary mask

## Performance & Memory
- Prefer 512×512; evaluate 384×384 for latency savings
- Reuse input/output tensors to avoid reallocations
- Use ROI crop when stable to reduce compute

## Quality
- Confidence: average mask probability as a crude quality proxy (v1)
- Gate auto-capture on mask area ratio and confidence

## Testing
- Golden-image set on device; assert IoU ≥ target vs desktop outputs
- Measure latency with and without delegates on device matrix