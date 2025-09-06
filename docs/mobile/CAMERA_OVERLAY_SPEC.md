# Camera Overlay & Auto-Capture Scoring Spec

## Overlay Elements
- Silhouette alignment (ghost shape)
- Distance meter (green/yellow/red)
- Lighting meter (histogram-derived, target midtones)
- Marker status (ArUco/Charuco present, facing camera)
- Stability bar (frame-to-frame motion)
- Live ghost lines: base–tip, centerline preview (when confident)
- Good-shot score (0–100) and status prompts

## Scoring (0..100)
- lightingScore: 0.25
- stabilityScore: 0.25
- markerScore: 0.25
- framingScore (ROI area ratio): 0.25

### Thresholds
- Auto-capture fires when: all components OK AND score ≥ 85 for ≥ 10 consecutive frames
- Burst 5–7 frames; pick best by weighted quality

### Edge Prompts
- Move closer/farther (based on marker size vs frame diagonal)
- Rotate card to face camera
- Increase lighting / avoid backlight
- Hold steady / brace device
- Include full card in frame

### Accessibility
- Voice guidance mirroring prompts
- High-contrast mode and large text

### Telemetry (opt-in)
- Score distribution, capture success, retake reasons (no images uploaded)