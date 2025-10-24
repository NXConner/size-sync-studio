package com.sizeseeker

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.util.Size
import android.widget.TextView
import com.sizeseeker.app.R
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContracts
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.core.content.ContextCompat
import java.util.concurrent.Executors

/**
 * Legacy native CameraX activity retained for potential future native mode.
 * Not used as launcher when Capacitor Bridge is the entry point.
 */
class CameraActivity : ComponentActivity() {
    private lateinit var previewView: PreviewView
    private lateinit var overlayView: OverlayView
    private lateinit var scoreText: TextView
    private var segInterpreter: SegmentationInterpreter? = null
    private var segPipeline: SegmentationPipeline? = null

    private val cameraExecutor = Executors.newSingleThreadExecutor()
    private lateinit var captureController: CaptureController

    private val requestPermissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { isGranted: Boolean ->
            if (isGranted) startCamera()
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        previewView = findViewById(R.id.previewView)
        overlayView = findViewById(R.id.overlayView)
        scoreText = findViewById(R.id.scoreText)
        captureController = CaptureController(this)
        try {
            segInterpreter = SegmentationInterpreter(this)
            segPipeline = SegmentationPipeline(segInterpreter!!)
        } catch (_: Throwable) {
            // Model optional in early scaffold
        }

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
            startCamera()
        } else {
            requestPermissionLauncher.launch(Manifest.permission.CAMERA)
        }
    }

    private fun startCamera() {
        val cameraProviderFuture = ProcessCameraProvider.getInstance(this)
        cameraProviderFuture.addListener({
            val cameraProvider = cameraProviderFuture.get()
            val preview = Preview.Builder().build().also {
                it.setSurfaceProvider(previewView.surfaceProvider)
            }

            val analyzer = ImageAnalysis.Builder()
                .setTargetResolution(Size(1280, 720))
                .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                .build()

            analyzer.setAnalyzer(cameraExecutor) { imageProxy ->
                val score = AutoCaptureScorer.computeScore(imageProxy)
                runOnUiThread {
                    scoreText.text = "Score: $score"
                    overlayView.updateScore(score)
                }
                // Optional segmentation + geometry on current frame
                try {
                    val bmp = ImageUtil.yuv420ToBitmap(imageProxy)
                    segPipeline?.let { pipe ->
                        val mask = pipe.run(bmp)
                        // Very simple threshold to avoid tiny/noisy masks
                        if (mask.meanProb > 0.3f) {
                            val skel = Geometry.skeletonize(mask)
                            val path = Geometry.extractCenterline(skel, mask.width, mask.height)
                            val metrics = Geometry.computeMetrics(path)
                            // In a full impl, scale px→mm with marker px/mm
                            // Update overlay (could draw centerline)
                        }
                    }
                } catch (_: Throwable) {}

                // Auto-capture decision and burst save
                captureController.onFrame(imageProxy, score)
                imageProxy.close()
            }

            val cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA

            cameraProvider.unbindAll()
            cameraProvider.bindToLifecycle(this, cameraSelector, preview, analyzer)
        }, ContextCompat.getMainExecutor(this))
    }
}

