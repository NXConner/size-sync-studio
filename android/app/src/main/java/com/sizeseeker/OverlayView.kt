package com.sizeseeker

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.util.AttributeSet
import android.view.View

class OverlayView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
): View(context, attrs, defStyleAttr) {

    private val paint = Paint().apply {
        color = Color.GREEN
        strokeWidth = 4f
        style = Paint.Style.STROKE
        isAntiAlias = true
    }

    private val text = Paint().apply {
        color = Color.GREEN
        textSize = 42f
        isAntiAlias = true
    }

    private var score: Int = 0

    fun updateScore(value: Int) {
        score = value
        invalidate()
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        val w = width.toFloat()
        val h = height.toFloat()
        // Silhouette alignment guide (simple rounded rect)
        canvas.drawRoundRect(w*0.2f, h*0.2f, w*0.8f, h*0.8f, 24f, 24f, paint)
        canvas.drawText("Good score: $score", 24f, h - 24f, text)
    }
}

