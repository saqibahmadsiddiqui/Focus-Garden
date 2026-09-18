import { PlantSpecies, TimeOfDay, PlantColorSeed, FocusCategory } from '@/types/garden';

export function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'dusk';
  return 'night';
}

export function generatePlantColorSeed(species: PlantSpecies, timeOfDay: TimeOfDay = getTimeOfDay()): PlantColorSeed {
  // Species specific palettes blended with timeOfDay vibes
  switch (species) {
    case 'wildflower':
      return {
        stem: '#34d399',        // Emerald 400
        leaf: '#10b981',        // Emerald 500
        flower: '#f43f5e',      // Rose 500
        flowerAccent: '#fbbf24',// Amber 400
        pot: '#78350f',         // Amber 900 terracotta
        glow: 'rgba(244, 63, 94, 0.25)'
      };
    case 'bonsai':
      return {
        stem: '#57534e',        // Stone 600 trunk
        leaf: '#059669',        // Emerald 600 foliage
        flower: '#f472b6',      // Pink 400 blossoms
        flowerAccent: '#fce7f3',// Pink 100
        pot: '#1e293b',         // Slate 800 ceramic
        glow: 'rgba(244, 114, 182, 0.25)'
      };
    case 'lotus':
      return {
        stem: '#10b981',
        leaf: '#047857',
        flower: '#f59e0b',      // Amber 500 golden lotus
        flowerAccent: '#fef08a',// Yellow 200
        pot: '#065f46',         // Jade pot
        glow: 'rgba(245, 158, 11, 0.35)'
      };
    case 'fern':
      return {
        stem: '#22c55e',
        leaf: '#15803d',
        flower: '#a855f7',      // Purple frond tip blossoms
        flowerAccent: '#e9d5ff',
        pot: '#7c2d12',
        glow: 'rgba(168, 85, 247, 0.25)'
      };
  }
}

export function getCategoryBadgeStyle(category: FocusCategory): { bg: string; text: string; border: string; icon: string } {
  switch (category) {
    case 'coding':
      return { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/30', icon: '💻' };
    case 'reading':
      return { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/30', icon: '📚' };
    case 'writing':
      return { bg: 'bg-sky-500/10', text: 'text-sky-600 dark:text-sky-400', border: 'border-sky-500/30', icon: '✍️' };
    case 'design':
      return { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500/30', icon: '🎨' };
    case 'learning':
      return { bg: 'bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-500/30', icon: '🧠' };
    case 'zen':
    default:
      return { bg: 'bg-teal-500/10', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-500/30', icon: '🧘' };
  }
}
