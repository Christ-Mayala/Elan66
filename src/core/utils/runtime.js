import Constants from 'expo-constants';

export const isExpoGo = () => {
  const env = Constants?.executionEnvironment;
  if (env) return env === 'storeClient';
  return Constants?.appOwnership === 'expo';
};
