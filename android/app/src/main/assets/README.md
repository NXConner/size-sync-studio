Android ML Assets

Place your TensorFlow Lite model file(s) in this directory so they are bundled into the Android app at build time.

Required model:
- segmentation.tflite — used for on-device segmentation during measurement

Notes:
- Keep the filename exactly as above, or update your native code to match.
- Large models increase APK size; consider quantization for mobile.
- If the model is missing, the app will skip ML inference and fall back to classical processing.

Quick setup:
mkdir -p android/app/src/main/assets
cp /absolute/path/to/segmentation.tflite android/app/src/main/assets/segmentation.tflite

