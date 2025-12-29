import { LayoutAnimation, Platform, UIManager } from 'react-native';

let enabled = false;

export const enableLayoutAnimation = () => {
  if (enabled) return;
  enabled = true;
  const isNewArch = Boolean(global?.nativeFabricUIManager);
  if (Platform.OS === 'android' && !isNewArch) {
    UIManager.setLayoutAnimationEnabledExperimental?.(true);
  }
};

export const animateNext = () => {
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
};
