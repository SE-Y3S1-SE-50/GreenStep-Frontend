import { View, Text, AccessibilityInfo } from 'react-native';
import { colors } from '../theme/colors';

type Props = { value: number; label?: string; showLabel?: boolean };

export default function ProgressBar({ value, label, showLabel = true }: Props) {
  const pct = Math.max(0, Math.min(1, value));
  const pctText = `${Math.round(pct * 100)}%`;
  const a11yLabel = label ? `${label} ${pctText}` : `Progress ${pctText}`;

  AccessibilityInfo.announceForAccessibility?.(a11yLabel);

  return (
    <View accessible accessibilityRole="progressbar" accessibilityLabel={a11yLabel} style={{ gap: 6 }}>
      {showLabel && <Text style={{ color: colors.text, fontSize: 12 }}>{pctText}</Text>}
      <View style={{ height: 10, backgroundColor: '#E5E7EB', borderRadius: 999 }}>
        <View
          style={{
            width: `${pct * 100}%`,
            height: '100%',
            backgroundColor: colors.primary,
            borderRadius: 999,
          }}
        />
      </View>
    </View>
  );
}


