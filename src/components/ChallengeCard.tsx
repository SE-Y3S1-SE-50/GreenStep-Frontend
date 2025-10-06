import { View, Text, Pressable } from 'react-native';
import { colors } from '../theme/colors';
import type { Challenge } from '../types/challenge';
import Badge from './Badge';
import ProgressBar from './ProgressBar';
import StatPill from './StatPill';

type Props = {
  challenge: Challenge;
  onPress?: () => void;
  onJoin?: () => void;
};

export default function ChallengeCard({ challenge, onPress, onJoin }: Props) {
  const end = new Date(challenge.endDate);
  const now = new Date();
  const msLeft = Math.max(0, end.getTime() - now.getTime());
  const daysLeft = Math.ceil(msLeft / 86400000);
  const start = new Date(challenge.startDate);
  const active = start <= now && end >= now;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`View challenge ${challenge.title}`}
      style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#E5E7EB' }}
    >
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
        <Badge uri={challenge.badgeUrl} name={challenge.title} size={56} />
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ fontWeight: '700', color: colors.text }}>{challenge.title}</Text>
          <Text style={{ color: '#6B7280' }} numberOfLines={2}>
            {challenge.description}
          </Text>
        </View>
      </View>
      <View style={{ height: 12 }} />
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        <StatPill label="Participants" value={challenge.participants} />
        <StatPill label="Days left" value={active ? daysLeft : end < now ? 'Ended' : daysLeft} />
        <StatPill label="Difficulty" value={challenge.difficulty} />
      </View>
      <View style={{ height: 12 }} />
      <ProgressBar value={challenge.progress} />
      <View style={{ height: 12 }} />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {challenge.joined ? (
          <Pressable
            onPress={onPress}
            style={{ flex: 1, backgroundColor: colors.secondary, padding: 12, borderRadius: 10, alignItems: 'center' }}
            accessibilityRole="button"
            accessibilityLabel={`View ${challenge.title}`}
          >
            <Text style={{ color: colors.text, fontWeight: '600' }}>View</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={onJoin}
            style={{ flex: 1, backgroundColor: colors.primary, padding: 12, borderRadius: 10, alignItems: 'center' }}
            accessibilityRole="button"
            accessibilityLabel={`Join ${challenge.title}`}
          >
            <Text style={{ color: 'white', fontWeight: '700' }}>Join</Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}


