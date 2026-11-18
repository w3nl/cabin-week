# R8 rules for the Cabin Week app (release only).
# The app has one Activity (kept automatically via the manifest) and talks to the game only with
# WebView.evaluateJavascript, so there is no JavaScript interface to keep.
# Keep line numbers, so crash reports in Google Play point to the right line.
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
