package com.example

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Color
import android.os.Build
import android.os.Bundle
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import com.example.ui.theme.MyApplicationTheme

class MainActivity : ComponentActivity() {

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()

    // Lock orientation to sensor landscape for optimal widescreen gameplay
    requestedOrientation = android.content.pm.ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE

    // Keep screen on while playing the game
    window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

    // Immersive full-screen mode for endless runner gameplay
    hideSystemBars()

    setContent {
      MyApplicationTheme {
        Scaffold(
          modifier = Modifier.fillMaxSize(),
          contentWindowInsets = WindowInsets(0, 0, 0, 0)
        ) { _ ->
          GameWebViewScreen(activity = this@MainActivity)
        }
      }
    }
  }

  override fun onWindowFocusChanged(hasFocus: Boolean) {
    super.onWindowFocusChanged(hasFocus)
    if (hasFocus) {
      hideSystemBars()
    }
  }

  private fun hideSystemBars() {
    val windowInsetsController = WindowCompat.getInsetsController(window, window.decorView)
    windowInsetsController.systemBarsBehavior =
      WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
    windowInsetsController.hide(WindowInsetsCompat.Type.systemBars())
  }
}

/**
 * JavaScript interface exposed to the Web game as window.AndroidBridge
 */
class AndroidBridge(private val context: Context) {

  @JavascriptInterface
  fun vibrate(durationMs: Long) {
    try {
      val ms = durationMs.coerceIn(10L, 500L)
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        val vibratorManager =
          context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
        vibratorManager?.defaultVibrator?.vibrate(
          VibrationEffect.createOneShot(ms, VibrationEffect.DEFAULT_AMPLITUDE)
        )
      } else {
        @Suppress("DEPRECATION")
        val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
          vibrator?.vibrate(VibrationEffect.createOneShot(ms, VibrationEffect.DEFAULT_AMPLITUDE))
        } else {
          @Suppress("DEPRECATION")
          vibrator?.vibrate(ms)
        }
      }
    } catch (_: Exception) {
      // Gracefully ignore if vibrator is unavailable
    }
  }

  @JavascriptInterface
  fun lockLandscape() {
    try {
      (context as? ComponentActivity)?.runOnUiThread {
        (context as? ComponentActivity)?.requestedOrientation =
          android.content.pm.ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE
      }
    } catch (_: Exception) {}
  }

  @JavascriptInterface
  fun unlockOrientation() {
    try {
      (context as? ComponentActivity)?.runOnUiThread {
        (context as? ComponentActivity)?.requestedOrientation =
          android.content.pm.ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED
      }
    } catch (_: Exception) {}
  }

  @JavascriptInterface
  fun isAndroidApp(): Boolean = true
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun GameWebViewScreen(activity: ComponentActivity) {
  var webViewRef by remember { mutableStateOf<WebView?>(null) }

  BackHandler {
    webViewRef?.evaluateJavascript(
      "if (window.oopsGame && window.oopsGame.handleBackPress) { window.oopsGame.handleBackPress(); }",
      null
    )
  }

  DisposableEffect(Unit) {
    onDispose {
      webViewRef?.destroy()
    }
  }

  Box(
    modifier = Modifier
      .fillMaxSize()
      .testTag("game_view")
  ) {
    AndroidView(
      modifier = Modifier.fillMaxSize(),
      factory = { ctx ->
        WebView(ctx).apply {
          layoutParams = ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
          )
          setBackgroundColor(Color.BLACK)

          settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            mediaPlaybackRequiresUserGesture = false
            allowFileAccess = true
            @Suppress("DEPRECATION")
            allowFileAccessFromFileURLs = true
            @Suppress("DEPRECATION")
            allowUniversalAccessFromFileURLs = true
            useWideViewPort = true
            loadWithOverviewMode = true
            cacheMode = WebSettings.LOAD_DEFAULT
          }

          // Hardware acceleration
          setLayerType(View.LAYER_TYPE_HARDWARE, null)

          webViewClient = object : WebViewClient() {}
          webChromeClient = object : WebChromeClient() {
            override fun onConsoleMessage(consoleMessage: android.webkit.ConsoleMessage?): Boolean {
              android.util.Log.d("OopsWorldJS", "${consoleMessage?.message()} [${consoleMessage?.sourceId()}:${consoleMessage?.lineNumber()}]")
              return true
            }
          }

          addJavascriptInterface(AndroidBridge(ctx), "AndroidBridge")

          loadUrl("file:///android_asset/index.html")
          webViewRef = this
        }
      },
      update = { wv ->
        webViewRef = wv
      }
    )
  }
}
