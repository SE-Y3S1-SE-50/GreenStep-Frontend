import { View, Text, FlatList } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import getRecommendations, { joinChallenge } from '../src/api/client';
import type { Challenge } from '../src/types/challenge';
import ChallengeCard from '../src/components/ChallengeCard';

export default function RecommendationsSheet() {
  const qc = useQueryClient();

  const { data = [] } = useQuery<Challenge[]>({
    queryKey: ['recommendations'],
    queryFn: getRecommendations,
  });

  const onJoin = async (id: string) => {
    const prev = qc.getQueryData<Challenge[]>(['challenges']);
    try {
      const list = Array.isArray(prev) ? prev : [];
      qc.setQueryData(
        ['challenges'],
        list.map((c) => (c.id === id ? { ...c, joined: true } : c))
      );
      await joinChallenge(id);
      qc.invalidateQueries({ queryKey: ['challenges'] });
      qc.invalidateQueries({ queryKey: ['recommendations'] });
    } catch (e) {
      if (prev) qc.setQueryData(['challenges'], prev);
    }
  };

  return (
    <View style={{ padding: 16, flex: 1 }}>
      <Text style={{ fontWeight: '800', fontSize: 18, marginBottom: 12 }}>
        Recommended challenges
      </Text>
      <FlatList
        data={data}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <ChallengeCard challenge={item} onJoin={() => onJoin(item.id)} />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </View>
  );
}
