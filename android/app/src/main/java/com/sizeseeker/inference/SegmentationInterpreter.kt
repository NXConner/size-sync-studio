package com.sizeseeker.inference

import android.content.Context
import org.tensorflow.lite.Interpreter
import org.tensorflow.lite.gpu.GpuDelegate
import java.nio.ByteBuffer
import java.nio.ByteOrder

class SegmentationInterpreter(private val context: Context) {
    private var interpreter: Interpreter? = null
    private var gpuDelegate: GpuDelegate? = null

    fun load(modelAssetName: String = "segmentation.tflite", useGpu: Boolean = true) {
        val options = Interpreter.Options()
        if (useGpu) {
            try {
                gpuDelegate = GpuDelegate()
                options.addDelegate(gpuDelegate)
            } catch (_: Throwable) {}
        }
        val afd = context.assets.openFd(modelAssetName)
        val input = afd.createInputStream()
        val bytes = input.readBytes()
        input.close()
        val bb = ByteBuffer.allocateDirect(bytes.size).order(ByteOrder.nativeOrder())
        bb.put(bytes)
        bb.rewind()
        interpreter = Interpreter(bb, options)
    }

    fun segment(rgbCHW: FloatArray, width: Int, height: Int): ByteArray {
        val tIn = arrayOf(rgbCHW)
        // Assume single channel HxW output
        val out = Array(1) { Array(1) { Array(height) { FloatArray(width) } } }
        interpreter?.run(tIn, out)
        val mask = ByteArray(width * height)
        var idx = 0
        for (y in 0 until height) {
            for (x in 0 until width) {
                val p = out[0][0][y][x]
                mask[idx++] = if (p > 0.5f) 0xFF.toByte() else 0x00.toByte()
            }
        }
        return mask
    }

    fun close() {
        try { interpreter?.close() } catch (_: Throwable) {}
        try { gpuDelegate?.close() } catch (_: Throwable) {}
        interpreter = null
        gpuDelegate = null
    }
}

