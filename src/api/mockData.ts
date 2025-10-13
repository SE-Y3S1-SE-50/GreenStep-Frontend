export const mockChallenges = [
  {
    _id: '1',
    title: 'Walk to Work Week',
    description: 'Walk or bike to work for 5 days instead of driving. Reduce your carbon footprint!',
    category: 'transport' as const,
    difficulty: 'easy' as const,
    points: 50,
    duration: 5,
    target: 5,
    unit: 'days',
    imageUrl: '',
    isActive: true,
    createdBy: {
      _id: 'admin',
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User'
    },
    participants: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '2',
    title: 'Water Conservation Week',
    description: 'Reduce your water usage by 20% for 7 days. Take shorter showers, fix leaks, and use water wisely.',
    category: 'water' as const,
    difficulty: 'hard' as const,
    points: 100,
    duration: 7,
    target: 20,
    unit: '%',
    imageUrl: '',
    isActive: true,
    createdBy: {
      _id: 'admin',
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User'
    },
    participants: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '3',
    title: 'Energy Saver Challenge',
    description: 'Reduce your energy consumption by 20% this month. Turn off lights when not in use, unplug devices, and use energy-efficient appliances.',
    category: 'energy' as const,
    difficulty: 'medium' as const,
    points: 75,
    duration: 30,
    target: 20,
    unit: '%',
    imageUrl: '',
    isActive: true,
    createdBy: {
      _id: 'admin',
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User'
    },
    participants: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '4',
    title: 'Zero Waste Week',
    description: 'Generate zero waste for 7 days. Use reusable containers, avoid single-use plastics, and compost organic waste.',
    category: 'waste' as const,
    difficulty: 'hard' as const,
    points: 120,
    duration: 7,
    target: 0,
    unit: 'items',
    imageUrl: '',
    isActive: true,
    createdBy: {
      _id: 'admin',
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User'
    },
    participants: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '5',
    title: 'Plant-Based Meals',
    description: 'Eat plant-based meals for 14 days. Reduce your carbon footprint through sustainable food choices.',
    category: 'food' as const,
    difficulty: 'medium' as const,
    points: 80,
    duration: 14,
    target: 14,
    unit: 'meals',
    imageUrl: '',
    isActive: true,
    createdBy: {
      _id: 'admin',
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User'
    },
    participants: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const mockUserProfile = {
  id: '68e3a3640d66affeef00fc14',
  username: 'testuser5',
  firstName: 'Test',
  lastName: 'User',
  email: 'test5@example.com',
  profilePicture: '',
  stats: {
    currentLevel: 3,
    totalPoints: 250,
    totalChallengesCompleted: 5,
    totalChallengesJoined: 8,
    pointsToNextLevel: 50
  },
  achievements: [
    {
      challengeTitle: 'Energy Saver',
      pointsEarned: 50,
      completedAt: new Date().toISOString()
    },
    {
      challengeTitle: 'Waste Warrior',
      pointsEarned: 75,
      completedAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      challengeTitle: 'Water Conservation',
      pointsEarned: 100,
      completedAt: new Date(Date.now() - 172800000).toISOString()
    },
    {
      challengeTitle: 'Green Commuter',
      pointsEarned: 25,
      completedAt: new Date(Date.now() - 259200000).toISOString()
    },
    {
      challengeTitle: 'Eco-Friendly Living',
      pointsEarned: 60,
      completedAt: new Date(Date.now() - 345600000).toISOString()
    }
  ],
  badges: [
    {
      name: 'First Steps',
      icon: '🌱',
      description: 'Completed your first challenge',
      pointsRequired: 50,
      category: 'milestone'
    },
    {
      name: 'Energy Expert',
      icon: '⚡',
      description: 'Mastered energy saving challenges',
      pointsRequired: 100,
      category: 'expertise'
    },
    {
      name: 'Water Warrior',
      icon: '💧',
      description: 'Champion of water conservation',
      pointsRequired: 150,
      category: 'expertise'
    },
    {
      name: 'Eco Champion',
      icon: '🏆',
      description: 'Overall environmental champion',
      pointsRequired: 200,
      category: 'achievement'
    }
  ]
};

export const mockAchievements = [
  {
    id: '1',
    challengeTitle: 'Energy Saver',
    pointsEarned: 50,
    completedAt: new Date().toISOString(),
    challengeId: '1'
  },
  {
    id: '2',
    challengeTitle: 'Waste Warrior',
    pointsEarned: 75,
    completedAt: new Date(Date.now() - 86400000).toISOString(),
    challengeId: '2'
  },
  {
    id: '3',
    challengeTitle: 'Water Conservation',
    pointsEarned: 100,
    completedAt: new Date(Date.now() - 172800000).toISOString(),
    challengeId: '3'
  },
  {
    id: '4',
    challengeTitle: 'Green Commuter',
    pointsEarned: 25,
    completedAt: new Date(Date.now() - 259200000).toISOString(),
    challengeId: '4'
  },
  {
    id: '5',
    challengeTitle: 'Eco-Friendly Living',
    pointsEarned: 60,
    completedAt: new Date(Date.now() - 345600000).toISOString(),
    challengeId: '5'
  }
];

export const mockBadges = [
  {
    name: 'First Steps',
    icon: '🌱',
    description: 'Completed your first challenge',
    pointsRequired: 50,
    category: 'milestone'
  },
  {
    name: 'Energy Expert',
    icon: '⚡',
    description: 'Mastered energy saving challenges',
    pointsRequired: 100,
    category: 'expertise'
  },
  {
    name: 'Water Warrior',
    icon: '💧',
    description: 'Champion of water conservation',
    pointsRequired: 150,
    category: 'expertise'
  },
  {
    name: 'Eco Champion',
    icon: '🏆',
    description: 'Overall environmental champion',
    pointsRequired: 200,
    category: 'achievement'
  },
  {
    name: 'Waste Warrior',
    icon: '♻️',
    description: 'Zero waste champion',
    pointsRequired: 120,
    category: 'expertise'
  },
  {
    name: 'Green Commuter',
    icon: '🚲',
    description: 'Sustainable transportation advocate',
    pointsRequired: 80,
    category: 'lifestyle'
  }
];

export const mockLeaderboard = [
  {
    rank: 1,
    username: 'ecohero',
    firstName: 'Eco',
    lastName: 'Hero',
    totalPoints: 1250,
    challengesCompleted: 12,
    level: 13
  },
  {
    rank: 2,
    username: 'greenwarrior',
    firstName: 'Green',
    lastName: 'Warrior',
    totalPoints: 980,
    challengesCompleted: 10,
    level: 10
  },
  {
    rank: 3,
    username: 'sustainable_sam',
    firstName: 'Sam',
    lastName: 'Sustainable',
    totalPoints: 875,
    challengesCompleted: 9,
    level: 9
  },
  {
    rank: 4,
    username: 'testuser5',
    firstName: 'Test',
    lastName: 'User',
    totalPoints: 250,
    challengesCompleted: 5,
    level: 3
  },
  {
    rank: 5,
    username: 'naturelover',
    firstName: 'Nature',
    lastName: 'Lover',
    totalPoints: 180,
    challengesCompleted: 3,
    level: 2
  }
];
