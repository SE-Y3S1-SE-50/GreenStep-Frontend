import { StyleSheet, Text, type TextProps } from 'react-native';
import { fontSize } from '../utils/responsive';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: fontSize(16),
    lineHeight: fontSize(24),
  },
  defaultSemiBold: {
    fontSize: fontSize(16),
    lineHeight: fontSize(24),
    fontWeight: '600',
  },
  title: {
    fontSize: fontSize(28),
    fontWeight: 'bold',
    lineHeight: fontSize(34),
  },
  subtitle: {
    fontSize: fontSize(18),
    fontWeight: 'bold',
  },
  link: {
    lineHeight: fontSize(30),
    fontSize: fontSize(16),
    color: '#0a7ea4',
  },
});
