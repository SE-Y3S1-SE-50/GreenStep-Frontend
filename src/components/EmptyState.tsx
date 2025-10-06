import { View, Text, Pressable } from 'react-native';
import { colors } from '../theme/colors';

type Props = { title?: string; message?: string; onRetry?: () => void };

export default function EmptyState({ title = 'Nothing here', message, onRetry }: Props) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', padding: 24, gap: 8 }}>
      <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>{title}</Text>
      {message ? <Text style={{ textAlign: 'center', color: '#6B7280' }}>{message}</Text> : null}
      {onRetry ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retry"
          onPress={onRetry}
          style={{ marginTop: 8, backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 }}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>Retry</Text>
        </Pressable>
      ) : null}
    </View>
  );
}


