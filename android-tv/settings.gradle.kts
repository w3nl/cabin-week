// The Android / Google TV app of TripScouts (formerly Cabin Week; the internal names stay): a small app that shows the game (from the folder assets/game).
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
