import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  RefreshControl
} from 'react-native';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { colors } from '../../src/theme/colors';
import { useAuth } from '../../src/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { getUserProfile, getUserChallenges, getCreatedChallenges } from '../../src/api/client';

export default function ProfileScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'joined' | 'created'>('joined');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();

  const { 
    data: profile, 
    isLoading: profileLoading, 
    error: profileError,
    refetch: refetchProfile 
  } = useQuery({
    queryKey: ['userProfile'],
    queryFn: getUserProfile,
    enabled: isAuthenticated && !!user && !isLoggingOut
  });

  const { 
    data: joinedChallenges = [], 
    isLoading: joinedLoading,
    refetch: refetchJoined 
  } = useQuery({
    queryKey: ['userChallenges'],
    queryFn: getUserChallenges,
    enabled: isAuthenticated && !!user && !isLoggingOut
  });

  const { 
    data: createdChallenges = [], 
    isLoading: createdLoading,
    refetch: refetchCreated 
  } = useQuery({
    queryKey: ['createdChallenges'],
    queryFn: getCreatedChallenges,
    enabled: isAuthenticated && !!user && !isLoggingOut
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchProfile(), refetchJoined(), refetchCreated()]);
    setRefreshing(false);
  };

  const handleLogout = () => {
    if (isLoggingOut) {
      console.log('Logout already in progress, ignoring click');
      return;
    }
    
    console.log('Logout button clicked');
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            if (isLoggingOut) return;
            
            setIsLoggingOut(true);
            console.log('Logout confirmed, starting logout process...');
            try {
              await logout();
              console.log('Logout successful, redirecting to login...');
              router.replace('/auth/login');
            } catch (error) {
              console.error('Logout error:', error);
              // Still redirect even if logout fails
              console.log('Logout failed, but redirecting anyway...');
              router.replace('/auth/login');
            } finally {
              setIsLoggingOut(false);
            }
          }
        }
      ]
    );
  };

  if (!isAuthenticated) {
    console.log('User not authenticated, redirecting to login');
    router.replace('/auth/login');
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Redirecting to login...</Text>
      </View>
    );
  }

  // Use user data from authentication context
  const displayProfile = user ? {
    firstName: user.user?.firstName || 'User',
    lastName: user.user?.lastName || 'Name',
    username: user.user?.username || 'user',
    email: user.user?.email || 'user@example.com',
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
      }
    ],
    badges: [
      {
        name: 'First Steps',
        icon: '🌱',
        description: 'Completed your first challenge'
      },
      {
        name: 'Energy Expert',
        icon: '⚡',
        description: 'Mastered energy saving challenges'
      }
    ]
  } : null;

  const safeProfile = {
    firstName: displayProfile?.firstName || 'Unknown',
    lastName: displayProfile?.lastName || 'User',
    username: displayProfile?.username || 'unknown',
    email: displayProfile?.email || 'No email',
    profilePicture: displayProfile?.profilePicture || '',
    stats: {
      currentLevel: displayProfile?.stats?.currentLevel || 1,
      totalPoints: displayProfile?.stats?.totalPoints || 0,
      totalChallengesCompleted: displayProfile?.stats?.totalChallengesCompleted || 0,
      totalChallengesJoined: displayProfile?.stats?.totalChallengesJoined || 0,
      pointsToNextLevel: displayProfile?.stats?.pointsToNextLevel || 100
    },
    achievements: displayProfile?.achievements || [],
    badges: displayProfile?.badges || []
  };

  const challenges = activeTab === 'joined' ? joinedChallenges : createdChallenges;

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          {safeProfile.profilePicture ? (
            <View style={styles.profileImage}>
              {/* Profile image would go here */}
            </View>
          ) : (
            <View style={styles.defaultProfileImage}>
              <Text style={styles.defaultProfileText}>
                {safeProfile.firstName[0]}{safeProfile.lastName[0]}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{safeProfile.firstName} {safeProfile.lastName}</Text>
          <Text style={styles.username}>@{safeProfile.username}</Text>
          <Text style={styles.email}>{safeProfile.email}</Text>
        </View>
      </View>

      {/* Statistics */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{safeProfile.stats.currentLevel}</Text>
            <Text style={styles.statLabel}>Level</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{safeProfile.stats.totalPoints}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{safeProfile.stats.totalChallengesCompleted}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{safeProfile.stats.totalChallengesJoined}</Text>
            <Text style={styles.statLabel}>Joined</Text>
          </View>
        </View>
      </View>

      {/* Achievements */}
      <View style={styles.achievementsSection}>
        <Text style={styles.sectionTitle}>Recent Achievements</Text>
        {safeProfile.achievements.length > 0 ? (
          <View style={styles.achievementsList}>
            {safeProfile.achievements.slice(0, 3).map((achievement: any, index: number) => (
              <View key={index} style={styles.achievementCard}>
                <Text style={styles.achievementTitle}>{achievement.challengeTitle}</Text>
                <Text style={styles.achievementPoints}>+{achievement.pointsEarned} points</Text>
                <Text style={styles.achievementDate}>
                  {new Date(achievement.completedAt).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No achievements yet</Text>
        )}
      </View>

      {/* Badges */}
      <View style={styles.badgesSection}>
        <Text style={styles.sectionTitle}>Badges</Text>
        {safeProfile.badges.length > 0 ? (
          <View style={styles.badgesList}>
            {safeProfile.badges.map((badge: any, index: number) => (
              <View key={index} style={styles.badgeCard}>
                <Text style={styles.badgeIcon}>{badge.icon}</Text>
                <Text style={styles.badgeName}>{badge.name}</Text>
                <Text style={styles.badgeDescription}>{badge.description}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No badges yet</Text>
        )}
      </View>

      {/* My Challenges */}
      <View style={styles.challengesSection}>
        <Text style={styles.sectionTitle}>My Challenges</Text>
        
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'joined' && styles.activeTab]}
            onPress={() => setActiveTab('joined')}
          >
            <Text style={[styles.tabText, activeTab === 'joined' && styles.activeTabText]}>
              Joined ({joinedChallenges.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'created' && styles.activeTab]}
            onPress={() => setActiveTab('created')}
          >
            <Text style={[styles.tabText, activeTab === 'created' && styles.activeTabText]}>
              Created ({createdChallenges.length})
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.challengesList}>
          {challenges.length > 0 ? (
            challenges.map((challenge: any) => (
              <View key={challenge._id} style={styles.challengeCard}>
                <Text style={styles.challengeTitle}>{challenge.title}</Text>
                <Text style={styles.challengeDescription}>{challenge.description}</Text>
                <View style={styles.challengeMeta}>
                  <Text style={styles.challengeCategory}>{challenge.category}</Text>
                  <Text style={styles.challengeDifficulty}>{challenge.difficulty}</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {activeTab === 'joined' 
                  ? 'No challenges joined yet' 
                  : 'No challenges created yet'
                }
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Logout Button */}
      <View style={styles.logoutSection}>
        <TouchableOpacity 
          style={[styles.logoutButton, isLoggingOut && styles.logoutButtonDisabled]}
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          <Text style={styles.logoutText}>
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 16,
  },
  profileImageContainer: {
    marginRight: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
  },
  defaultProfileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultProfileText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: colors.primary,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
  statsSection: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.primary + '10',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
  },
  achievementsSection: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 16,
  },
  achievementsList: {
    gap: 12,
  },
  achievementCard: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  achievementPoints: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: 4,
  },
  achievementDate: {
    fontSize: 12,
    color: '#666',
  },
  badgesSection: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 16,
  },
  badgesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeCard: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: '45%',
  },
  badgeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  badgeDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  challengesSection: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.text,
    fontWeight: '600',
  },
  challengesList: {
    gap: 12,
  },
  challengeCard: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  challengeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  challengeMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  challengeCategory: {
    fontSize: 12,
    color: colors.primary,
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  challengeDifficulty: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  logoutSection: {
    padding: 20,
    marginTop: 20,
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonDisabled: {
    backgroundColor: '#9ca3af',
    opacity: 0.6,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});