package com.sizeseeker

import android.content.Context
import android.graphics.Bitmap
import org.tensorflow.lite.Interpreter
import org.tensorflow.lite.gpu.GpuDelegate
import java.io.FileInputStream
import java.nio.MappedByteBuffer
import java.nio.channels.FileChannel

class SegmentationInterpreter(context: Context, private val inputSize: Int = 512) {
    private val interpreter: Interpreter
    private var gpuDelegate: GpuDelegate? = null

    init {
        val model = loadModelFile(context, "segmentation.tflite")
        val options = Interpreter.Options()
        try {
            gpuDelegate = GpuDelegate()
            options.addDelegate(gpuDelegate)
        } catch (_: Throwable) {
        }
        interpreter = Interpreter(model, options)
    }

    fun close() {
        interpreter.close()
        gpuDelegate?.close()
    }

    fun run(bitmap: Bitmap): Array<Array<Array<FloatArray>>> {
        val resized = Bitmap.createScaledBitmap(bitmap, inputSize, inputSize, true)
        val input = Array(1) { Array(inputSize) { Array(inputSize) { FloatArray(3) } } }
        for (y in 0 until inputSize) {
            for (x in 0 until inputSize) {
                val c = resized.getPixel(x, y)
                input[0][y][x][0] = ((c shr 16 and 0xFF) / 255.0f)
                input[0][y][x][1] = ((c shr 8 and 0xFF) / 255.0f)
                input[0][y][x][2] = ((c and 0xFF) / 255.0f)
            }
        }
        val output = Array(1) { Array(1) { Array(inputSize) { FloatArray(inputSize) } } }
        interpreter.run(input, output)
        return output
    }

    companion object {
        private fun loadModelFile(context: Context, assetName: String): MappedByteBuffer {
            val fileDescriptor = context.assets.openFd(assetName)
            FileInputStream(fileDescriptor.fileDescriptor).use { inputStream ->
                val channel = inputStream.channel
                return channel.map(FileChannel.MapMode.READ_ONLY, fileDescriptor.startOffset, fileDescriptor.declaredLength)
            }
        }
    }
}

