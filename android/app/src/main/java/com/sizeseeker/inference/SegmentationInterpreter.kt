package com.sizeseeker.inference

import android.content.Context
import android.os.Build
import org.tensorflow.lite.Interpreter
import org.tensorflow.lite.gpu.GpuDelegate
import org.tensorflow.lite.nnapi.NnApiDelegate
import java.io.FileInputStream
import java.nio.MappedByteBuffer
import java.nio.channels.FileChannel

class SegmentationInterpreter(private val context: Context) {
    private var interpreter: Interpreter? = null
    private var gpuDelegate: GpuDelegate? = null
    private var nnApiDelegate: NnApiDelegate? = null

    fun load(modelAssetName: String = "segmentation.tflite", preferGpu: Boolean = true) {
        val options = Interpreter.Options()

        // Use a small, bounded thread pool for CPU to avoid starving CameraX
        val cpuThreads = Runtime.getRuntime().availableProcessors().coerceAtMost(4)
        options.setNumThreads(cpuThreads)

        // Try GPU first (fastest on many devices), fall back to NNAPI, then CPU
        if (preferGpu) {
            try {
                gpuDelegate = GpuDelegate()
                options.addDelegate(gpuDelegate)
            } catch (_: Throwable) {
                // ignore and try NNAPI/CPU
            }
        }

        if (gpuDelegate == null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            try {
                nnApiDelegate = NnApiDelegate()
                options.addDelegate(nnApiDelegate)
            } catch (_: Throwable) {
                // ignore and use CPU
            }
        }

        val model = loadModelFile(modelAssetName)
        interpreter = Interpreter(model, options)
    }

    private fun loadModelFile(modelAssetName: String): MappedByteBuffer {
        val afd = context.assets.openFd(modelAssetName)
        FileInputStream(afd.fileDescriptor).use { fis ->
            val channel: FileChannel = fis.channel
            return channel.map(FileChannel.MapMode.READ_ONLY, afd.startOffset, afd.length)
        }
    }

    fun segment(rgbCHW: FloatArray, width: Int, height: Int): ByteArray {
        val tIn = arrayOf(rgbCHW)
        // Assume single channel HxW output
        val out = Array(1) { Array(1) { Array(height) { FloatArray(width) } } }
        interpreter?.run(tIn, out)
        val mask = ByteArray(width * height)
        var idx = 0
        for (y in 0 until height) {
            val row = out[0][0][y]
            for (x in 0 until width) {
                val p = row[x]
                mask[idx++] = if (p > 0.5f) 0xFF.toByte() else 0x00.toByte()
            }
        }
        return mask
    }

    fun close() {
        try { interpreter?.close() } catch (_: Throwable) {}
        try { gpuDelegate?.close() } catch (_: Throwable) {}
        try { nnApiDelegate?.close() } catch (_: Throwable) {}
        interpreter = null
        gpuDelegate = null
        nnApiDelegate = null
    }
}

