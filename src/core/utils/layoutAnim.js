import { LayoutAnimation, Platform, UIManager } from 'react-native';

let enabled = false;

export const enableLayoutAnimation = () => {
  if (enabled) return;
  enabled = true;
  if (Platform.OS === 'android') {
    UIManager.setLayoutAnimationEnabledExperimental?.(true);
  }
};

export const animateNext = () => {
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
};
