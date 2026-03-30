export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  minPoints: number;
  maxPoints?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const BADGES: Badge[] = [
  {
    id: 'recruit',
    name: 'Recruit',
    description: 'Just getting started on your productivity journey',
    icon: '🛡️',
    color: 'text-gray-500',
    minPoints: 0,
    maxPoints: 99,
    rarity: 'common'
  },
  {
    id: 'knight',
    name: 'Knight',
    description: 'A noble warrior in the battle against procrastination',
    icon: '⚔️',
    color: 'text-blue-500',
    minPoints: 100,
    maxPoints: 499,
    rarity: 'common'
  },
  {
    id: 'warrior',
    name: 'Warrior',
    description: 'A seasoned fighter who tackles challenges head-on',
    icon: '🗡️',
    color: 'text-green-500',
    minPoints: 500,
    maxPoints: 999,
    rarity: 'rare'
  },
  {
    id: 'champion',
    name: 'Champion',
    description: 'A master of productivity who leads by example',
    icon: '🏆',
    color: 'text-yellow-500',
    minPoints: 1000,
    maxPoints: 1999,
    rarity: 'epic'
  },
  {
    id: 'mage',
    name: 'Mage',
    description: 'A mystical force who conjures productivity from thin air',
    icon: '🧙‍♂️',
    color: 'text-purple-400',
    minPoints: 2000,
    maxPoints: 2499,
    rarity: 'legendary'
  },
  {
    id: 'grandmaster',
    name: 'Grandmaster',
    description: 'The ultimate productivity legend',
    icon: '👑',
    color: 'text-purple-500',
    minPoints: 2500,
    rarity: 'legendary'
  }
];

export function getCurrentBadge(points: number): Badge {
  // Find the highest badge the user qualifies for
  for (let i = BADGES.length - 1; i >= 0; i--) {
    if (points >= BADGES[i].minPoints) {
      return BADGES[i];
    }
  }
  return BADGES[0]; // Fallback to recruit
}

export function getNextBadge(points: number): Badge | null {
  const currentBadge = getCurrentBadge(points);
  const currentIndex = BADGES.findIndex(badge => badge.id === currentBadge.id);

  if (currentIndex < BADGES.length - 1) {
    return BADGES[currentIndex + 1];
  }

  return null; // Already at max level
}

export function getProgressToNextBadge(points: number): { current: number; next: number; progress: number } {
  const currentBadge = getCurrentBadge(points);
  const nextBadge = getNextBadge(points);

  if (!nextBadge) {
    return { current: points, next: points, progress: 100 };
  }

  const progress = ((points - currentBadge.minPoints) / (nextBadge.minPoints - currentBadge.minPoints)) * 100;

  return {
    current: points,
    next: nextBadge.minPoints,
    progress: Math.min(100, Math.max(0, progress))
  };
}