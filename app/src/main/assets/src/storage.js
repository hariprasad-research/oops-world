// OOPS! WORLD - Persistent Storage & Unlockables Manager
window.OopsWorld = window.OopsWorld || {};

const STORAGE_KEY = 'oops_world_save_v1';

const CHARACTERS = [
  {
    id: 'bobo',
    name: 'Bobo',
    color: '#00D2FF',
    accentColor: '#FF6B6B',
    cost: 0,
    trait: 'Balanced speed & jump',
    desc: 'The original adorable bouncy hero!'
  },
  {
    id: 'pip',
    name: 'Pip the Bunny',
    color: '#FF69B4',
    accentColor: '#FFFFFF',
    cost: 100,
    trait: '+15% Slide Duration',
    desc: 'Can slide under anything with ease.'
  },
  {
    id: 'kato',
    name: 'Kato the Ninja',
    color: '#FFA502',
    accentColor: '#2F3542',
    cost: 250,
    trait: '+10% Jump Height',
    desc: 'A nimble feline shinobi.'
  },
  {
    id: 'gloop',
    name: 'Gloop Alien',
    color: '#2ED573',
    accentColor: '#A8FF78',
    cost: 450,
    trait: '+30% Coin Magnet Radius',
    desc: 'Cosmic gelatin with natural attraction.'
  },
  {
    id: 'robo',
    name: 'Robo-9',
    color: '#70A1FF',
    accentColor: '#ECCC68',
    cost: 750,
    trait: 'Free Mini-Shield on Start',
    desc: 'Reinforced titanium plating.'
  }
];

const THEMES = [
  {
    id: 'forest',
    name: 'Green Haven',
    cost: 0,
    skyTop: '#4FACFE',
    skyBottom: '#00F2FE',
    groundColor: '#43A047',
    groundUnder: '#2E7D32',
    desc: 'Lush rolling hills and friendly pines.'
  },
  {
    id: 'desert',
    name: 'Sunken Dunes',
    cost: 150,
    skyTop: '#FF9966',
    skyBottom: '#FF5E62',
    groundColor: '#F4A261',
    groundUnder: '#E76F51',
    desc: 'Golden sands under a blazing sun.'
  },
  {
    id: 'snow',
    name: 'Frosty Tundra',
    cost: 300,
    skyTop: '#83A4D4',
    skyBottom: '#B6FBFF',
    groundColor: '#ECEFF1',
    groundUnder: '#B0BEC5',
    desc: 'Glistening snow and crisp icy air.'
  },
  {
    id: 'cosmic',
    name: 'Cosmic Nebula',
    cost: 600,
    skyTop: '#1A0826',
    skyBottom: '#4A154B',
    groundColor: '#8E44AD',
    groundUnder: '#5B2C6F',
    desc: 'Neon crystals under starlit nebulae.'
  }
];

class StorageManager {
  constructor() {
    this.memoryData = this.getDefaults();
    this.hasLocalStorage = this.checkStorage();
    this.load();
  }

  checkStorage() {
    try {
      const testKey = '__test__';
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  getDefaults() {
    return {
      highScore: 0,
      bestDistance: 0,
      totalCoins: 0,
      unlockedCharacters: ['bobo'],
      unlockedThemes: ['forest'],
      selectedCharacter: 'bobo',
      selectedTheme: 'forest',
      settings: {
        soundVolume: 0.8,
        musicVolume: 0.6,
        soundEnabled: true,
        musicEnabled: true,
        hapticsEnabled: true,
        touchControls: 'buttons'
      },
      stats: {
        totalRuns: 0,
        totalDistance: 0,
        totalCoinsEarned: 0,
        enemiesStomped: 0,
        disastersSurvived: 0
      },
      story: {
        openingCinematicWatched: false,
        part1ConclusionWatched: false,
        part2TrailerUnlocked: false,
        disasterCards: {
          geophysical: { completed: false, progress: 0, target: 250 },
          hydrological: { completed: false, progress: 0, target: 25 },
          meteorological: { completed: false, progress: 0, target: 1 },
          climatological: { completed: false, progress: 0, target: 40 },
          biological: { completed: false, progress: 0, target: 6 },
          extraterrestrial: { completed: false, progress: 0, target: 1 }
        }
      }
    };
  }

  load() {
    if (!this.hasLocalStorage) return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.memoryData = {
          ...this.getDefaults(),
          ...parsed,
          settings: { ...this.getDefaults().settings, ...(parsed.settings || {}) },
          stats: { ...this.getDefaults().stats, ...(parsed.stats || {}) },
          story: {
            ...this.getDefaults().story,
            ...(parsed.story || {}),
            disasterCards: {
              ...this.getDefaults().story.disasterCards,
              ...((parsed.story && parsed.story.disasterCards) || {})
            }
          }
        };
      }
    } catch (err) {
      console.warn('Failed to load saved state, using defaults', err);
    }
  }

