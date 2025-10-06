import { useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Pressable, 
  TextInput, 
  RefreshControl, 
  Alert,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { getChallenges, joinChallenge, type Challenge } from '../../src/api/client';
import { colors } from '../../src/theme/colors';

// Simple Challenge Card Component
function SimpleChallengeCard({ 
  challenge, 
  onPress, 
  onJoin 
}: { 
  challenge: Challenge; 
  onPress: () => void; 
  onJoin: () => void; 
}) {
  const endDate = new Date(Date.now() + challenge.duration * 24 * 60 * 60 * 1000);
  const daysLeft = Math.ceil((endDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
  
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{challenge.title}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{challenge.difficulty}</Text>
        </View>
      </View>
      
      <Text style={styles.cardDescription} numberOfLines={2}>
        {challenge.description}
      </Text>
      
      <View style={styles.cardInfo}>
        <Text style={styles.infoText}>
          Category: {challenge.category}
        </Text>
        <Text style={styles.infoText}>
          Target: {challenge.target} {challenge.unit}
        </Text>
        <Text style={styles.infoText}>
          Duration: {challenge.duration} days
        </Text>
        <Text style={styles.infoText}>
          Participants: {challenge.participants.length}
        </Text>
      </View>
      
      <View style={styles.cardActions}>
        <Pressable style={[styles.button, styles.viewButton]} onPress={onPress}>
          <Text style={styles.viewButtonText}>View Details</Text>
        </Pressable>
        
        <Pressable style={[styles.button, styles.joinButton]} onPress={onJoin}>
          <Text style={styles.joinButtonText}>Join Challenge</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function ChallengesScreen() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { 
    data: challenges = [], 
    isLoading, 
    refetch, 
    isRefetching 
  } = useQuery({
    queryKey: ['challenges'],
    queryFn: getChallenges,
    retry: 2
  });

  const joinMutation = useMutation({
    mutationFn: joinChallenge,
    onSuccess: () => {
      Alert.alert('Success', 'Successfully joined the challenge!');
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      queryClient.invalidateQueries({ queryKey: ['userChallenges'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
    },
    onError: (error: any) => {
      console.error('Join challenge error:', error);
      Alert.alert(
        'Error', 
        error?.response?.data?.message || 'Failed to join challenge. Please try again.'
      );
    }
  });

  // Filter challenges
  const filteredChallenges = challenges.filter((challenge) => {
    const matchesSearch = challenge.title.toLowerCase().includes(search.toLowerCase()) ||
                         challenge.description.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = !selectedCategory || challenge.category === selectedCategory;
    const matchesDifficulty = !selectedDifficulty || challenge.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const handleJoin = (challengeId: string) => {
    joinMutation.mutate(challengeId);
  };

  const renderChallenge = ({ item }: { item: Challenge }) => (
    <SimpleChallengeCard
      challenge={item}
      onPress={() => router.push({ 
        pathname: '/challenge/[id]', 
        params: { id: item._id } 
      })}
      onJoin={() => handleJoin(item._id)}
    />
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading challenges...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>GreenStep Challenges</Text>
        
        {/* Search */}
        <TextInput
          style={styles.searchInput}
          placeholder="Search challenges..."
          value={search}
          onChangeText={setSearch}
        />
        
        {/* Filters */}
        <View style={styles.filtersContainer}>
          <Text style={styles.filterLabel}>Category:</Text>
          <View style={styles.filterRow}>
            {['energy', 'waste', 'transport', 'water', 'food', 'other'].map((category) => (
              <Pressable
                key={category}
                style={[
                  styles.filterChip,
                  selectedCategory === category && styles.selectedFilterChip
                ]}
                onPress={() => setSelectedCategory(
                  selectedCategory === category ? null : category
                )}
              >
                <Text style={[
                  styles.filterChipText,
                  selectedCategory === category && styles.selectedFilterChipText
                ]}>
                  {category}
                </Text>
              </Pressable>
            ))}
          </View>
          
          <Text style={styles.filterLabel}>Difficulty:</Text>
          <View style={styles.filterRow}>
            {['easy', 'medium', 'hard'].map((difficulty) => (
              <Pressable
                key={difficulty}
                style={[
                  styles.filterChip,
                  selectedDifficulty === difficulty && styles.selectedFilterChip
                ]}
                onPress={() => setSelectedDifficulty(
                  selectedDifficulty === difficulty ? null : difficulty
                )}
              >
                <Text style={[
                  styles.filterChipText,
                  selectedDifficulty === difficulty && styles.selectedFilterChipText
                ]}>
                  {difficulty}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      {/* Challenges List */}
      <FlatList
        data={filteredChallenges}
        keyExtractor={(item) => item._id}
        renderItem={renderChallenge}
        refreshControl={
          <RefreshControl 
            refreshing={isRefetching} 
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No challenges found</Text>
            <Text style={styles.emptySubtext}>
              {search || selectedCategory || selectedDifficulty 
                ? 'Try adjusting your filters' 
                : 'Be the first to create a challenge!'}
            </Text>
          </View>
        }
      />

      {/* Create Challenge Button */}
      <Link href="/challenge/create" asChild>
        <Pressable style={styles.fab}>
          <Text style={styles.fabText}>+</Text>
        </Pressable>
      </Link>
    </View>
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
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.text,
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  filtersContainer: {
    gap: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
  },
  selectedFilterChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    color: colors.text,
    textTransform: 'capitalize',
  },
  selectedFilterChipText: {
    color: 'white',
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
    marginRight: 12,
  },
  badge: {
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  badgeText: {
    fontSize: 12,
    color: colors.text,
    textTransform: 'capitalize',
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  cardInfo: {
    marginBottom: 16,
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#6b7280',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  joinButton: {
    backgroundColor: colors.primary,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
});