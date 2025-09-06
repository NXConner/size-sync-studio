iOS Setup (Capacitor)
====================

Prerequisites
-------------
- macOS with Xcode 15+
- Node 20+
- CocoaPods `sudo gem install cocoapods`

Build web assets
----------------
```bash
npm run build
```

Add iOS platform and sync
-------------------------
```bash
npm run cap:ios
```

Open Xcode
----------
```bash
npm run cap:ios:open
```

Configure signing
-----------------
- Select the app target > Signing & Capabilities
- Choose a Team and unique Bundle Identifier

Info.plist updates (if needed)
------------------------------
- Camera usage: NSCameraUsageDescription
- Microphone usage (voice feedback): NSMicrophoneUsageDescription
- Photo library (export/import): NSPhotoLibraryAddUsageDescription

App Transport Security (ATS)
----------------------------
- The app uses `https` by default. If using a dev server, add Exceptions during local testing only.

Build & run
-----------
- Build & run on device/simulator from Xcode

Push notifications (optional)
-----------------------------
- Add capability in Xcode
- Configure APNs and Capacitor Push plugin

Store assets
------------
- Add app icons and splash screens via Xcode asset catalogs

Troubleshooting
---------------
- If blank screen, ensure `dist/` is present and `webDir` is `dist` in `capacitor.config.ts`.
- Re-run `npm run cap:sync` after any plugin or config change.

