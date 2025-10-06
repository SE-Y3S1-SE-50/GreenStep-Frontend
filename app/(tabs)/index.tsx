import { Image } from 'expo-image';
import { 
  Platform, 
  StyleSheet, 
  View, 
  Text, 
  Pressable, 
  ScrollView,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { colors } from '@/src/theme/colors';
import { useAuth } from '@/src/contexts/AuthContext';
import { 
  getUserStats, 
  getUserChallenges, 
  getChallenges,
  type UserStats,
  type Challenge 
} from '@/src/api/client';
import StatPill from '@/src/components/StatPill';

// Welcome/Landing Screen Component
function WelcomeScreen() {
  const router = useRouter();
  
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: colors.secondary, dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.hero}>
        <Text style={styles.appName}>GreenStep</Text>
        <Text style={styles.tagline}>Small steps. Big impact.</Text>
        <View style={styles.ctaRow}>
          <Pressable style={styles.primaryBtn} onPress={() => router.push('/auth/register')}>
            <Text style={styles.primaryBtnText}>Get Started</Text>
          </Pressable>
          <Pressable style={styles.secondaryBtn} onPress={() => router.push('/auth/login')}>
            <Text style={styles.secondaryBtnText}>I have an account</Text>
          </Pressable>
        </View>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Featured</ThemedText>
        <ThemedText style={{ marginTop: 8 }}>
          Join eco challenges, track your progress, and earn rewards while making a positive environmental impact.
        </ThemedText>
        <View style={styles.linkRow}>
          <Link href="/(tabs)/challenges" style={styles.link}>Explore Challenges</Link>
          <Link href="/(tabs)/rewards" style={styles.link}>See Rewards</Link>
        </View>
      </ThemedView>
    </ParallaxScrollView>
  );
}

