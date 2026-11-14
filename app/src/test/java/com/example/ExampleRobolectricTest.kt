package com.example

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import org.junit.Assert.assertEquals
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [36])
class ExampleRobolectricTest {

  @Test
  fun `debug build uses dev suffix, dev app name, and enables dev mode`() {
    val context = ApplicationProvider.getApplicationContext<Context>()
    val appName = context.getString(R.string.app_name)
    assertEquals(if (BuildConfig.DEBUG) "OOPS! WORLD (Dev)" else "OOPS! WORLD", appName)
    assertEquals(BuildConfig.DEBUG, BuildConfig.ENABLE_DEV_MODE)
    if (BuildConfig.DEBUG) {
      assertEquals("com.aistudio.oopsworld.jkyrqv.dev", context.packageName)
    } else {
      assertEquals("com.aistudio.oopsworld.jkyrqv", context.packageName)
    }
  }
}
