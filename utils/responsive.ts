import { Dimensions, PixelRatio } from 'react-native';

// Use a 6.7" 1080x2340px (~20:9) baseline which is ≈412x915 dp for density ~2.625
// This makes scaling neutral on many 6.7" Android phones (including your target),
// and other sizes scale proportionally.
const { width, height } = Dimensions.get('window');
const guidelineBaseWidth = Number(process.env.EXPO_PUBLIC_BASE_WIDTH_DP || 412);
const guidelineBaseHeight = Number(process.env.EXPO_PUBLIC_BASE_HEIGHT_DP || 915);

export const scale = (size: number): number => (width / guidelineBaseWidth) * size;
export const verticalScale = (size: number): number => (height / guidelineBaseHeight) * size;
export const moderateScale = (size: number, factor = 0.5): number => size + (scale(size) - size) * factor;

// Font size that respects user font scale settings
export const fontSize = (size: number): number => {
  const ratio = PixelRatio.getFontScale();
  return moderateScale(size) / ratio;
};

// Aliases
export const s = scale;
export const vs = verticalScale;
export const ms = moderateScale;