// Dashboard Component for Authenticated Users
function DashboardScreen() {
  const router = useRouter();
  
  const { 
    data: stats, 
    isLoading: statsLoading 
  } = useQuery({
    queryKey: ['userStats'],
    queryFn: getUserStats,
    retry: 1
  });

  const { 
    data: userChallenges = [], 
    isLoading: challengesLoading 
  } = useQuery({
    queryKey: ['userChallenges'],
    queryFn: getUserChallenges,
    retry: 1
  });

  const { 
    data: allChallenges = [], 
    isLoading: allChallengesLoading 
  } = useQuery({
    queryKey: ['challenges'],
    queryFn: getChallenges,
    retry: 1
  });

  // Get recommended challenges (not joined yet)
  const recommendedChallenges = allChallenges
    .filter(challenge => !challenge.participants.some(p => p.user))
    .slice(0, 3);

  if (statsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.dashboardContainer}>
      {/* Welcome Header */}
      <View style={styles.welcomeHeader}>
        <Text style={styles.welcomeText}>Welcome back!</Text>
        <Text style={styles.levelText}>
          Level {stats?.currentLevel || 1} • {stats?.totalPoints || 0} points
        </Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Your Progress</Text>
        <View style={styles.statsGrid}>
          <StatPill 
            label="Completed" 
            value={stats?.totalChallengesCompleted || 0} 
            color={colors.primary} 
          />
          <StatPill 
            label="Active" 
            value={stats?.totalChallengesJoined || 0} 
            color="#28a745" 
          />
          <StatPill 
            label="Created" 
            value={0} 
            color="#17a2b8" 
          />
          <StatPill 
            label="Points" 
            value={stats?.totalPoints || 0} 
            color="#ffc107" 
          />
        </View>
      </View>

      {/* Active Challenges */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Challenges</Text>
          <Link href="/(tabs)/challenges" asChild>
            <Pressable>
              <Text style={styles.seeAllText}>See All</Text>
            </Pressable>
          </Link>
        </View>
        
        {challengesLoading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : userChallenges.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {userChallenges.slice(0, 3).map((challenge) => (
              <Pressable
                key={challenge._id}
                style={styles.challengeCard}
                onPress={() => router.push({ 
                  pathname: '/challenge/[id]', 
                  params: { id: challenge._id } 
                })}
              >
                <Text style={styles.challengeTitle} numberOfLines={2}>
                  {challenge.title}
                </Text>
                <Text style={styles.challengeCategory}>
                  {challenge.category}
                </Text>
                <Text style={styles.challengeProgress}>
                  Progress: {challenge.participants.find(p => p.user)?.progress || 0}/{challenge.target}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No active challenges</Text>
            <Link href="/(tabs)/challenges" asChild>
              <Pressable style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Join a Challenge</Text>
              </Pressable>
            </Link>
          </View>
        )}
      </View>

      {/* Recommended Challenges */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommended for You</Text>
          <Link href="/(tabs)/challenges" asChild>
            <Pressable>
              <Text style={styles.seeAllText}>See All</Text>
            </Pressable>
          </Link>
        </View>
        
        {allChallengesLoading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : recommendedChallenges.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {recommendedChallenges.map((challenge) => (
              <Pressable
                key={challenge._id}
                style={styles.challengeCard}
                onPress={() => router.push({ 
                  pathname: '/challenge/[id]', 
                  params: { id: challenge._id } 
                })}
              >
                <Text style={styles.challengeTitle} numberOfLines={2}>
                  {challenge.title}
                </Text>
                <Text style={styles.challengeCategory}>
                  {challenge.category}
                </Text>
                <Text style={styles.challengeParticipants}>
                  {challenge.participants.length} participants
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.emptyText}>No recommendations available</Text>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <Link href="/challenge/create" asChild>
            <Pressable style={styles.actionCard}>
              <Text style={styles.actionIcon}>📝</Text>
              <Text style={styles.actionTitle}>Create Challenge</Text>
            </Pressable>
          </Link>
          
          <Link href="/(tabs)/profile" asChild>
            <Pressable style={styles.actionCard}>
              <Text style={styles.actionIcon}>👤</Text>
              <Text style={styles.actionTitle}>View Profile</Text>
            </Pressable>
          </Link>
          
          <Link href="/(tabs)/rewards" asChild>
            <Pressable style={styles.actionCard}>
              <Text style={styles.actionIcon}>🏆</Text>
              <Text style={styles.actionTitle}>Rewards</Text>
            </Pressable>
          </Link>
        </View>
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

export default function HomeScreen() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return isAuthenticated ? <DashboardScreen /> : <WelcomeScreen />;
}

const styles = StyleSheet.create({
  // Loading states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.text,
  },
  
  // Welcome screen styles
  hero: {
    paddingTop: 24,
    paddingHorizontal: 16,
    gap: 8,
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.primary,
  },
  tagline: {
    fontSize: 16,
    color: colors.text,
  },
  ctaRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  secondaryBtnText: {
    color: colors.primary,
    fontWeight: '600',
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  link: {
    fontSize: 16,
    color: colors.accent,
    textDecorationLine: 'underline',
  },
  linkRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },

  // Dashboard styles
  dashboardContainer: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  welcomeHeader: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  levelText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  
  // Section styles
  section: {
    backgroundColor: 'white',
    marginTop: 8,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },

  // Stats section
  statsSection: {
    backgroundColor: 'white',
    marginTop: 8,
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },

  // Challenge cards
  challengeCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    width: 200,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    height: 40,
  },
  challengeCategory: {
    fontSize: 12,
    color: colors.primary,
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  challengeProgress: {
    fontSize: 12,
    color: '#6b7280',
  },
  challengeParticipants: {
    fontSize: 12,
    color: '#6b7280',
  },

  // Empty states
  emptyState: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 12,
    textAlign: 'center',
  },

  // Action buttons
  actionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },

  // Quick actions
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },

  // Bottom spacing
  bottomSpacing: {
    height: 40,
  },
});
