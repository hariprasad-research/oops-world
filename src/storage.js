// OOPS! WORLD - Persistent Storage, Chapter Progression & Upgrades Manager
window.OopsWorld = window.OopsWorld || {};

const STORAGE_KEY = 'oops_world_save_v1';

const CHARACTERS = [
  {
    id: 'bobo',
    name: 'Bobo',
    color: '#00D2FF',
    accentColor: '#FF6B6B',
    cost: 0,
    unlockChapter: 'geophysical',
    unlockWorldNum: 1,
    rescueChapter: null,
    storyUnlock: true,
    trait: 'Balanced speed & jump',
    desc: 'World 1 Hero: Available from the beginning!'
  },
  {
    id: 'pip',
    name: 'Pip the Bunny',
    color: '#FF69B4',
    accentColor: '#FFFFFF',
    cost: 0,
    unlockChapter: 'hydrological',
    unlockWorldNum: 2,
    rescueChapter: 'geophysical',
    rescueChapterNum: 1,
    storyUnlock: true,
    trait: '+30% Slide Duration',
    desc: 'World 2 Hero: Unlocks when World 2 becomes available.'
  },
  {
    id: 'kato',
    name: 'Kato the Ninja',
    color: '#FFA502',
    accentColor: '#2F3542',
    cost: 0,
    unlockChapter: 'meteorological',
    unlockWorldNum: 3,
    rescueChapter: 'hydrological',
    rescueChapterNum: 2,
    storyUnlock: true,
    trait: '+10% Jump Height',
    desc: 'World 3 Hero: Unlocks when World 3 becomes available.'
  },
  {
    id: 'gloop',
    name: 'Gloop Alien',
    color: '#2ED573',
    accentColor: '#A8FF78',
    cost: 0,
    unlockChapter: 'climatological',
    unlockWorldNum: 4,
    rescueChapter: 'meteorological',
    rescueChapterNum: 3,
    storyUnlock: true,
    trait: '+35% Coin Magnet Radius',
    desc: 'World 4 Hero: Unlocks when World 4 becomes available.'
  },
  {
    id: 'robo',
    name: 'Robo-9',
    color: '#70A1FF',
    accentColor: '#ECCC68',
    cost: 0,
    unlockChapter: 'biological',
    unlockWorldNum: 5,
    rescueChapter: 'climatological',
    rescueChapterNum: 4,
    storyUnlock: true,
    trait: 'Starts with Mini-Shield',
    desc: 'World 5 Hero: Unlocks when World 5 becomes available.'
  },
  {
    id: 'starlight',
    name: 'Starlight Hero',
    color: '#A55EEA',
    accentColor: '#FFEAA7',
    cost: 0,
    unlockChapter: 'extraterrestrial',
    unlockWorldNum: 6,
    rescueChapter: 'biological',
    rescueChapterNum: 5,
    storyUnlock: true,
    trait: '+25% Power-Up Duration',
    desc: 'World 6 Hero: Unlocks when World 6 becomes available.'
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
    cost: 0,
    skyTop: '#FF9966',
    skyBottom: '#FF5E62',
    groundColor: '#F4A261',
    groundUnder: '#E76F51',
    desc: 'Golden sands under a blazing sun.'
  },
  {
    id: 'snow',
    name: 'Frosty Tundra',
    cost: 0,
    skyTop: '#83A4D4',
    skyBottom: '#B6FBFF',
    groundColor: '#ECEFF1',
    groundUnder: '#B0BEC5',
    desc: 'Glistening snow and crisp icy air.'
  },
  {
    id: 'cosmic',
    name: 'Cosmic Nebula',
    cost: 0,
    skyTop: '#1A0826',
    skyBottom: '#4A154B',
    groundColor: '#8E44AD',
    groundUnder: '#5B2C6F',
    desc: 'Neon crystals under starlit nebulae.'
  }
];

