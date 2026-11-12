# OOPS! WORLD 🏃💨💥
### Official 2D Endless Cartoon Survival Runner for the 5key Gaming Platform

[![Platform](https://img.shields.io/badge/Platform-5key%20Gaming-FF5722?style=for-the-badge&logo=gamepad)](https://github.com)
[![Version](https://img.shields.io/badge/Release-v1.0.1-2ED573?style=for-the-badge)](https://github.com)
[![Android](https://img.shields.io/badge/Android-7.0%2B%20(API%2024%2B)-3DDC84?style=for-the-badge&logo=android)](https://github.com)
[![Assets](https://img.shields.io/badge/Assets-100%25%20Procedural-00F0FF?style=for-the-badge)](https://github.com)
[![License](https://img.shields.io/badge/License-MIT-FFA502?style=for-the-badge)](LICENSE)

**OOPS! WORLD** is an original, fast-paced 2D endless survival cartoon adventure game built exclusively for the **5key gaming platform**. Take control of **Bobo**, an expressive, bouncy cartoon creature navigating an infinitely generated procedural world crammed with unexpected traps, wacky enemies, dynamic weather disasters, and supercharged power-ups!

---

## 🌟 Highlights & Technical Innovations

- **100% Procedural Vector Rendering**: Zero downloaded spritesheets, stock graphics, external images, or pre-rendered textures. Every character, background, particle, obstacle, and animated hazard is drawn entirely through mathematical code on HTML5 Canvas.
- **Synthesized Procedural Audio Engine**: Real-time chiptune audio synthesized entirely with the native **Web Audio API**—featuring custom sound effects (jumps, double-jumps, slides, stomps, coin chimes, disaster sirens, and slide trombones) plus dynamic background music without external audio files.
- **Asymmetrical Futuristic Controls**: Custom geometric neon control panels (**SLIDE** in electric cyan and **JUMP** in neon lime green) with layered depth, tactile compression, chevron pulse halos, and multi-touch support.
- **Dual-Platform Architecture**: Run directly in any modern desktop or mobile browser, or build into a native, hardware-accelerated **Android APK** with immersive fullscreen mode and low-latency haptic vibration feedback.
- **Automated CI/CD**: Seamless GitHub Actions workflow that compiles and publishes release-ready APKs automatically.

---

## 🎮 Gameplay & Features

### 🗺️ Endless Procedural Biomes
Run across rolling hills, floating platforms, and perilous gap pits across 4 dynamically shifting environments:
1. 🌲 **Green Haven (Forest)**: Lush hills, shady pine groves, vibrant flora, and rolling terrain.
2. 🏜️ **Sunken Dunes (Desert)**: Golden dunes, ancient pyramid silhouettes, and scorching sands.
3. ❄️ **Frosty Tundra (Snow)**: Glistening snowbanks, falling flurries, and frosty ledges.
4. 🌌 **Cosmic Nebula (Mystic)**: Luminescent crystal formations and starlit nebulae.

### 🌤️ Dynamic Day/Night & Weather Cycles
- Smooth celestial transitions between midday sun, golden sunsets, and star-filled night skies.
- Dynamic weather shifts: **Clear Skies**, **Torrential Rain**, **Gentle Snow flurries**, and **Violent Storms** with screen-shaking lightning flashes.

### 👥 Unlockable Cartoon Heroes
Every hero has unique perks and expressive squash-and-stretch animations:
- **Bobo**: The beloved bouncy hero with antenna wobble and panic expressions.
- **Pip the Bunny**: Long floppy ears with extended slide duration.
- **Kato the Ninja**: Agile feline shinobi with +10% higher jump velocity.
- **Gloop the Alien**: Cosmic gelatin blob with an expanded coin magnet pull radius.
- **Robo-9**: Titanium retro droid that starts every run with a complimentary energy shield.

### ⚠️ Traps, Hazards & Stomp Mechanics
- 🪨 **Boulders & Rocks**: Static and roll-over hazards.
- 💥 **Spike Crystals**: Dangerous ground patches that must be leaped over.
- ⚠️ **Low Overhead Barriers**: Dangerous hanging beams requiring a quick duck-and-slide.
- 🪵 **Rolling Logs**: Dynamic obstacles rolling toward you with angular physics.
- 🪨 **Falling Boulders**: Heavy rocks with ground telegraph warnings before impact.
- 💣 **Bouncing Mines**: Hovering explosive mines that bob up and down.
- 🍄 **Spring Bounce Pads**: Launches Bobo sky-high for extra hangtime and coin arcs!
- 👾 **Enemy Stomping**: Drop directly onto enemy heads (Spiky Shrooms, Flutter Bats, Golems, Spike Puffers) to squash them flat, bounce upward, and earn bonus score!

### ⚡ Power-Ups & Boosters
- 🛡️ **Shield Bubble**: Absorbs an impact with an electric forcefield.
- 🧲 **Coin Magnet**: Draws nearby coins and rare gems toward Bobo.
- ⚡ **Hyper Speed**: Supercharged rocket velocity that smashes through obstacles!
- 🪙 **Double Coins (2X)**: Multiplies all coin pickups for 12 seconds.
- ❤️ **Health Heart**: Restores 1 lost heart container.
- ⏱️ **Slow Motion**: Slows game speed by 50% for tight platforming maneuvers.

### 🚨 Surprise Disasters
Survive random high-stakes events that test your reflexes:
- 🔥 **Meteor Shower**: Meteors rain from the sky, leaving blast craters.
- 🪨 **Giant Rolling Hazard**: A colossal rolling boulder charges across the screen!
- ⚡ **Sudden Storm**: Gale-force winds, downpours, and lightning strikes.
- 🌌 **Cosmic Low-Gravity Rift**: Floaty moon physics with sparkling star trails.
- 🌙 **Spooky Darkness**: A pitch-black shroud with a warm lantern spotlight on Bobo.
- 🌈 **Coin Fever**: Golden showers of coins and gems raining across the stage!

---

## 🕹️ Controls Guide

### Desktop (Keyboard)
| Action | Key Bindings |
| :--- | :--- |
| **Jump / Double-Jump** | `Space` · `Up Arrow (↑)` · `W` |
| **Slide (Duck)** | `Down Arrow (↓)` · `S` |
| **Pause / Resume** | `Escape` · `P` |

### Mobile & Touchscreens
- **Left Control Panel (Cyan)**: Hold to **SLIDE** under low obstacles.
- **Right Control Panel (Lime Green)**: Tap to **JUMP** or double-tap in mid-air to **DOUBLE-JUMP**.
- **Full Touch Support**: Tap or swipe anywhere on the left half to slide, or the right half to jump.
- **Haptic Feedback**: Native vibration impulses on hits, stomps, power-up pickups, and jumps on supported Android devices.

---

## 📁 Repository Architecture

```text
├── index.html                   # Responsive HTML5 entry point & geometric SVG controls
├── styles.css                   # Mobile-first landscape styles, animations & HUD styling
├── src/                         # Pure JavaScript Canvas Game Engine
│   ├── main.js                  # Engine bootstrap & game loop initialization
│   ├── game.js                  # Core Game controller, canvas scaling, state & events
│   ├── player.js                # Bobo character physics, squash/stretch & animations
│   ├── world.js                 # Procedural terrain generation, biomes & weather
│   ├── obstacles.js             # Traps, physics objects & collision detection
│   ├── enemies.js               # Cartoon enemy AI, flight paths & stomp squash logic
│   ├── powerups.js              # Collectibles, power-up buffs & coin arc patterns
│   ├── events.js                # Surprise disasters & dynamic weather anomalies
│   ├── audio.js                 # 100% Web Audio API procedural synthesis & music
│   ├── ui.js                    # In-game HUD, menus, shop, settings & toast alerts
│   ├── storage.js               # Persistent local progress & high score management
│   └── utils.js                 # Math, random generation & geometry utilities
├── app/                         # Native Android Application (Kotlin / Jetpack Compose)
│   ├── src/main/java/           # MainActivity, Compose screen & AndroidBridge
│   ├── src/main/assets/         # Bundled offline game engine & assets
│   ├── src/main/res/            # Android resources, adaptive icons & themes
│   └── build.gradle.kts         # App-level build configuration
├── .github/workflows/           # Automated CI/CD Pipelines
│   └── android-release.yml      # Automated GitHub Actions APK build & release
├── LICENSE                      # Official MIT License
└── README.md                    # Project documentation & 5key platform guide
```

---

## 🚀 Building & Running

### 🌐 Web (Development & Play)
Run the game using any local HTTP static server, or open `index.html` directly in your browser:
```bash
# Using python 3
python3 -m http.server 8080

# Using Node.js npx serve
npx serve .
```
Navigate to `http://localhost:8080` in your browser.

### 📱 Android Build (Gradle)
To compile the Android APK locally:
```bash
# Debug build (generates app-debug.apk)
gradle :app:assembleDebug

# Run JVM Unit & Robolectric Tests
gradle :app:testDebugUnitTest

# Production release build
gradle :app:assembleRelease
```

---

## 🤖 Automated CI/CD & Releases

The repository includes a production-ready GitHub Actions workflow (`.github/workflows/android-release.yml`):
1. **Trigger**: Automatically executes on pushes to the `main` or `master` branch, or manually via `workflow_dispatch`.
2. **Environment**: Configures JDK 21 and the Android build toolchain.
3. **Compilation**: Builds the release APK (`:app:assembleRelease`).
4. **Versioning**: Automatically calculates semantic versioning tags (e.g. `v1.0.1`).
5. **Publishing**: Attaches **ONLY** the signed `OOPS-WORLD-v1.0.1.apk` to the GitHub Release.

### 🔐 Custom Keystore Signing (Optional)
If you wish to sign release APKs with your personal upload keystore:
1. Encode your `.jks` keystore to Base64:
   ```bash
   base64 -w 0 my-upload-key.jks
   ```
2. In GitHub, go to **Settings** → **Secrets and variables** → **Actions**.
3. Add the following repository secrets:
   - `KEYSTORE_BASE64`: Base64 encoded string of your keystore file.
   - `STORE_PASSWORD`: Keystore password.
   - `KEY_PASSWORD`: Key alias password.

---

## 📄 License & Copyright

**OOPS! WORLD** is open-source software released under the [MIT License](LICENSE).

Copyright © 2026 **5key Gaming Platform**. All rights reserved.
