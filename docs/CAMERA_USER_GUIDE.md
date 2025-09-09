## Camera User Guide

This guide explains how to use the in-app camera, including permissions, switching cameras, zoom, torch, FPS, overlays, measurement workflow, auto-detect/capture, voice guidance, and troubleshooting.

### Quick start
- **Open Measure**: Go to `Measure` from the navbar.
- **Allow permission**: Grant camera access when prompted.
- **Frame the subject**: Ensure the target is fully visible with good lighting.
- **Use controls**: Adjust camera, zoom, torch, FPS, and overlays as needed.

### Permissions and setup
- **First run**: Your browser prompts for camera access. Choose Allow.
- **If blocked**: Open your browser's site settings for this app and enable camera.
- **Back camera**: Prefer the `environment` facing mode on phones for better quality and stability.

### Switching cameras
- **Device list**: If multiple cameras exist, choose a device (e.g., front/back lenses).
- **Facing toggle**: Switch between `user` (front) and `environment` (back). Back is recommended on mobile.
- **Missing saved device**: If a previously saved camera is unavailable, the app falls back to an available device.

### Zoom
- **Hardware zoom**: If supported by your device/browser, a zoom slider appears.
- **Adjust range**: Move the slider between shown min/max. If not supported, the zoom control is hidden.

### Torch (flash)
- **Toggle torch**: If your device/browser supports it, use the torch switch for low-light scenes.
- **Not shown?** Some devices/browsers do not expose torch control to the web.

### Frame rate (FPS)
- **Target FPS**: Set your preferred frame rate. The app requests it and falls back if unavailable.
- **Measured FPS**: The app estimates actual FPS so you can tune performance.

### Resolution
- **Select resolution**: Choose width × height. Higher resolution improves detail but may reduce FPS.
- **Fallbacks**: Browsers negotiate the closest supported resolution if your pick is not available.

### Calibration and measurement
1) **Units**: Select inches or centimeters.
2) **Calibrate PPI**:
   - Manual: Draw a line over a known reference (e.g., 1" on a ruler). Enter its real size.
   - Auto (if enabled): The app estimates scale; verify visually and adjust if needed.
3) **Length**: Mark base and tip points. The app converts pixels to your selected unit.
4) **Girth**: Use the girth tool to estimate circumference. Keep the camera perpendicular to reduce error.

Tips:
- Keep the camera steady. Use the grid overlay for alignment if needed.
- Avoid extreme angles; prefer straight-on shots to minimize perspective distortion.

### Overlays and HUD
- **Previous photo overlay**: Select a past capture, overlay it, and adjust opacity to match framing.
- **Grid**: Toggle a grid for alignment and adjust grid size.
- **HUD toggle**: Hide measurement UI for an unobstructed view when desired.

### Auto-detection and auto-capture
- **Auto-detect**: Periodic analysis assists point placement and quality feedback.
- **Stability gating**: Auto-capture can trigger only when readings are stable for a chosen duration, within length/girth tolerances.
- **Cooldowns**: Configure a cooldown (seconds) to prevent rapid successive captures.

### Voice guidance
- **Enable voice**: Get hands-free prompts for key steps.
- **Customize**: Choose voice, rate, pitch, volume, and optionally provide custom lines.

### Saving and gallery
- **Capture**: Saves measurement data and an image.
- **Gallery**: Review, filter, search, compare, and delete saved items in `Gallery`.

### Troubleshooting
- **Black screen/error**: Ensure permission is allowed and no other app is using the camera. Refresh.
- **Wrong camera**: Switch facing mode or pick a different device.
- **Torch/zoom missing**: Not all devices/browsers expose these features.
- **Low FPS**: Lower resolution or target FPS; ensure good lighting and close background apps.
- **Orientation issues**: Lock screen orientation or rotate the device to fit.

### Privacy and storage
- **Local-only by default**: Photos go to IndexedDB; measurements to localStorage.
- **Data loss**: Clearing browser storage removes data. Export periodically if needed.

### Device support notes
- **Best on modern mobile**: Chrome/Safari with rear cameras.
- **Desktop webcams**: Work for basic use but often lack torch/zoom.