const POWERUP_UPGRADES = [
  {
    id: 'shield',
    name: 'Energy Shield',
    icon: '🛡️',
    color: '#00F0FF',
    baseDuration: 8.0,
    perLevel: 2.5,
    maxLevel: 4,
    costs: [80, 150, 260, 400],
    desc: 'Extends timed shield barrier & guard aura'
  },
  {
    id: 'magnet',
    name: 'Coin Magnet',
    icon: '🧲',
    color: '#FFD700',
    baseDuration: 11.0,
    perLevel: 2.5,
    maxLevel: 4,
    costs: [75, 140, 240, 380],
    desc: 'Longer coin pull duration & wider range'
  },
  {
    id: 'speed',
    name: 'Hyper Speed',
    icon: '⚡',
    color: '#FF4757',
    baseDuration: 6.5,
    perLevel: 1.5,
    maxLevel: 4,
    costs: [90, 170, 280, 420],
    desc: 'Smashes obstacles & boosts speed longer'
  },
  {
    id: 'double_coins',
    name: '2X Coins',
    icon: '🪙',
    color: '#FFA502',
    baseDuration: 12.0,
    perLevel: 3.0,
    maxLevel: 4,
    costs: [100, 180, 300, 450],
    desc: 'Doubles collected coin value longer'
  },
  {
    id: 'slow_mo',
    name: 'Time Slow',
    icon: '⏱️',
    color: '#70A1FF',
    baseDuration: 7.0,
    perLevel: 1.8,
    maxLevel: 4,
    costs: [85, 160, 260, 390],
    desc: 'Slows hazards for precision dodging'
  }
];

const CHAPTER_ORDER = [
  'geophysical',
  'hydrological',
  'meteorological',
  'climatological',
  'biological',
  'extraterrestrial'
];

