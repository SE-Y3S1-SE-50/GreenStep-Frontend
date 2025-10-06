import { Image, Text, View } from 'react-native';
import { colors } from '../theme/colors';

type Props = { uri?: string; name?: string; size?: number };

export default function Badge({ uri, name, size = 64 }: Props) {
  const safeName = (name || '').trim();
  const initials = safeName
    ? safeName
        .split(' ')
        .map((s) => s.charAt(0))
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '·';

  if (uri) {
    return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.secondary,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: colors.text, fontWeight: '700' }}>{initials}</Text>
    </View>
  );
}


