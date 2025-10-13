export const colors = {
  primary: '#1C7C54',
  secondary: '#A3D9A5',
  accent: '#2FBF71',
  warning: '#FFC857',
  surface: '#F6F9F7',
  text: '#0F172A',
} as const;

export type AppColor = keyof typeof colors;


