package com.sizeseeker

import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import kotlin.math.abs
import kotlin.math.atan2
import kotlin.math.hypot

data class Metrics(
    val arcLengthPx: Double,
    val straightLengthPx: Double,
    val maxCurvatureDeg: Double,
    val hingeLocationRatio: Double,
)

object Geometry {
    fun skeletonize(mask: MaskResult): BooleanArray {
        // Simple morphological thinning by iterative erosion/dilation difference (few iterations)
        val w = mask.width
        val h = mask.height
        var img = mask.mask.copyOf()
        val skel = BooleanArray(w * h) { false }
        repeat(20) {
            val eroded = erode(img, w, h)
            val dilated = dilate(eroded, w, h)
            for (i in 0 until w*h) {
                if (img[i] && !dilated[i]) skel[i] = true
            }
            img = eroded
            if (img.none { it }) return@repeat
        }
        return skel
    }

    private fun erode(src: BooleanArray, w: Int, h: Int): BooleanArray {
        val dst = BooleanArray(w * h) { false }
        for (y in 1 until h-1) {
            for (x in 1 until w-1) {
                var ok = true
                loop@ for (dy in -1..1) for (dx in -1..1) {
                    if (!src[(y+dy)*w + (x+dx)]) { ok = false; break@loop }
                }
                dst[y*w + x] = ok
            }
        }
        return dst
    }

    private fun dilate(src: BooleanArray, w: Int, h: Int): BooleanArray {
        val dst = BooleanArray(w * h) { false }
        for (y in 1 until h-1) {
            for (x in 1 until w-1) {
                var any = false
                loop@ for (dy in -1..1) for (dx in -1..1) {
                    if (src[(y+dy)*w + (x+dx)]) { any = true; break@loop }
                }
                dst[y*w + x] = any
            }
        }
        return dst
    }

    fun extractCenterline(skel: BooleanArray, w: Int, h: Int): List<Pair<Int, Int>> {
        val points = mutableListOf<Pair<Int, Int>>()
        val visited = HashSet<Int>()
        fun neighbors(i: Int): List<Int> {
            val y = i / w
            val x = i % w
            val res = ArrayList<Int>(8)
            for (dy in -1..1) for (dx in -1..1) {
                if (dx == 0 && dy == 0) continue
                val ny = y + dy; val nx = x + dx
                if (ny in 0 until h && nx in 0 until w) {
                    val ni = ny * w + nx
                    if (skel[ni]) res.add(ni)
                }
            }
            return res
        }
        val indices = skel.withIndex().filter { it.value }.map { it.index }
        if (indices.isEmpty()) return points
        val endpoints = indices.filter { neighbors(it).size == 1 }
        val start = (endpoints.minByOrNull { it / w } ?: indices.first())
        var current = start
        var prev = -1
        while (true) {
            visited.add(current)
            val y = current / w; val x = current % w
            points.add(Pair(y, x))
            val nbrs = neighbors(current).filter { it != prev && !visited.contains(it) }
            if (nbrs.isEmpty()) break
            prev = current
            current = nbrs.minByOrNull { n -> val ny = n / w; val nx = n % w; (ny - y)*(ny - y) + (nx - x)*(nx - x) } ?: break
        }
        return points
    }

    fun computeMetrics(path: List<Pair<Int, Int>>): Metrics {
        if (path.size < 2) return Metrics(0.0, 0.0, 0.0, 0.0)
        var arc = 0.0
        for (i in 0 until path.size - 1) {
            val (y1, x1) = path[i]
            val (y2, x2) = path[i + 1]
            arc += hypot((y2 - y1).toDouble(), (x2 - x1).toDouble())
        }
        val (y0, x0) = path.first()
        val (y1, x1) = path.last()
        val straight = hypot((y1 - y0).toDouble(), (x1 - x0).toDouble())

        // Curvature angle
        val ref = Math.toDegrees(atan2((y1 - y0).toDouble(), (x1 - x0).toDouble()))
        var maxDev = 0.0
        var idx = 0
        for (i in 1 until path.size - 1) {
            val (ya, xa) = path[i - 1]
            val (yb, xb) = path[i + 1]
            val ang = Math.toDegrees(atan2((yb - ya).toDouble(), (xb - xa).toDouble()))
            val dev = kotlin.math.abs(((ang - ref + 180.0) % 360.0) - 180.0)
            if (dev > maxDev) { maxDev = dev; idx = i }
        }
        val hingeRatio = if (path.size > 1) idx.toDouble() / (path.size - 1).toDouble() else 0.0
        return Metrics(arc, straight, maxDev, hingeRatio)
    }

    fun drawCenterlineOverlay(bitmap: Bitmap, path: List<Pair<Int, Int>>): Bitmap {
        val out = bitmap.copy(Bitmap.Config.ARGB_8888, true)
        val canvas = Canvas(out)
        val paint = Paint().apply {
            color = Color.CYAN
            strokeWidth = 2f
            style = Paint.Style.STROKE
            isAntiAlias = true
        }
        for (i in 0 until path.size - 1) {
            val (y1, x1) = path[i]
            val (y2, x2) = path[i + 1]
            canvas.drawLine(x1.toFloat(), y1.toFloat(), x2.toFloat(), y2.toFloat(), paint)
        }
        return out
    }
}

