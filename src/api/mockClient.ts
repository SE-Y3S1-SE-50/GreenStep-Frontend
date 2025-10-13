import { mockChallenges, mockUserProfile, mockAchievements, mockBadges, mockLeaderboard } from './mockData';

class MockApiClient {
  private isAuthenticated: boolean = false;
  public currentUser: any = null;

  setAuthenticated(user: any) {
    this.isAuthenticated = true;
    this.currentUser = user;
  }

  setUnauthenticated() {
    this.isAuthenticated = false;
    this.currentUser = null;
    
    // Reset mock profile data to default
    mockUserProfile.firstName = 'Test';
    mockUserProfile.lastName = 'User';
    mockUserProfile.username = 'testuser5';
    mockUserProfile.email = 'test5@example.com';
  }

  async login(credentials: { username: string; password: string }) {
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (credentials.username && credentials.password) {
      const userData = {
        id: `user-${Date.now()}`,
        role: 'user',
        user: {
          id: `user-${Date.now()}`,
          username: credentials.username,
          firstName: credentials.username.charAt(0).toUpperCase() + credentials.username.slice(1),
          lastName: 'User',
          email: `${credentials.username}@example.com`
        },
        success: true,
        token: `mock-jwt-token-${Date.now()}`
      };

      this.setAuthenticated(userData);

      // Update mock profile data with user-specific information
      mockUserProfile.firstName = userData.user.firstName;
      mockUserProfile.lastName = userData.user.lastName;
      mockUserProfile.username = userData.user.username;
      mockUserProfile.email = userData.user.email;

      return userData;
    }

    throw new Error('Invalid credentials');
  }

  async register(userData: { username: string; password: string; firstName?: string; lastName?: string; email?: string }) {
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (userData.username && userData.password) {
      const newUser = {
        id: `user-${Date.now()}`,
        role: 'user',
        user: {
          id: `user-${Date.now()}`,
          username: userData.username,
          firstName: userData.firstName || userData.username.charAt(0).toUpperCase() + userData.username.slice(1),
          lastName: userData.lastName || 'User',
          email: userData.email || `${userData.username}@example.com`
        },
        success: true,
        token: `mock-jwt-token-${Date.now()}`
      };

      this.setAuthenticated(newUser);

      // Update mock profile data with user-specific information
      mockUserProfile.firstName = newUser.user.firstName;
      mockUserProfile.lastName = newUser.user.lastName;
      mockUserProfile.username = newUser.user.username;
      mockUserProfile.email = newUser.user.email;

      return newUser;
    }

    throw new Error('Registration failed');
  }

  async checkAuth() {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated');
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    return this.currentUser;
  }

  async logout() {
    await new Promise(resolve => setTimeout(resolve, 500));
    this.setUnauthenticated();
    return { message: 'Logged out successfully', success: true };
  }

  async getChallenges() {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated');
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    return mockChallenges;
  }

  async joinChallenge(challengeId: string) {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated');
    }

    console.log('Mock API - Joining challenge:', challengeId);
    console.log('Mock API - Current user:', this.currentUser);

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Find the challenge
    let challenge = mockChallenges.find(c => c._id === challengeId);
    
    // If challenge not found, use the first available challenge as fallback
    if (!challenge) {
      console.log('Challenge not found, using first available challenge');
      challenge = mockChallenges[0];
    }

    if (!challenge) {
      throw new Error('No challenges available');
    }

    // Check if user is already a participant
    const existingParticipant = challenge.participants.find(p => p.user.id === this.currentUser?.user?.id);
    if (existingParticipant) {
      console.log('User already joined this challenge');
      return challenge;
    }

    // Add user to participants
    challenge.participants.push({
      user: { id: this.currentUser?.user?.id || 'mock-user-id' },
      joinedAt: new Date().toISOString(),
      progress: 0,
      completed: false
    });

