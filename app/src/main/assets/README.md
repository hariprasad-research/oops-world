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

---

## 📁 Project Structure

```
OOPS! WORLD/
├── index.html          # Web game HTML5 canvas container
├── styles.css          # Responsive fullscreen styling
├── src/
│   ├── main.js         # Game entry point and initialization
│   ├── game.js         # Core game loop, state machine & input handling
│   ├── player.js       # Bobo character physics, states & animations
│   ├── world.js        # Procedural terrain, parallax & weather engine
│   ├── obstacles.js    # Traps, rocks, spikes, logs & spring pads
│   ├── enemies.js      # Cartoon enemies & head stomp mechanics
│   ├── powerups.js     # Collectibles, coins, gems & abilities
│   ├── events.js       # Dynamic surprise disasters & warning systems
│   ├── ui.js           # Menus, HUD, shop, settings & touch controls
│   ├── audio.js        # Procedural Web Audio API sound effects & music
│   ├── storage.js      # LocalStorage save system & unlockables
│   └── utils.js        # Math helpers, camera shake & particle engine
├── app/                # Android companion application (wraps web game)
└── README.md           # Documentation
```

---


## 📱 Android App Compilation

This project also includes an Android project that runs the game in full-screen edge-to-edge mode with hardware acceleration and native vibration support:
```bash
gradle :app:assembleDebug
```

---

## 📄 License
MIT License. Created for the **5key gaming platform**.
