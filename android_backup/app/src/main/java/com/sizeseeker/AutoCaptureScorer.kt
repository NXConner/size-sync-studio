package com.sizeseeker

import androidx.camera.core.ImageProxy

object AutoCaptureScorer {
    // Placeholder: compute a simple brightness-based score (0..100)
    fun computeScore(image: ImageProxy): Int {
        val plane = image.planes[0].buffer
        val remaining = plane.remaining()
        val bytes = ByteArray(remaining)
        plane.get(bytes)
        var sum = 0L
        for (b in bytes) {
            sum += (b.toInt() and 0xFF)
        }
        val mean = if (bytes.isNotEmpty()) sum.toDouble() / bytes.size else 0.0
        val score = when {
            mean < 60 -> mean / 60.0 * 50.0
            mean in 60.0..180.0 -> 50.0 + (mean - 60.0) / 120.0 * 50.0
            else -> 80.0 - (mean - 180.0) / 75.0 * 30.0
        }
        return score.coerceIn(0.0, 100.0).toInt()
    }
}