    console.log('Successfully joined challenge:', challenge.title);
    return challenge;
  }

  async getUserChallenges() {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated');
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    return mockChallenges.filter(c => 
      c.participants.some(p => p.user.id === this.currentUser?.user?.id)
    );
  }

  async getCreatedChallenges() {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated');
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    return mockChallenges.filter(c => c.createdBy._id === this.currentUser?.user?.id);
  }

  async createChallenge(challengeData: any) {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated');
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    const newChallenge = {
      _id: `challenge-${Date.now()}`,
      title: challengeData.title,
      description: challengeData.description,
      category: challengeData.category,
      difficulty: challengeData.difficulty,
      points: challengeData.points || 50,
      duration: challengeData.duration || 7,
      target: challengeData.target || 1,
      unit: challengeData.unit || 'times',
      imageUrl: '',
      isActive: true,
      createdBy: {
        _id: this.currentUser?.user?.id || 'mock-user-id',
        username: this.currentUser?.user?.username || 'mockuser',
        firstName: this.currentUser?.user?.firstName || 'Mock',
        lastName: this.currentUser?.user?.lastName || 'User'
      },
      participants: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockChallenges.push(newChallenge);
    return newChallenge;
  }

  async updateChallengeProgress(challengeId: string, progress: number) {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated');
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    const challenge = mockChallenges.find(c => c._id === challengeId);
    if (!challenge) {
      throw new Error('Challenge not found');
    }

    const participant = challenge.participants.find(p => p.user.id === this.currentUser?.user?.id);
    if (participant) {
      participant.progress = Math.min(progress, 100);
      if (participant.progress >= 100) {
        participant.completed = true;
        this.awardPoints(challenge.points);
        this.checkForNewBadges();
      }
    }

    return challenge;
  }

  async getUserProfile() {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated');
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    // Use current user data instead of static mock data
    const userProfile = {
      ...mockUserProfile,
      firstName: this.currentUser?.user?.firstName || 'Test',
      lastName: this.currentUser?.user?.lastName || 'User',
      username: this.currentUser?.user?.username || 'testuser5',
      email: this.currentUser?.user?.email || 'test5@example.com'
    };

    return {
      success: true,
      user: userProfile
    };
  }

  async getUserStats() {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated');
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    return mockUserProfile.stats;
  }

  async getUserAchievements() {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated');
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    return mockAchievements;
  }

  async getLeaderboard() {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated');
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    return mockLeaderboard;
  }

  private awardPoints(points: number) {
    mockUserProfile.stats.totalPoints += points;
    mockUserProfile.stats.totalChallengesCompleted += 1;
    
    // Check for level up
    const newLevel = Math.floor(mockUserProfile.stats.totalPoints / 100) + 1;
    if (newLevel > mockUserProfile.stats.currentLevel) {
      mockUserProfile.stats.currentLevel = newLevel;
      mockUserProfile.stats.pointsToNextLevel = 100 - (mockUserProfile.stats.totalPoints % 100);
    }
  }

  private checkForNewBadges() {
    const totalPoints = mockUserProfile.stats.totalPoints;
    const completedChallenges = mockUserProfile.stats.totalChallengesCompleted;

    // Award badges based on points
    if (totalPoints >= 100 && !mockUserProfile.badges.some(b => b.name === 'First Steps')) {
      mockUserProfile.badges.push({
        name: 'First Steps',
        icon: '🌱',
        description: 'Earned your first 100 points',
        pointsRequired: 100,
        category: 'milestone'
      });
    }

    if (totalPoints >= 500 && !mockUserProfile.badges.some(b => b.name === 'Green Warrior')) {
      mockUserProfile.badges.push({
        name: 'Green Warrior',
        icon: '⚔️',
        description: 'Earned 500 points',
        pointsRequired: 500,
        category: 'milestone'
      });
    }

    // Award badges based on completed challenges
    if (completedChallenges >= 5 && !mockUserProfile.badges.some(b => b.name === 'Challenge Master')) {
      mockUserProfile.badges.push({
        name: 'Challenge Master',
        icon: '🏆',
        description: 'Completed 5 challenges',
        pointsRequired: 0,
        category: 'achievement'
      });
    }
  }
}

export const mockApi = new MockApiClient();
