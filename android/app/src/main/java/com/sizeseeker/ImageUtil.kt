package com.sizeseeker

import android.graphics.Bitmap
import android.graphics.ImageFormat
import android.graphics.PixelFormat
import androidx.camera.core.ImageProxy
import java.nio.ByteBuffer

object ImageUtil {
    fun yuv420ToBitmap(image: ImageProxy): Bitmap {
        val yPlane = image.planes[0].buffer
        val uPlane = image.planes[1].buffer
        val vPlane = image.planes[2].buffer

        val ySize = yPlane.remaining()
        val uSize = uPlane.remaining()
        val vSize = vPlane.remaining()

        val nv21 = ByteArray(ySize + uSize + vSize)
        yPlane.get(nv21, 0, ySize)

        // NV21: interleave V and U
        val uBytes = ByteArray(uSize)
        val vBytes = ByteArray(vSize)
        uPlane.get(uBytes)
        vPlane.get(vBytes)
        var pos = ySize
        var i = 0
        while (i < vBytes.size && i < uBytes.size) {
            nv21[pos++] = vBytes[i]
            nv21[pos++] = uBytes[i]
            i++
        }

        val yuvImage = android.graphics.YuvImage(nv21, ImageFormat.NV21, image.width, image.height, null)
        val out = java.io.ByteArrayOutputStream()
        yuvImage.compressToJpeg(android.graphics.Rect(0, 0, image.width, image.height), 90, out)
        val bytes = out.toByteArray()
        return android.graphics.BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
    }
}

