package com.sizeseeker

import android.graphics.Bitmap
import kotlin.math.max
import kotlin.math.min

data class MaskResult(
    val width: Int,
    val height: Int,
    val mask: BooleanArray,
    val meanProb: Float,
)

class SegmentationPipeline(private val interpreter: SegmentationInterpreter, private val inputSize: Int = 512) {
    fun run(bitmap: Bitmap, threshold: Float = 0.5f): MaskResult {
        val out = interpreter.run(bitmap)
        // out shape: [1, 1, H, W]
        val h = out[0][0].size
        val w = out[0][0][0].size
        val mask = BooleanArray(w * h)
        var sum = 0.0f
        var idx = 0
        for (y in 0 until h) {
            val row = out[0][0][y]
            for (x in 0 until w) {
                val p = sigmoid(row[x])
                sum += p
                mask[idx++] = p >= threshold
            }
        }
        val mean = sum / (w * h).toFloat()
        return MaskResult(w, h, mask, mean)
    }

    private fun sigmoid(x: Float): Float {
        return (1.0f / (1.0f + kotlin.math.exp(-x)))
    }
}