const CHAPTER_TARGETS = {
  geophysical: { distance: 350, rewardCoins: 150, friendId: 'pip' },
  hydrological: { distance: 420, rewardCoins: 200, friendId: 'kato' },
  meteorological: { distance: 480, rewardCoins: 250, friendId: 'gloop' },
  climatological: { distance: 550, rewardCoins: 350, friendId: 'robo' },
  biological: { distance: 600, rewardCoins: 450, friendId: null },
  extraterrestrial: { distance: 700, rewardCoins: 600, friendId: null }
};

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
      saveVersion: 3,
      highScore: 0,
      bestDistance: 0,
      totalCoins: 0,
      unlockedCharacters: ['bobo'],
      unlockedThemes: THEMES.map((t) => t.id),
      selectedCharacter: 'bobo',
      selectedTheme: 'forest',
      powerupUpgrades: {
        shield: 0,
        magnet: 0,
        speed: 0,
        double_coins: 0,
        slow_mo: 0
      },
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
        unlockedChapters: ['geophysical'],
        completedChapters: [],
        rescuedFriends: [],
        lastChapterId: 'geophysical',
        disasterCards: {
          geophysical: { completed: false, progress: 0, target: 350 },
          hydrological: { completed: false, progress: 0, target: 420 },
          meteorological: { completed: false, progress: 0, target: 480 },
          climatological: { completed: false, progress: 0, target: 550 },
          biological: { completed: false, progress: 0, target: 600 },
          extraterrestrial: { completed: false, progress: 0, target: 700 }
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
        const defs = this.getDefaults();
        const parsedStory = parsed.story || {};
        const parsedCards = parsedStory.disasterCards || {};

        const mergedCards = {};
        CHAPTER_ORDER.forEach((id) => {
          const defCard = defs.story.disasterCards[id];
          const oldCard = parsedCards[id] || {};
          const wasCompleted = Boolean(oldCard.completed);
          // Safe target normalization if upgrading from v1 targets
          let progress = Number(oldCard.progress) || 0;
          if (!parsed.saveVersion || parsed.saveVersion < 2) {
            if (wasCompleted) {
              progress = defCard.target;
            } else if (id === 'hydrological' || id === 'meteorological' || id === 'climatological') {
              progress = 0; // v1 used non-distance counters for these
            }
          }
          mergedCards[id] = {
            completed: wasCompleted,
            progress: Math.min(defCard.target, progress),
            target: defCard.target
          };
        });

        const prevSaveVersion = Number(parsed.saveVersion) || 1;
        const rawUnlockedChars = Array.isArray(parsed.unlockedCharacters) ? parsed.unlockedCharacters : ['bobo'];

        this.memoryData = {
          ...defs,
          ...parsed,
          saveVersion: 3,
          unlockedCharacters: prevSaveVersion >= 3 ? [...new Set(['bobo', ...rawUnlockedChars])] : ['bobo'],
          unlockedThemes: THEMES.map((t) => t.id),
          powerupUpgrades: { ...defs.powerupUpgrades, ...(parsed.powerupUpgrades || {}) },
          settings: { ...defs.settings, ...(parsed.settings || {}) },
          stats: { ...defs.stats, ...(parsed.stats || {}) },
          story: {
            ...defs.story,
            ...parsedStory,
            unlockedChapters: Array.isArray(parsedStory.unlockedChapters) && parsedStory.unlockedChapters.length > 0
              ? [...new Set(['geophysical', ...parsedStory.unlockedChapters])]
              : ['geophysical'],
            completedChapters: Array.isArray(parsedStory.completedChapters) ? [...new Set(parsedStory.completedChapters)] : [],
            rescuedFriends: Array.isArray(parsedStory.rescuedFriends) ? [...new Set(parsedStory.rescuedFriends)] : [],
            disasterCards: mergedCards
          }
        };

        this.migrateProgressionConsistency(prevSaveVersion < 3);
      }
    } catch (err) {
      console.warn('Failed to load saved state, using defaults', err);
    }
  }

  migrateProgressionConsistency(recomputeFromWorlds = false) {
    const story = this.memoryData.story;
    // Sync completed chapters, sequential unlocks, and rescued friends cleanly
    for (let i = 0; i < CHAPTER_ORDER.length; i++) {
      const chId = CHAPTER_ORDER[i];
      const card = story.disasterCards[chId];
      const isDone = (card && card.completed) || story.completedChapters.includes(chId);
      if (isDone) {
        if (card) {
          card.completed = true;
          card.progress = card.target;
        }
        if (!story.completedChapters.includes(chId)) story.completedChapters.push(chId);
        if (!story.unlockedChapters.includes(chId)) story.unlockedChapters.push(chId);
        const nextId = CHAPTER_ORDER[i + 1];
        if (nextId && !story.unlockedChapters.includes(nextId)) {
          story.unlockedChapters.push(nextId);
        }
        const friendId = CHAPTER_TARGETS[chId]?.friendId;
        if (friendId && !story.rescuedFriends.includes(friendId)) {
          story.rescuedFriends.push(friendId);
        }
      }
    }

    if (recomputeFromWorlds) {
      this.memoryData.unlockedCharacters = ['bobo'];
    }
    this.syncHeroUnlocksWithWorlds();

    if (!this.isCharacterUnlocked(this.memoryData.selectedCharacter)) {
      this.memoryData.selectedCharacter = 'bobo';
    }

    if (!CHAPTER_ORDER.includes(story.lastChapterId) || !story.unlockedChapters.includes(story.lastChapterId)) {
      story.lastChapterId = this.getHighestPlayableChapter();
    }
  }

  syncHeroUnlocksWithWorlds() {
    if (!Array.isArray(this.memoryData.unlockedCharacters)) {
      this.memoryData.unlockedCharacters = ['bobo'];
    }
    CHARACTERS.forEach((char) => {
      if (this.isChapterUnlocked(char.unlockChapter) && !this.memoryData.unlockedCharacters.includes(char.id)) {
        this.memoryData.unlockedCharacters.push(char.id);
      }
    });
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

  hasSavedProgress() {
    const d = this.memoryData;
    return (
      d.stats.totalRuns > 0 ||
      d.bestDistance > 0 ||
      d.totalCoins > 0 ||
      d.story.completedChapters.length > 0 ||
      d.story.rescuedFriends.length > 0 ||
      d.story.unlockedChapters.length > 1
    );
  }

  getHighestPlayableChapter() {
    const playable = ['geophysical', 'hydrological', 'meteorological', 'climatological'];
    const unlocked = this.memoryData.story.unlockedChapters || ['geophysical'];
    for (let i = playable.length - 1; i >= 0; i--) {
      if (unlocked.includes(playable[i]) && !this.isChapterCompleted(playable[i])) {
        return playable[i];
      }
    }
    for (let i = playable.length - 1; i >= 0; i--) {
      if (unlocked.includes(playable[i])) {
        return playable[i];
      }
    }
    return 'geophysical';
  }

  setLastChapter(chapterId) {
    if (CHAPTER_ORDER.includes(chapterId)) {
      this.memoryData.story.lastChapterId = chapterId;
      this.save();
    }
  }

  isChapterUnlocked(chapterId) {
    if (chapterId === 'geophysical') return true;
    return (this.memoryData.story?.unlockedChapters || []).includes(chapterId);
  }

  isChapterCompleted(chapterId) {
    const story = this.memoryData.story || {};
    return (
      (story.completedChapters || []).includes(chapterId) ||
      Boolean(story.disasterCards?.[chapterId]?.completed)
    );
  }

  isCharacterUnlocked(charId) {
    const char = CHARACTERS.find((c) => c.id === charId);
    if (!char) return false;
    if (char.id === 'bobo' || char.unlockChapter === 'geophysical') return true;
    if (this.isChapterUnlocked(char.unlockChapter)) return true;
    return (this.memoryData.unlockedCharacters || []).includes(charId);
  }

  isFriendRescued(charId) {
    if (charId === 'bobo') return true;
    return (this.memoryData.story?.rescuedFriends || []).includes(charId);
  }

  rescueFriend(charId) {
    if (!charId) return false;
    if (!this.memoryData.story.rescuedFriends.includes(charId)) {
      this.memoryData.story.rescuedFriends.push(charId);
    }
    this.syncHeroUnlocksWithWorlds();
    this.save();
    return true;
  }

  recordRun({ score, distance, coins, enemiesStomped, disastersSurvived, chapterId }) {
    let isNewHigh = false;
    if (score > this.memoryData.highScore) {
      this.memoryData.highScore = score;
      isNewHigh = true;
    }
    if (distance > this.memoryData.bestDistance) {
      this.memoryData.bestDistance = Math.floor(distance);
    }

    this.memoryData.totalCoins += coins;
    this.memoryData.stats.totalRuns += 1;
    this.memoryData.stats.totalDistance += Math.floor(distance);
    this.memoryData.stats.totalCoinsEarned += coins;
    this.memoryData.stats.enemiesStomped += enemiesStomped || 0;
    this.memoryData.stats.disastersSurvived += disastersSurvived || 0;

    if (chapterId) {
      this.updateChapterDistanceProgress(chapterId, Math.floor(distance));
      this.memoryData.story.lastChapterId = chapterId;
    }

    this.save();
    return { isNewHigh, highScore: this.memoryData.highScore, totalCoins: this.memoryData.totalCoins };
  }

  updateChapterDistanceProgress(chapterId, distanceMeters) {
    const story = this.memoryData.story;
    const card = story.disasterCards[chapterId];
    if (!card) return;
    if (!card.completed) {
      card.progress = Math.min(card.target, Math.max(card.progress, Math.floor(distanceMeters)));
    }
    this.save();
  }

  completeChapter(chapterId) {
    const story = this.memoryData.story;
    const meta = CHAPTER_TARGETS[chapterId];
    if (!meta) return { firstCompletion: false, coinsAwarded: 0, rescuedFriendId: null, unlockedChapterId: null };

    const firstCompletion = !this.isChapterCompleted(chapterId);
    const card = story.disasterCards[chapterId];
    if (card) {
      card.completed = true;
      card.progress = card.target;
    }
    if (!story.completedChapters.includes(chapterId)) {
      story.completedChapters.push(chapterId);
    }
    if (!story.unlockedChapters.includes(chapterId)) {
      story.unlockedChapters.push(chapterId);
    }

    // Award rescue & coin rewards
    let coinsAwarded = firstCompletion ? meta.rewardCoins : 40;
    this.memoryData.totalCoins += coinsAwarded;
    this.memoryData.stats.totalCoinsEarned += coinsAwarded;

    let rescuedFriendId = null;
    if (meta.friendId) {
      rescuedFriendId = meta.friendId;
      this.rescueFriend(meta.friendId);
    }

    // Unlock next sequential chapter card & corresponding world hero
    const idx = CHAPTER_ORDER.indexOf(chapterId);
    let unlockedChapterId = null;
    if (idx >= 0 && idx + 1 < CHAPTER_ORDER.length) {
      unlockedChapterId = CHAPTER_ORDER[idx + 1];
      if (!story.unlockedChapters.includes(unlockedChapterId)) {
        story.unlockedChapters.push(unlockedChapterId);
      }
      if (idx + 1 <= 3) {
        story.lastChapterId = unlockedChapterId;
      }
    }

    this.syncHeroUnlocksWithWorlds();
    this.save();
    return { firstCompletion, coinsAwarded, rescuedFriendId, unlockedChapterId };
  }

  getPowerupLevel(id) {
    return this.memoryData.powerupUpgrades?.[id] || 0;
  }

  getPowerupUpgradeCost(id) {
    const def = POWERUP_UPGRADES.find((p) => p.id === id);
    if (!def) return null;
    const lvl = this.getPowerupLevel(id);
    if (lvl >= def.maxLevel) return null;
    return def.costs[lvl];
  }

  getPowerupDuration(id) {
    const def = POWERUP_UPGRADES.find((p) => p.id === id);
    if (!def) return 10;
    const lvl = this.getPowerupLevel(id);
    return def.baseDuration + lvl * def.perLevel;
  }

  upgradePowerup(id) {
    const def = POWERUP_UPGRADES.find((p) => p.id === id);
    if (!def) return { success: false, reason: 'invalid' };
    const lvl = this.getPowerupLevel(id);
    if (lvl >= def.maxLevel) return { success: false, reason: 'maxed' };
    const cost = def.costs[lvl];
    if (this.memoryData.totalCoins < cost) return { success: false, reason: 'coins' };

    this.memoryData.totalCoins -= cost;
    this.memoryData.powerupUpgrades[id] = lvl + 1;
    this.save();
    return { success: true, newLevel: lvl + 1, newDuration: this.getPowerupDuration(id) };
  }

  unlockCharacter(id) {
    if (!this.isCharacterUnlocked(id)) return false;
    if (!this.memoryData.unlockedCharacters.includes(id)) {
      this.memoryData.unlockedCharacters.push(id);
    }
    this.save();
    return true;
  }

  selectCharacter(id) {
    const char = CHARACTERS.find((c) => c.id === id);
    if (!char || !this.isCharacterUnlocked(id)) return false;
    if (!this.memoryData.unlockedCharacters.includes(id)) {
      this.memoryData.unlockedCharacters.push(id);
    }
    this.memoryData.selectedCharacter = id;
    this.save();
    return true;
  }

  unlockTheme(id) {
    return this.selectTheme(id);
  }

  selectTheme(id) {
    const theme = THEMES.find((t) => t.id === id);
    if (!theme) return false;
    if (!this.memoryData.unlockedThemes.includes(id)) {
      this.memoryData.unlockedThemes.push(id);
    }
    this.memoryData.selectedTheme = id;
    this.save();
    return true;
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
      card.progress = Math.min(card.target, Math.max(card.progress, amount));
    } else {
      card.progress = Math.min(card.target, card.progress + amount);
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
window.OopsWorld.POWERUP_UPGRADES = POWERUP_UPGRADES;
window.OopsWorld.CHAPTER_ORDER = CHAPTER_ORDER;
window.OopsWorld.CHAPTER_TARGETS = CHAPTER_TARGETS;
window.OopsWorld.StorageManager = StorageManager;
