# Size Seeker — User Manual

This manual explains how to use the Size Seeker app, including navigation, features, and best practices. The app emphasizes safety and general wellness guidance. It does not provide sexual technique, enlargement routines, or medical instructions.

## Who is this for?
- Individuals who want to track general wellness and progress metrics privately
- Users who value safety guidance and non‑graphic educational support

## Quick Start
1) Open the app in your browser.
2) From the navbar, explore: Sessions, Measure, Gallery, Tips, Safety, and Chat.
3) Data you enter is stored locally in your browser (see Privacy section).

## Navigation Overview
- Home Dashboard: Quick stats, recent sessions, and shortcuts.
- Sessions: Choose a preset routine and launch the Session Runner.
- Run Session: Time your routine, log pressure levels, mark in‑tube/ break intervals, and save.
- Measure: Use camera‑assisted tools to capture length and girth measurements.
- Gallery: View saved photos and compare progress using overlays.
- Tips: Read curated suggestions for healthier habits.
- Safety: Read critical safety guidelines and emergency steps.
- Chat: Ask general wellness questions. The assistant refuses sexual technique or enlargement requests.

## Sessions
1) Go to Sessions.
2) Use search and filters (difficulty, category) to find a preset.
3) Start Session to open the Session Runner.

### Session Runner
- Elapsed timer: visible at the top.
- Preset details: duration, target pressure, rest periods.
- Controls:
  - Start/End In‑Tube: toggles active in‑tube intervals.
  - Start/End Break: marks rest intervals.
  - Pressure slider + Log: records a timestamped pressure log.
  - Finish: saves the session to local storage.

Tips:
- If you feel discomfort, stop immediately and review Safety.
- Keep notes in the session (if available) for later review with a clinician.

## Measure
The Measure page uses your device camera and OpenCV.js to assist with measurements.

### Permissions
- Grant camera access when prompted.
- If the camera fails, try switching the facing mode or using a different device.

### Units and Calibration
1) Choose your unit: inches or centimeters.
2) Calibrate pixels‑per‑inch (PPI):
   - Manual: draw a calibration line over a known reference (e.g., a ruler). Enter its real size and confirm.
   - Auto (optional): uses OpenCV to estimate scale in an image; verify visually and adjust if needed.

### Capturing Measurements
1) Align the base and tip markers on the live view or uploaded image.
2) Optionally set girth markers for circumference estimation.
3) Enable stability and auto‑capture options to automatically take a snapshot when the measurement stabilizes.
4) Tap capture/download to save. Photos save to IndexedDB; metrics save to localStorage.

### Overlays and Comparisons
- Toggle a previous photo as an overlay to compare progress.
- Adjust overlay opacity and alignment for a consistent view.

### Voice Feedback (optional)
- Enable voice prompts in settings on the Measure page to receive auditory cues during detection/capture.

## Gallery
- Shows your stored photos tied to measurements.
- Select an item to view details and compare with overlays.
- You can delete entries you no longer need.

## Tips
- Browse non‑graphic, general guidance: sleep, stress, exercise, nutrition.
- Use this section for supportive lifestyle habits.

## Safety
- Review safety guidelines before any activity.
- Key reminders: avoid excessive force; stop at first sign of pain; watch color/temperature; rest and hydrate.
- Emergency steps: stop, remove equipment, restore circulation, monitor, seek medical help if needed.

## Chat
- The chat provides general wellness guidance.
- It will not provide sexual technique, enlargement routines, pressures, or time‑in‑tube instructions.
- You can toggle streaming to receive a short, chunked wellness message.
- Use the feedback buttons to rate responses; feedback is stored in memory on the server (not persisted).

## Privacy & Data Storage
- Measurements, sessions, goals: saved in your browser `localStorage` under `size-seeker-*` keys.
- Photos: saved in your browser’s IndexedDB under `SizeSeekerPhotos`.
- Data remains local to your device unless you export or manually share it.
- Clearing browser storage or using private modes may remove your saved data.

## Troubleshooting
- Camera not available: grant permission, close other apps using the camera, or try another device.
- OpenCV failed to load: ensure `/opencv/opencv.js` and matching `opencv_js.wasm` are served. See README OpenCV section.
- Measurements seem off: recalibrate carefully with a known reference; verify unit (in/cm).
- API errors on subreddit: upstream rate limiting or blocking; try later or configure Reddit OAuth.

## FAQs
- Can I get medical or sexual technique advice? No. The app is strictly limited to general wellness guidance.
- Where is my data stored? In your browser (localStorage and IndexedDB).
- Can I use this offline? Yes, core features work offline if the app is already loaded and OpenCV assets are available locally.

## Responsible Use
This app is for educational and tracking purposes only. It is not medical advice. Consult a licensed clinician for personalized guidance.

