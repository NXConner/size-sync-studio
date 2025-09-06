package com.sizeseeker

import android.content.Context
import android.os.Environment
import androidx.camera.core.ImageProxy
import java.io.File
import java.io.FileOutputStream
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class CaptureController(private val context: Context) {
    private var consecutiveOk = 0
    private val requiredConsecutive = 10
    private val threshold = 85

    fun onFrame(image: ImageProxy, score: Int): Boolean {
        val ok = score >= threshold
        consecutiveOk = if (ok) consecutiveOk + 1 else 0
        val shouldCapture = consecutiveOk >= requiredConsecutive
        if (shouldCapture) {
            consecutiveOk = 0
            saveBurst(image)
        }
        return shouldCapture
    }

    private fun saveBurst(image: ImageProxy, frames: Int = 6) {
        // Save the current frame and subsequent frames as JPEGs in app files dir
        val dir = File(context.getExternalFilesDir(Environment.DIRECTORY_PICTURES), "captures")
        dir.mkdirs()
        val ts = SimpleDateFormat("yyyyMMdd_HHmmss_SSS", Locale.US).format(Date())
        val bmp = ImageUtil.yuv420ToBitmap(image)
        val f = File(dir, "capture_${'$'}ts.jpg")
        FileOutputStream(f).use { out ->
            bmp.compress(android.graphics.Bitmap.CompressFormat.JPEG, 92, out)
        }
    }
}

