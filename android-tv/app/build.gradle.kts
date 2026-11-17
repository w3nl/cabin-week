plugins {
    id("com.android.application")
}

// Optioneel een vaste sleutel (repository-secret ANDROID_KEYSTORE_BASE64 + ANDROID_KEYSTORE_PASSWORD), zodat een nieuwe
// versie over de oude heen geïnstalleerd kan worden. Zonder die sleutel ondertekent GitHub met een wisselende debugsleutel:
// dan eerst de oude app verwijderen.
val keystoreFile = rootProject.file("keystore.jks")
val keystorePassword: String? = System.getenv("ANDROID_KEYSTORE_PASSWORD")
// The key alias: "cabinweek" for a new key, or set ANDROID_KEY_ALIAS to reuse a key with another alias.
val keyAliasName: String = System.getenv("ANDROID_KEY_ALIAS")?.takeIf { it.isNotBlank() } ?: "cabinweek"

android {
    namespace = "nl.w3nl.cabinweek"
    compileSdk = 36

    defaultConfig {
        applicationId = "nl.w3nl.cabinweek"
        minSdk = 24
        targetSdk = 36
        versionCode = (System.getenv("GITHUB_RUN_NUMBER") ?: "1").toInt()
        versionName = "1." + (System.getenv("GITHUB_RUN_NUMBER") ?: "0")
    }

    signingConfigs {
        if (keystoreFile.exists() && keystorePassword != null) {
            create("upload") {
                storeFile = keystoreFile
                storePassword = keystorePassword
                keyAlias = keyAliasName
                keyPassword = keystorePassword
            }
        }
    }

    buildTypes {
        getByName("debug") {
            signingConfigs.findByName("upload")?.let { signingConfig = it }
        }
        // De release-bundel (.aab) voor Google Play, ondertekend met dezelfde vaste sleutel (de uploadsleutel).
        getByName("release") {
            signingConfigs.findByName("upload")?.let { signingConfig = it }
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    implementation("androidx.webkit:webkit:1.18.0")
}
