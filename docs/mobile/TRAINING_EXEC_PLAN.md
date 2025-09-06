# Plan: Model Training Execution

## Data
- Images + binary masks; diverse skin tones, lighting, occlusions
- Train/val split with subject disjointness
- Augmentations: color jitter, noise, blur, flips, affine

## Hyperparameters
- Model: Unet (timm-efficientnet-b0) → lightweight; try FPN as alt
- Input: 512×512; batch 8 (tune per GPU)
- Optimizer: AdamW, lr 1e-3; Cosine LR
- Loss: Dice + BCE; monitor IoU
- Epochs: 20–50; early stopping on val IoU

## Compute
- Single GPU sufficient (e.g., 12–24 GB VRAM)
- Mixed precision to reduce memory

## Output
- Best checkpoint (.ckpt), ONNX export (opset 17)
- Calibration set for INT8 quantization (later step)

## Validation
- Golden-image metrics on desktop prototype vs mask-based geometry
- Fairness slices across tones/devices/lighting

## Next Steps
- Quantize and evaluate TFLite; measure latency on device matrix
- Add uncertainty head or ensemble (v2)