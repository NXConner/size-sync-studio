plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "app.lovable.16d96009e5184ad6887bccbb25d2315a"
    compileSdk = rootProject.ext.compileSdkVersion as Int

    defaultConfig {
        applicationId = "app.lovable.16d96009e5184ad6887bccbb25d2315a"
        minSdk = rootProject.ext.minSdkVersion as Int
        targetSdk = rootProject.ext.targetSdkVersion as Int
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    buildFeatures {
        viewBinding = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_21
        targetCompatibility = JavaVersion.VERSION_21
    }
    kotlinOptions {
        jvmTarget = "21"
    }

    androidResources {
        ignoreAssetsPattern = "!.svn:!.git:!.ds_store:!*.scc:.*:!CVS:!thumbs.db:!picasa.ini:!*~:*.gz"
    }

    packaging {
        resources {
            excludes += setOf("**/*.gz")
        }
    }
}

dependencies {
    implementation(fileTree(mapOf("dir" to "libs", "include" to listOf("*.jar"))))
    implementation("androidx.appcompat:appcompat:${rootProject.ext.get("androidxAppCompatVersion")}")
    implementation("androidx.coordinatorlayout:coordinatorlayout:${rootProject.ext.get("androidxCoordinatorLayoutVersion")}")
    implementation("androidx.core:core-splashscreen:${rootProject.ext.get("coreSplashScreenVersion")}")
    implementation(project(":capacitor-android"))
    
    testImplementation("junit:junit:${rootProject.ext.get("junitVersion")}")
    androidTestImplementation("androidx.test.ext:junit:${rootProject.ext.get("androidxJunitVersion")}")
    androidTestImplementation("androidx.test.espresso:espresso-core:${rootProject.ext.get("androidxEspressoCoreVersion")}")
}

apply(from = "capacitor.build.gradle")

try {
    val servicesJSON = file("google-services.json")
    if (servicesJSON.exists() && servicesJSON.readText().isNotEmpty()) {
        apply(plugin = "com.google.gms.google-services")
    }
} catch (e: Exception) {
    logger.info("google-services.json not found, google-services plugin not applied. Push Notifications won't work")
}