  save() {
    if (!this.hasLocalStorage) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.memoryData));
    } catch (err) {
      console.warn('Failed to save to localStorage', err);
    }
  }

  get data() {
    return this.memoryData;
  }

  recordRun({ score, distance, coins, enemiesStomped, disastersSurvived }) {
    let isNewHigh = false;
    if (score > this.memoryData.highScore) {
      this.memoryData.highScore = score;
      isNewHigh = true;
    }
    if (distance > this.memoryData.bestDistance) {
      this.memoryData.bestDistance = distance;
    }

    this.memoryData.totalCoins += coins;
    this.memoryData.stats.totalRuns += 1;
    this.memoryData.stats.totalDistance += distance;
    this.memoryData.stats.totalCoinsEarned += coins;
    this.memoryData.stats.enemiesStomped += enemiesStomped || 0;
    this.memoryData.stats.disastersSurvived += disastersSurvived || 0;

    this.save();
    return { isNewHigh, highScore: this.memoryData.highScore, totalCoins: this.memoryData.totalCoins };
  }

  unlockCharacter(id) {
    const char = CHARACTERS.find((c) => c.id === id);
    if (!char) return false;
    if (this.memoryData.unlockedCharacters.includes(id)) return true;
    if (this.memoryData.totalCoins < char.cost) return false;

    this.memoryData.totalCoins -= char.cost;
    this.memoryData.unlockedCharacters.push(id);
    this.memoryData.selectedCharacter = id;
    this.save();
    return true;
  }

  selectCharacter(id) {
    if (this.memoryData.unlockedCharacters.includes(id)) {
      this.memoryData.selectedCharacter = id;
      this.save();
      return true;
    }
    return false;
  }

  unlockTheme(id) {
    const theme = THEMES.find((t) => t.id === id);
    if (!theme) return false;
    if (this.memoryData.unlockedThemes.includes(id)) return true;
    if (this.memoryData.totalCoins < theme.cost) return false;

    this.memoryData.totalCoins -= theme.cost;
    this.memoryData.unlockedThemes.push(id);
    this.memoryData.selectedTheme = id;
    this.save();
    return true;
  }

  selectTheme(id) {
    if (this.memoryData.unlockedThemes.includes(id)) {
      this.memoryData.selectedTheme = id;
      this.save();
      return true;
    }
    return false;
  }

  updateSettings(newSettings) {
    this.memoryData.settings = { ...this.memoryData.settings, ...newSettings };
    this.save();
  }

  markOpeningWatched() {
    if (!this.memoryData.story) this.memoryData.story = this.getDefaults().story;
    this.memoryData.story.openingCinematicWatched = true;
    this.save();
  }

  markPart1ConclusionWatched() {
    if (!this.memoryData.story) this.memoryData.story = this.getDefaults().story;
    this.memoryData.story.part1ConclusionWatched = true;
    this.memoryData.story.part2TrailerUnlocked = true;
    this.save();
  }

  unlockPart2Trailer() {
    if (!this.memoryData.story) this.memoryData.story = this.getDefaults().story;
    this.memoryData.story.part2TrailerUnlocked = true;
    this.save();
  }

  updateDisasterProgress(type, amount, isAbsolute = false) {
    if (!this.memoryData.story || !this.memoryData.story.disasterCards) {
      this.memoryData.story = this.getDefaults().story;
    }
    const card = this.memoryData.story.disasterCards[type];
    if (!card || card.completed) return false;

    if (isAbsolute) {
      card.progress = Math.max(card.progress, amount);
    } else {
      card.progress += amount;
    }

    if (card.progress >= card.target) {
      card.completed = true;
      card.progress = card.target;
      this.save();
      return true; // Newly completed
    }
    this.save();
    return false;
  }

  allDisastersCompleted() {
    if (!this.memoryData.story || !this.memoryData.story.disasterCards) return false;
    const cards = this.memoryData.story.disasterCards;
    return Object.values(cards).every((c) => c.completed);
  }
}

window.OopsWorld.CHARACTERS = CHARACTERS;
window.OopsWorld.THEMES = THEMES;
window.OopsWorld.StorageManager = StorageManager;
