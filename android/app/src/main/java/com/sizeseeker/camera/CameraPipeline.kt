package com.sizeseeker.camera

import android.content.Context
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageProxy
import com.sizeseeker.inference.QualityScorer
import com.sizeseeker.inference.QualityInputs
import com.sizeseeker.inference.SegmentationInterpreter

class CameraPipeline(context: Context) : ImageAnalysis.Analyzer {
    private val interpreter = SegmentationInterpreter(context)

    init {
        interpreter.load(useGpu = true)
    }

    override fun analyze(image: ImageProxy) {
        try {
            val width = image.width
            val height = image.height
            // TODO: Convert YUV to RGB and build CHW float array
            val chw = FloatArray(width * height * 3)
            val mask = interpreter.segment(chw, width, height)

            // TODO: compute brightness/blur/size/edge/pose from mask and frame
            val inputs = QualityInputs(
                brightness = 140.0,
                blurVar = 250.0,
                sizeFraction = 0.25,
                edgeProximity = 0.1,
                poseOk = true
            )
            val result = QualityScorer.score(inputs)
            // TODO: Post result to UI and drive auto-capture
        } catch (_: Throwable) {
        } finally {
            image.close()
        }
    }

    fun close() {
        interpreter.close()
    }
}

