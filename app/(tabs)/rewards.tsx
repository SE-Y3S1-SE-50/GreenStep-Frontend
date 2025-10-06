import { useQuery } from '@tanstack/react-query';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { useState } from 'react';
import { colors } from '../../src/theme/colors';
import { getUserProfile, getUserAchievements } from '../../src/api/client';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface Badge {
  name: string;
  icon: string;
  description: string;
  earnedAt?: string;
}

interface Achievement {
  challengeTitle: string;
  pointsEarned: number;
  completedAt: string;
}

interface UserProfile {
  success: boolean;
  user: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    stats: {
      currentLevel: number;
      totalPoints: number;
      totalChallengesCompleted: number;
      totalChallengesJoined: number;
      pointsToNextLevel: number;
    };
    badges: Badge[];
    achievements: Achievement[];
  };
}

// Stat Pill Component
function StatPill({ 
  label, 
  value, 
  color 
}: { 
  label: string; 
  value: string | number; 
  color?: string;
}) {
  return (
    <View style={[styles.statPill, color && { borderColor: color }]}>
      <Text style={[styles.statValue, color && { color }]}>{value}</Text>
      <Text style={[styles.statLabel, color && { color }]}>{label}</Text>
    </View>
  );
}

export default function RewardsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const { 
    data: profileData, 
    isLoading: profileLoading, 
    refetch: refetchProfile,
    error: profileError 
  } = useQuery<UserProfile>({
    queryKey: ['userProfile'],
    queryFn: getUserProfile,
    retry: 2,
    enabled: isAuthenticated
  });

  const { 
    data: achievementsData, 
    isLoading: achievementsLoading,
    refetch: refetchAchievements,
    error: achievementsError 
  } = useQuery({
    queryKey: ['userAchievements'],
    queryFn: getUserAchievements,
    retry: 2,
    enabled: isAuthenticated
  });

  // Redirect to login if not authenticated
  if (!authLoading && !isAuthenticated) {
    router.replace('/auth/login');
    return null;
  }

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchProfile(), refetchAchievements()]);
    } catch (error) {
      console.error('Error refreshing rewards:', error);
    }
    setRefreshing(false);
  };

  if (profileLoading || achievementsLoading || authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading rewards...</Text>
      </View>
    );
  }

  if (profileError || !profileData?.success) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>Failed to load rewards</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetchProfile()}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const profile = profileData.user;
  const userBadges = profile.badges || [];
  const userAchievements = profile.achievements || [];

  // Calculate progress percentage
  const progressPercentage = profile.stats.pointsToNextLevel > 0 
    ? Math.max(0, Math.min(100, ((100 - profile.stats.pointsToNextLevel) / 100) * 100))
    : 0;

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Rewards</Text>
        <Text style={styles.subtitle}>Earned badges, achievements, and milestones</Text>
      </View>

      {/* Stats Overview */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Your Progress</Text>
        <View style={styles.statsGrid}>
          <StatPill 
            label="Level" 
            value={profile.stats.currentLevel || 1} 
            color={colors.primary}
          />
          <StatPill 
            label="Total Points" 
            value={profile.stats.totalPoints || 0} 
            color="#28a745"
          />
          <StatPill 
            label="Badges Earned" 
            value={userBadges.length} 
            color="#ffc107"
          />
          <StatPill 
            label="Achievements" 
            value={userAchievements.length} 
            color="#17a2b8"
          />
        </View>
        
        {/* Progress to next level */}
        <View style={styles.levelProgress}>
          <View style={styles.levelProgressHeader}>
            <Text style={styles.levelText}>
              Level {profile.stats.currentLevel || 1}
            </Text>
            <Text style={styles.levelPointsText}>
              {profile.stats.pointsToNextLevel || 0} points to next level
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${progressPercentage}%` }
              ]} 
            />
          </View>
        </View>
      </View>

      {/* Badges Section */}
      <View style={styles.badgesSection}>
        <Text style={styles.sectionTitle}>Badges ({userBadges.length})</Text>
        {userBadges.length > 0 ? (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.badgesContainer}
            contentContainerStyle={styles.badgesContent}
          >
            {userBadges.map((badge: Badge, index: number) => (
              <View key={index} style={styles.badgeCard}>
                <Text style={styles.badgeIcon}>{badge.icon || '🏆'}</Text>
                <Text style={styles.badgeName}>{badge.name}</Text>
                <Text style={styles.badgeDescription} numberOfLines={2}>
                  {badge.description}
                </Text>
                {badge.earnedAt && (
                  <Text style={styles.badgeDate}>
                    {new Date(badge.earnedAt).toLocaleDateString()}
                  </Text>
                )}
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🏆</Text>
            <Text style={styles.emptyTitle}>No badges yet</Text>
            <Text style={styles.emptyText}>Complete challenges to earn your first badge!</Text>
          </View>
        )}
      </View>

      {/* Recent Achievements Section */}
      <View style={styles.achievementsSection}>
        <Text style={styles.sectionTitle}>Recent Achievements</Text>
        {userAchievements.length > 0 ? (
          <View style={styles.achievementsList}>
            {userAchievements.slice(0, 10).map((achievement: Achievement, index: number) => (
              <View key={index} style={styles.achievementCard}>
                <View style={styles.achievementIcon}>
                  <Ionicons name="trophy" size={20} color="white" />
                </View>
                <View style={styles.achievementContent}>
                  <Text style={styles.achievementTitle}>
                    {achievement.challengeTitle}
                  </Text>
                  <Text style={styles.achievementPoints}>
                    +{achievement.pointsEarned} points
                  </Text>
                  <Text style={styles.achievementDate}>
                    {new Date(achievement.completedAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={styles.emptyTitle}>No achievements yet</Text>
            <Text style={styles.emptyText}>Join and complete challenges to unlock achievements!</Text>
          </View>
        )}
      </View>

      {/* Bottom spacing */}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
    gap: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  retryText: {
    color: 'white',
    fontWeight: '600',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    color: '#6B7280',
    marginTop: 6,
  },
  statsSection: {
    backgroundColor: 'white',
    padding: 20,
    marginTop: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statPill: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  levelProgress: {
    marginTop: 16,
  },
  levelProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  levelPointsText: {
    fontSize: 14,
    color: '#6b7280',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  badgesSection: {
    backgroundColor: 'white',
    padding: 20,
    marginTop: 1,
  },
  badgesContainer: {
    flexDirection: 'row',
  },
  badgesContent: {
    gap: 12,
  },
  badgeCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    width: 140,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  badgeIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  badgeDescription: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeDate: {
    fontSize: 10,
    color: '#9ca3af',
    textAlign: 'center',
  },
  achievementsSection: {
    backgroundColor: 'white',
    padding: 20,
    marginTop: 1,
  },
  achievementsList: {
    gap: 12,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  achievementPoints: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 2,
  },
  achievementDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});