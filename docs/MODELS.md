# Model Placement

## Web (ONNXRuntime Web)
- Place `segmentation.onnx` in `public/models/segmentation.onnx`
- The segmentation worker loads from `/models/segmentation.onnx`

## Android (TFLite)
- Place `segmentation.tflite` in `android/app/src/main/assets/segmentation.tflite`
- The Kotlin `SegmentationInterpreter` loads this asset

## Notes
- Prefer compact models suitable for on-device inference
- Keep a versioned naming scheme and track checksums