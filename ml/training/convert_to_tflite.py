from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
from pathlib import Path


def run(cmd: list[str]) -> None:
    print("$", " ".join(cmd))
    subprocess.run(cmd, check=True)


def main() -> None:
    parser = argparse.ArgumentParser(description="Convert ONNX to TFLite via onnx2tf and TensorFlow converter")
    parser.add_argument("onnx", type=Path, help="Path to ONNX model (e.g., segmentation.onnx)")
    parser.add_argument("out_tflite", type=Path, help="Output TFLite path (e.g., segmentation.tflite)")
    parser.add_argument("--savedmodel_dir", type=Path, default=Path("build_tf"), help="Temp SavedModel output dir")
    parser.add_argument("--int8", action="store_true", help="Export INT8 quantized TFLite (requires representative dataset)")
    parser.add_argument("--rep_data", type=Path, help="Representative images directory for INT8 calibration (RGB images)")
    args = parser.parse_args()

    try:
        import tensorflow as tf  # noqa: F401
    except Exception:
        print("ERROR: TensorFlow is required. Install: pip install 'tensorflow<2.16' onnx2tf", file=sys.stderr)
        sys.exit(1)

    # Step 1: ONNX -> SavedModel via onnx2tf
    if args.savedmodel_dir.exists():
        shutil.rmtree(args.savedmodel_dir)
    run([sys.executable, "-m", "onnx2tf", "-i", str(args.onnx), "-o", str(args.savedmodel_dir)])

    # Step 2: SavedModel -> TFLite
    import tensorflow as tf  # type: ignore

    converter = tf.lite.TFLiteConverter.from_saved_model(str(args.savedmodel_dir))
    if args.int8:
        if not args.rep_data or not args.rep_data.exists():
            print("ERROR: --rep_data directory is required for --int8 calibration", file=sys.stderr)
            sys.exit(2)
        import numpy as np
        from PIL import Image

        def representative_dataset():
            images = list(args.rep_data.glob("*.jpg")) + list(args.rep_data.glob("*.png"))
            for img_path in images[:200]:
                img = Image.open(img_path).convert("RGB").resize((512, 512))
                arr = np.asarray(img).astype(np.float32) / 255.0
                arr = np.expand_dims(arr, axis=0)
                yield [arr]

        converter.optimizations = [tf.lite.Optimize.DEFAULT]
        converter.representative_dataset = representative_dataset
        converter.target_spec.supported_ops = [tf.lite.OpsSet.TFLITE_BUILTINS_INT8]
        converter.inference_input_type = tf.int8
        converter.inference_output_type = tf.int8

    tflite_model = converter.convert()
    args.out_tflite.parent.mkdir(parents=True, exist_ok=True)
    with open(args.out_tflite, "wb") as f:
        f.write(tflite_model)
    print(f"Saved TFLite model to {args.out_tflite}")


if __name__ == "__main__":
    main()

