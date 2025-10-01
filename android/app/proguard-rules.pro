# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Uncomment this to preserve the line number information for
# debugging stack traces.
#-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile

# --- Capacitor ---
-keep class com.getcapacitor.** { *; }
-keep class * extends com.getcapacitor.Plugin { *; }
-keepclasseswithmembers class * {
    @com.getcapacitor.annotation.CapacitorPlugin *;
}

# --- TensorFlow Lite ---
-keep class org.tensorflow.** { *; }
-dontwarn org.tensorflow.**

# --- AndroidX CameraX ---
-keep class androidx.camera.** { *; }
-dontwarn androidx.camera.**

# Keep annotations to avoid stripping plugin and runtime hints
-keepattributes *Annotation*
