package com.sizeseeker.inference

import kotlin.math.abs
import kotlin.math.min

data class QualityInputs(
    val brightness: Double,
    val blurVar: Double,
    val sizeFraction: Double,
    val edgeProximity: Double,
    val poseOk: Boolean
)

data class QualityResult(
    val score: Double,
    val brightnessScore: Double,
    val blurScore: Double,
    val sizeScore: Double,
    val edgeScore: Double,
    val poseScore: Double
)

object QualityScorer {
    fun score(inputs: QualityInputs): QualityResult {
        val brightnessScore = 1.0 - (abs(inputs.brightness - 140.0) / 140.0)
        val blurScore = min(1.0, inputs.blurVar / 200.0)
        val sizeScore = min(1.0, inputs.sizeFraction / 0.35)
        val edgeScore = 1.0 - inputs.edgeProximity
        val poseScore = if (inputs.poseOk) 1.0 else 0.0

        val wBrightness = 0.25
        val wBlur = 0.30
        val wSize = 0.20
        val wEdge = 0.10
        val wPose = 0.15

        val score = (brightnessScore * wBrightness) + (blurScore * wBlur) + (sizeScore * wSize) + (edgeScore * wEdge) + (poseScore * wPose)
        return QualityResult(score, brightnessScore, blurScore, sizeScore, edgeScore, poseScore)
    }
}

