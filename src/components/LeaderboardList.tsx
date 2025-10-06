import { FlatList, View, Text } from 'react-native';
import type { LeaderboardRow } from '../types/challenge';
import { colors } from '../theme/colors';

type Props = { data: LeaderboardRow[] };

export default function LeaderboardList({ data }: Props) {
  return (
    <FlatList
      data={data}
      keyExtractor={(i) => i.userId}
      renderItem={({ item }) => <Row row={item} />}
      ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingVertical: 8 }}
      accessibilityLabel="Leaderboard"
    />
  );
}

function Medal({ rank }: { rank: number }) {
  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}`;
  return <Text style={{ width: 28, textAlign: 'center' }}>{medal}</Text>;
}

function Row({ row }: { row: LeaderboardRow }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
      }}
      accessibilityRole="text"
      accessibilityLabel={`${row.rank} ${row.name} ${row.value}`}
    >
      <Medal rank={row.rank} />
      <Text style={{ flex: 1, color: colors.text }}>{row.name}</Text>
      <Text style={{ fontWeight: '600', color: colors.text }}>{row.value}</Text>
    </View>
  );
}


