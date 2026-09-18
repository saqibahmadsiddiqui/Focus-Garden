export type PlantSpecies = 'wildflower' | 'bonsai' | 'lotus' | 'fern';
export type FocusCategory = 'coding' | 'reading' | 'writing' | 'design' | 'learning' | 'zen';
export type StrictnessLevel = 'gentle' | 'strict' | 'zen';
export type TimeOfDay = 'morning' | 'afternoon' | 'dusk' | 'night';
export type AppView = 'timer' | 'garden' | 'analytics' | 'settings';
export type ThemeMode = 'auto' | 'light' | 'dark';

export interface PlantColorSeed {
  stem: string;
  leaf: string;
  flower: string;
  flowerAccent: string;
  pot: string;
  glow: string;
}

export interface PlantRecord {
  id: string;                    // UUID v4
  plantedAt: string;             // ISO 8601 Timestamp
  durationMinutes: number;       // Target duration
  actualFocusedSeconds: number;  // Total seconds spent focused
  completed: boolean;            // true = Bloomed, false = Wilted
  species: PlantSpecies;         // Plant archetype
  categoryTag: FocusCategory;   // Intention category
  intention: string;             // Session focus goal
  journalNote?: string;          // Post-session reflection note
  colorSeed: PlantColorSeed;     // Color palette derived from species
  timeOfDay: TimeOfDay;
}

export interface GardenSettings {
  defaultDuration: number;       // Minutes
  strictness: StrictnessLevel;
  gracePeriodSeconds: number;    // Default 15s
  selectedSpecies: PlantSpecies;
  ambientSound: string | null;   // 'rain' | 'forest' | 'waves' | 'lofi' | null
  ambientVolume: number;         // 0 to 1
  soundEffectsEnabled: boolean;
  themeMode: ThemeMode;
}

export interface GardenState {
  version: string;
  plants: PlantRecord[];
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null; // YYYY-MM-DD
  totalFocusedMinutes: number;
  totalWilts: number;
  settings: GardenSettings;
}

export type PlantStage = 0 | 1 | 2 | 3 | 4 | 5 | 'wilt';
// 0: Seed mound (0%)
// 1: Sprout (1-15%)
// 2: Stem Extension (15-50%)
// 3: Branching & Foliage (50-80%)
// 4: Bud Formation (80-99%)
// 5: Bloom (100%)
// 'wilt': Drooped failure
