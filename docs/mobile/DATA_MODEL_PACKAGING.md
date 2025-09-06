# Mobile Data Contracts & Model Packaging

## Data Contracts (mobile ↔ backend)
- Lab Orders: ServiceRequest proxy (fields: userRef, panelCodes[], facility, consentAt)
- Lab Results: DiagnosticReport + Observations; transformed to local model
- Reports: Signed, time-limited links; DocumentReference when exporting FHIR
- Telehealth: Visit scheduling payload (reason, triageSummaryId), visit outcome

### Local Models (mobile)
- CaptureSession: id, timestamp, deviceProfile, quality, markerDetected
- AnalysisResult: metrics { arcLengthMm, lengthMm, maxCurvatureDeg, hingeLoc }, uncertainty?, overlaysRef
- TriageAssessment: responses, recommendedPanels[], urgencyFlags[]
- LabOrderStub: orderId, status, facility, panels[]
- LabResultStub: resultId, orderId, analytes[], interpretation, status

## Model Packaging (on-device)
- Segmentation model: INT8 quantized, slim backbone; exported as Core ML / TFLite
- Versioning: semantic model versions; compatibility matrix in remote config
- Storage: bundle initial model; support delta updates with signature verification
- Performance: use GPU/NNAPI/Core ML with low precision; ROI cropping; frame skipping

## Security
- Encrypt stored results (Keychain/Keystore-backed keys)
- Cert pinning for any network; rotating API secrets via device-bound keys
- Analytics opt-in only; never include PHI in telemetry