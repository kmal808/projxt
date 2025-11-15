import { useThemeStore } from '@/store/theme-store';
import Colors from '@/constants/colors';

export const useThemeColors = () => {
  const { isDarkMode } = useThemeStore();
  
  if (isDarkMode) {
    return {
      ...Colors,
      background: Colors.dark.background,
      card: Colors.dark.card,
      text: Colors.dark.text,
      textLight: Colors.dark.textLight,
      border: Colors.dark.border,
      disabled: Colors.dark.disabled,
    };
  }
  
  return Colors;
};
