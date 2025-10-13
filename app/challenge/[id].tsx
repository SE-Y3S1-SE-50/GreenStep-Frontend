import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, Pressable, Alert, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getChallenge, getLeaderboard, joinChallenge, updateChallengeProgress, getUserProfile } from '../../src/api/client';
import type { Challenge } from '../../src/api/client';
import Badge from '../../src/components/Badge';
import ProgressBar from '../../src/components/ProgressBar';
import LeaderboardList from '../../src/components/LeaderboardList';
import { colors } from '../../src/theme/colors';
import { useEffect, useState } from 'react';

// Extended type for leaderboard data
interface LeaderboardEntry {
  user: {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  progress: number;
  completed: boolean;
  joinedAt: string;
}

interface LeaderboardResponse {
  success: boolean;
  leaderboard: LeaderboardEntry[];
  challenge: {
    id: string;
    title: string;
    target: number;
    unit: string;
  };
}

export default function ChallengeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const qc = useQueryClient();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  // Get user profile
  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: getUserProfile,
  });

  // Set userId when userProfile is loaded
  useEffect(() => {
    if (userProfile?.user?.id) {
      setUserId(userProfile.user.id);
    }
  }, [userProfile]);

  // Get challenge data
  const { data: challenge, isLoading: challengeLoading } = useQuery({
    queryKey: ['challenge', id],
    queryFn: () => getChallenge(id!),
    enabled: !!id,
  });

  // Get leaderboard data
  const { data: leaderboardData, isLoading: leaderboardLoading } = useQuery<LeaderboardResponse>({
    queryKey: ['leaderboard', id],
    queryFn: () => getLeaderboard(id!),
    enabled: !!id,
  });

  // Check if user has joined
  const hasUserJoined = (): boolean => {
    if (!userId || !challenge) return false;
    return challenge.participants.some(
      participant => 
        participant.user._id === userId || 
        participant.user._id.toString() === userId.toString()
    );
  };

  // Get user's progress
  const getUserProgress = (): number => {
    if (!userId || !challenge) return 0;
    const participant = challenge.participants.find(
      p => p.user._id === userId || p.user._id.toString() === userId.toString()
    );
    return participant?.progress || 0;
  };

  // Calculate overall progress percentage
  const getOverallProgress = (): number => {
    if (!challenge) return 0;
    const totalProgress = challenge.participants.reduce((sum, p) => sum + p.progress, 0);
    const totalTarget = challenge.target * challenge.participants.length;
    return totalTarget > 0 ? (totalProgress / totalTarget) * 100 : 0;
  };

  // Join challenge mutation
  const joinMut = useMutation({
    mutationFn: () => joinChallenge(id!),
    onSuccess: (data) => {
      qc.setQueryData(['challenge', id], data);
      qc.invalidateQueries({ queryKey: ['challenges'] });
      qc.invalidateQueries({ queryKey: ['userChallenges'] });
      qc.invalidateQueries({ queryKey: ['leaderboard', id] });
      Alert.alert('Success', 'Successfully joined the challenge!');
    },
    onError: (error: any) => {
      console.error('Join error:', error);
      const message = error?.response?.data?.message || 'Failed to join challenge';
      Alert.alert('Error', message);
    },
  });

  // Update progress mutation
  const progressMut = useMutation({
    mutationFn: (newProgress: number) => updateChallengeProgress(id!, newProgress),
    onSuccess: (updatedChallenge) => {
      qc.setQueryData(['challenge', id], updatedChallenge);
      qc.invalidateQueries({ queryKey: ['challenges'] });
      qc.invalidateQueries({ queryKey: ['leaderboard', id] });
      qc.invalidateQueries({ queryKey: ['userChallenges'] });
      Alert.alert('Success', 'Progress updated!');
    },
    onError: (error: any) => {
      console.error('Progress update error:', error);
      const message = error?.response?.data?.message || 'Failed to update progress';
      Alert.alert('Error', message);
    },
  });

  const onAddProgress = () => {
    if (!challenge) return;
    
    const currentProgress = getUserProgress();
    const newProgress = Math.min(currentProgress + 1, challenge.target);
    
    if (currentProgress >= challenge.target) {
      Alert.alert('Complete', 'You have already reached the target!');
      return;
    }

    progressMut.mutate(newProgress);
  };

  // Transform leaderboard data for LeaderboardList component
  const transformLeaderboardData = () => {
    if (!leaderboardData?.leaderboard) return [];
    
    return leaderboardData.leaderboard.map((entry, index) => ({
      userId: entry.user._id,
      rank: index + 1,
      name: entry.user.username || `${entry.user.firstName} ${entry.user.lastName}`,
      value: `${entry.progress}/${challenge?.target || 0} ${challenge?.unit || ''}`,
    }));
  };

  if (challengeLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading challenge...</Text>
      </View>
    );
  }

  if (!challenge) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Challenge not found</Text>
        <Pressable 
          style={styles.backButtonError}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonTextError}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const userProgress = getUserProgress();
  const overallProgress = getOverallProgress();
  const hasJoined = hasUserJoined();
  const isCompleted = userProgress >= challenge.target;

  return (
    <View style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Challenge Details</Text>
        <View style={{ width: 60 }} />
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.contentContainer}>
          {/* Challenge Header */}
          <View style={styles.challengeHeader}>
            {challenge.imageUrl && (
              <Badge name={challenge.title} uri={challenge.imageUrl} size={96} />
            )}
            <Text style={styles.challengeTitle}>{challenge.title}</Text>
            <Text style={styles.challengeDescription}>{challenge.description}</Text>
          </View>

          {/* Challenge Info */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Category:</Text>
              <Text style={styles.infoValue}>{challenge.category}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Difficulty:</Text>
              <Text style={styles.infoValue}>{challenge.difficulty}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Target:</Text>
              <Text style={styles.infoValue}>{challenge.target} {challenge.unit}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Duration:</Text>
              <Text style={styles.infoValue}>{challenge.duration} days</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Points:</Text>
              <Text style={styles.infoValue}>{challenge.points} pts</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Participants:</Text>
              <Text style={styles.infoValue}>{challenge.participants.length}</Text>
            </View>
          </View>

          {/* Progress Section */}
          {hasJoined && (
            <View style={styles.progressCard}>
              <Text style={styles.sectionTitle}>Your Progress</Text>
              <ProgressBar 
                value={(userProgress / challenge.target) * 100} 
                label={`${userProgress} / ${challenge.target} ${challenge.unit}`}
              />
              
              {isCompleted && (
                <View style={styles.completedBadge}>
                  <Text style={styles.completedText}>✓ Completed!</Text>
                </View>
              )}
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {hasJoined ? (
              <>
                {!isCompleted && (
                  <Pressable 
                    onPress={onAddProgress} 
                    style={[
                      styles.actionButton, 
                      styles.primaryButton,
                      progressMut.isPending && styles.disabledButton
                    ]}
                    disabled={progressMut.isPending}
                  >
                    {progressMut.isPending ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text style={styles.primaryButtonText}>Add Progress (+1)</Text>
                    )}
                  </Pressable>
                )}
              </>
            ) : (
              <Pressable 
                onPress={() => joinMut.mutate()} 
                style={[
                  styles.actionButton, 
                  styles.primaryButton,
                  joinMut.isPending && styles.disabledButton
                ]}
                disabled={joinMut.isPending}
              >
                {joinMut.isPending ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.primaryButtonText}>Join Challenge</Text>
                )}
              </Pressable>
            )}
          </View>

          {/* Leaderboard Section */}
          <View style={styles.leaderboardSection}>
            <Text style={styles.sectionTitle}>Leaderboard</Text>
            {leaderboardLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : leaderboardData?.leaderboard && leaderboardData.leaderboard.length > 0 ? (
              <LeaderboardList data={transformLeaderboardData()} />
            ) : (
              <Text style={styles.emptyText}>No participants yet</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
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
  errorText: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 16,
  },
  backButtonError: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonTextError: {
    color: 'white',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  backButtonText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  scrollContent: {
    padding: 16,
  },
  contentContainer: {
    gap: 16,
  },
  challengeHeader: {
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  challengeTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  challengeDescription: {
    color: '#6B7280',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    color: '#6B7280',
    fontSize: 14,
  },
  infoValue: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
    textTransform: 'capitalize',
  },
  progressCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  completedBadge: {
    backgroundColor: '#d1fae5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  completedText: {
    color: '#10b981',
    fontWeight: '600',
    fontSize: 16,
  },
  actionButtons: {
    gap: 8,
  },
  actionButton: {
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
  leaderboardSection: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  emptyText: {
    color: '#6B7280',
    textAlign: 'center',
    fontSize: 14,
    paddingVertical: 20,
  },
});