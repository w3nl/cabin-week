// The Android / Google TV app of Cabin Week: a small app that shows the game (from the folder assets/game).
pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "CabinWeekTV"
include(":app")
