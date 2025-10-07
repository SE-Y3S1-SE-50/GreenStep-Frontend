import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, Pressable, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getChallenge, getLeaderboard, joinChallenge, postProgress } from '../../src/api/client';
import Badge from '../../src/components/Badge';
import ProgressBar from '../../src/components/ProgressBar';
import LeaderboardList from '../../src/components/LeaderboardList';
import { colors } from '../../src/theme/colors';

export default function ChallengeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const qc = useQueryClient();
  const router = useRouter();
  const { data: challenge } = useQuery({ queryKey: ['challenge', id], queryFn: () => getChallenge(id!) });
  const { data: leaderboard } = useQuery({ queryKey: ['leaderboard', id], queryFn: () => getLeaderboard(id!), enabled: !!id });

  const joinMut = useMutation({
    mutationFn: () => joinChallenge(id!),
    onMutate: async () => {
      const prev = qc.getQueryData<any>(['challenge', id]);
      qc.setQueryData(['challenge', id], { ...prev, joined: true });
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(['challenge', id], ctx.prev);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['challenges'] }),
  });

  const progressMut = useMutation({
    mutationFn: (delta: number) => postProgress(id!, delta),
    onMutate: async (delta) => {
      const prev = qc.getQueryData<any>(['challenge', id]);
      if (prev) {
        const userContribution = Math.max(0, (prev.userContribution || 0) + delta);
        qc.setQueryData(['challenge', id], { ...prev, userContribution });
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(['challenge', id], ctx.prev);
    },
    onSuccess: (res) => {
      qc.setQueryData(['challenge', id], res.challenge);
      qc.setQueryData(['leaderboard', id], res.leaderboard);
      qc.invalidateQueries({ queryKey: ['challenges'] });
    },
  });

  if (!challenge) return null;

  const onAddProgress = async () => {
    // Simple prompt for demo
    const delta = 1;
    progressMut.mutate(delta);
    Alert.alert('Progress added', `+${delta} to your contribution`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
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
      
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={{ gap: 12 }}>
        <View style={{ alignItems: 'center', gap: 12 }}>
          <Badge name={challenge.title} uri={challenge.badgeUrl} size={96} />
          <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text }}>{challenge.title}</Text>
          <Text style={{ color: '#6B7280', textAlign: 'center' }}>{challenge.description}</Text>
        </View>
        <ProgressBar value={challenge.progress} label="Progress" />
        <Text style={{ color: colors.text, fontWeight: '600' }}>
          Your contribution: {challenge.userContribution} / {challenge.goalValue}
        </Text>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          {challenge.joined ? (
            <Pressable onPress={onAddProgress} style={{ flex: 1, backgroundColor: colors.primary, padding: 12, borderRadius: 10, alignItems: 'center' }}>
              <Text style={{ color: 'white', fontWeight: '700' }}>Add progress</Text>
            </Pressable>
          ) : (
            <Pressable onPress={() => joinMut.mutate()} style={{ flex: 1, backgroundColor: colors.primary, padding: 12, borderRadius: 10, alignItems: 'center' }}>
              <Text style={{ color: 'white', fontWeight: '700' }}>Join</Text>
            </Pressable>
          )}
        </View>

        <Text style={{ marginTop: 12, fontSize: 18, fontWeight: '700', color: colors.text }}>Leaderboard</Text>
        {leaderboard ? <LeaderboardList data={leaderboard} /> : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = {
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
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
    fontWeight: '600' as const,
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: colors.text,
  },
};
