import { useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { getChallenges, joinChallenge } from '../../src/api/client';
import { colors } from '../../src/theme/colors';
import { useAuth } from '../../src/contexts/AuthContext';

export default function ChallengesScreen() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();

  const { 
    data: challenges = [], 
    isLoading, 
    refetch 
  } = useQuery({
    queryKey: ['challenges'],
    queryFn: getChallenges,
    enabled: isAuthenticated
  });

  const joinMutation = useMutation({
    mutationFn: joinChallenge,
    onSuccess: (data) => {
      console.log('Join challenge success:', data);
      Alert.alert('Success', 'Successfully joined the challenge!');
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      queryClient.invalidateQueries({ queryKey: ['userChallenges'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
      queryClient.invalidateQueries({ queryKey: ['userAchievements'] });
    },
    onError: (error: any) => {
      console.error('Join challenge error:', error);
      console.error('Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status
      });
      let errorMessage = 'Failed to join challenge. Please try again.';

      if (error?.response?.status === 401) {
        errorMessage = 'Please log in to join challenges.';
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      Alert.alert('Error', errorMessage);
    }
  });


  const handleJoin = (challengeId: string) => {
    console.log('Attempting to join challenge:', challengeId);
    console.log('Auth state:', { isAuthenticated, user: user?.id });
    
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please log in to join challenges.');
      return;
    }
    
    joinMutation.mutate(challengeId);
  };



  const filteredChallenges = challenges.filter((challenge) => {
    const matchesSearch = challenge.title.toLowerCase().includes(search.toLowerCase()) ||
                         challenge.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || challenge.category === selectedCategory;
    const matchesDifficulty = !selectedDifficulty || challenge.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const categories = ['energy', 'waste', 'transport', 'water', 'food', 'other'];
  const difficulties = ['easy', 'medium', 'hard'];

  const renderChallenge = ({ item }: { item: any }) => (
    <View style={styles.challengeCard}>
      <View style={styles.challengeHeader}>
        <Text style={styles.challengeTitle}>{item.title}</Text>
        <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty) }]}>
          <Text style={styles.difficultyText}>{item.difficulty}</Text>
        </View>
      </View>
      
      <Text style={styles.challengeDescription}>{item.description}</Text>
      
      <View style={styles.challengeMeta}>
        <Text style={styles.challengeCategory}>{item.category}</Text>
        <Text style={styles.challengePoints}>{item.points} points</Text>
        <Text style={styles.challengeDuration}>{item.duration} days</Text>
      </View>
      
      <View style={styles.challengeActions}>
        <TouchableOpacity 
          style={styles.viewButton}
          onPress={() => {/* View details */}}
        >
          <Text style={styles.viewButtonText}>View Details</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.joinButton}
          onPress={() => handleJoin(item._id)}
          disabled={joinMutation.isPending}
        >
          {joinMutation.isPending ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.joinButtonText}>Join Challenge</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>GreenStep Challenges</Text>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search challenges..."
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.filters}>
        <Text style={styles.filterLabel}>Category:</Text>
        <View style={styles.filterButtons}>
          <TouchableOpacity
            style={[styles.filterButton, !selectedCategory && styles.activeFilter]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={[styles.filterText, !selectedCategory && styles.activeFilterText]}>All</Text>
          </TouchableOpacity>
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              style={[styles.filterButton, selectedCategory === category && styles.activeFilter]}
              onPress={() => setSelectedCategory(selectedCategory === category ? null : category)}
            >
              <Text style={[styles.filterText, selectedCategory === category && styles.activeFilterText]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.filters}>
        <Text style={styles.filterLabel}>Difficulty:</Text>
        <View style={styles.filterButtons}>
          <TouchableOpacity
            style={[styles.filterButton, !selectedDifficulty && styles.activeFilter]}
            onPress={() => setSelectedDifficulty(null)}
          >
            <Text style={[styles.filterText, !selectedDifficulty && styles.activeFilterText]}>All</Text>
          </TouchableOpacity>
          {difficulties.map(difficulty => (
            <TouchableOpacity
              key={difficulty}
              style={[styles.filterButton, selectedDifficulty === difficulty && styles.activeFilter]}
              onPress={() => setSelectedDifficulty(selectedDifficulty === difficulty ? null : difficulty)}
            >
              <Text style={[styles.filterText, selectedDifficulty === difficulty && styles.activeFilterText]}>
                {difficulty}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredChallenges}
          renderItem={renderChallenge}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.challengesList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy': return '#4CAF50';
    case 'medium': return '#FF9800';
    case 'hard': return '#F44336';
    default: return '#9E9E9E';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  searchInput: {
    margin: 20,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filters: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  activeFilter: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  activeFilterText: {
    color: 'white',
  },
  challengesList: {
    padding: 20,
    gap: 16,
  },
  challengeCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  challengeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  challengeMeta: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  challengeCategory: {
    fontSize: 12,
    color: colors.primary,
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  challengePoints: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  challengeDuration: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  challengeActions: {
    flexDirection: 'row',
    gap: 12,
  },
  viewButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  viewButtonText: {
    color: colors.text,
    fontWeight: '600',
  },
  joinButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  halfInput: {
    flex: 1,
  },
  quarterInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
  },
  selectedCategory: {
    backgroundColor: colors.primary,
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
  },
  selectedCategoryText: {
    color: 'white',
  },
  difficultyContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  difficultyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
  },
  selectedDifficulty: {
    backgroundColor: colors.primary,
  },
  difficultyButtonText: {
    fontSize: 12,
    color: '#666',
  },
  selectedDifficultyText: {
    color: 'white',
  },
});