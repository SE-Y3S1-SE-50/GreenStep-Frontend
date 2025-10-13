import { View, Text } from 'react-native';
import { colors } from '../theme/colors';

type Props = { 
  label: string; 
  value?: string | number; 
  color?: string;
};

export default function StatPill({ label, value, color }: Props) {
  return (
    <View
      style={{
        borderRadius: 999,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: color ? `${color}20` : colors.surface,
        borderWidth: 1,
        borderColor: color || '#E5E7EB',
        minWidth: 80,
        alignItems: 'center',
      }}
      accessibilityRole="text"
      accessibilityLabel={`${label}${value !== undefined ? ` ${value}` : ''}`}
    >
      <Text style={{ 
        color: color || colors.text, 
        fontSize: 16, 
        fontWeight: 'bold',
        marginBottom: 2
      }}>
        {value !== undefined ? value : ''}
      </Text>
      <Text style={{ 
        color: color || colors.text, 
        fontSize: 12,
        opacity: 0.8
      }}>
        {label}
      </Text>
    </View>
  );
}


