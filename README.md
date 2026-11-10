# OOPS! WORLD 🏃💨💥

**OOPS! WORLD** is a 2D endless survival cartoon adventure game built for the **5key gaming platform**. Play as **Bobo**, an adorable bouncy creature surviving in an ever-changing procedural world packed with hilarious obstacles, cartoon enemies, surprise dynamic disasters, and game-changing power-ups!

---

## 🎮 Gameplay Features

- **Endless Procedural World**: Infinite terrain generation with fair platforming, rolling hills, floating platforms, and pit gaps across 4 distinct biomes:
  - 🌲 **Green Haven (Forest)**: Rolling lush hills and pine groves.
  - 🏜️ **Sunken Dunes (Desert)**: Golden dunes, ancient pyramids, and scorched sands.
  - ❄️ **Frosty Tundra (Snow)**: Glistening snowbanks and falling flurries.
  - 🌌 **Cosmic Nebula (Mystic)**: Neon crystals and cosmic starry skies.
- **Dynamic Weather & Day/Night Cycle**: Smooth transitions between bright sunny days, golden sunsets, starlit nights, torrential downpours, and violent storms with lightning flashes.
- **Expressive Original Characters**:
  - **Bobo**: The cute bouncy hero with panic expressions and antenna bounce!
  - **Pip the Bunny**: Long floppy ears with extended slide duration.
  - **Kato the Ninja**: Agile feline shinobi with +10% higher jumps.
  - **Gloop the Alien**: Cosmic gelatin blob with an expanded magnetic field.
  - **Robo-9**: Titanium retro robot starting with a free mini-shield.
- **Traps & Hazards**:
  - 🪨 Boulders & Ground Rocks
  - 💥 Spikes & Crystal Thorns
  - ⚠️ Low Overhead Barriers *(Must slide under!)*
  - 🪵 Rolling Logs with angular physics
  - 🪨 Falling Rocks with warning ground telegraphs
  - 💣 Bouncing Spiky Mines
  - 🍄 Spring Bounce Pads *(Launches you into the stratosphere!)*
- **Original Cartoon Enemies & Stomp Mechanic**:
  - 🍄 **Spiky Shroom**: Grumpy patrol mushroom.
  - 🦇 **Flutter Bat**: Swoops down in sinusoidal flight waves.
  - 🪨 **Golem**: Armored charging brute.
  - 🎈 **Spike Puffer**: Hovering spiked balloon enemy.
  - *Mario-Style Stomping*: Fall on top of any enemy's head to squash them flat, bounce back up into the air, and score bonus points!
- **Juicy Power-ups**:
  - 🛡️ **Shield Bubble**: Absorbs hits with a glowing forcefield.
  - 🧲 **Coin Magnet**: Pulls coins and gems from afar.
  - ⚡ **Hyper Speed Boost**: Rocket speed that obliterates obstacles!
  - 🪙 **Double Coins (2X)**: Doubles all coin pickups for 12s.
  - ❤️ **Health Heart**: Restores 1 lost heart container.
  - ⏱️ **Slow Motion**: Slows down the world by 50% for tight maneuvers.
- **Dynamic Surprise Disasters**:
  - 🔥 **Meteor Shower**: Meteors crash from the heavens with fiery blast craters!
  - 🪨 **Giant Rolling Hazard**: Massive rolling boulder charges across the screen!
  - ⚡ **Sudden Violent Storm**: Gale-force winds and downpours with gem showers!
  - 🌌 **Cosmic Low Gravity Rift**: Hangtime jumps with twinkling star trails!
  - 🌙 **Spooky Darkness**: Dark shroud with a warm lantern spotlight on Bobo!
  - 🌈 **Coin Fever**: Golden showers of coins and gems raining down!
- **100% Procedural Audio**:
  - Authentic Web Audio API sound synthesis (jumps, double-jumps, slides, coin chimes, stomps, sirens, and comical slide trombones).
  - Melodic chiptune cartoon music loop generated in real-time without audio files.
- **Persistent Progression**:
  - LocalStorage saves your high scores, best distance, total coins, unlocked heroes, and themes.
  - No real-money purchases: everything is earned through gameplay!

---

## 🕹️ Controls

### Desktop
| Action | Key |
| --- | --- |
| **Jump / Double-Jump** | `Space` or `Up Arrow` (`↑`) or `W` |
| **Slide** | `Down Arrow` (`↓`) or `S` |
| **Pause / Resume** | `Escape` or `P` |

### Mobile & Touchscreens
- **Touch Buttons**: Large semi-transparent on-screen buttons:
  - ⬇️ **SLIDE** (Bottom-Left)
  - ⬆️ **JUMP** (Bottom-Right)
- **Gestures**: Tap or swipe anywhere on the left half to slide, tap right half to jump!
- **Haptic Vibration**: Native Android vibration feedback on impacts and pickups.



## 📱 Android App Compilation

This project includes an Android project that runs the game in full-screen landscape mode with hardware acceleration and native vibration support:
```bash
gradle :app:assembleDebug
```

---

## 🤖 Automated CI/CD: GitHub Actions & Releases

Whenever you push commits to the `main` branch, the `.github/workflows/android-release.yml` workflow automatically:
1. Sets up JDK 21 and the Android build environment.
2. Compiles a production-ready Android APK (`:app:assembleRelease`).
3. Resolves the semantic version tag (e.g. `v1.0.0`, `v1.0.1`, avoiding duplicates).
4. Publishes a new **GitHub Release** and attaches **ONLY** the signed `.apk` file (`OOPS-WORLD-v1.0.0.apk`) for public download.

### 🔐 Custom Signing Keystore (Optional)

The CI workflow is fully self-sufficient and works **out of the box** without setup. If you wish to sign your releases with your official Android upload key:

1. Export your `.jks` keystore to base64:
   ```bash
   base64 -w 0 my-upload-key.jks
   ```
2. In your GitHub repository, go to **Settings** → **Secrets and variables** → **Actions**.
3. Create the following repository secrets:
   - `KEYSTORE_BASE64`: Base64 encoded content of your keystore file.
   - `STORE_PASSWORD`: Password for your keystore.
   - `KEY_PASSWORD`: Password for your key alias.

