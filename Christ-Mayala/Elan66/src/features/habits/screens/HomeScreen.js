import React from 'react';
import { View } from 'react-native';
import { Screen } from '../../../core/ui/Screen';
import { Text } from '../../../core/ui/Text';
import { Button } from '../../../core/ui/Button';

export function HomeScreen({ navigation }) {
  return (
    <Screen>
      <View style={{ gap: 12 }}>
        <Text variant="title">Élan66</Text>
        <Text variant="muted">Compagnon hors-ligne. Zéro compte. Zéro cloud.</Text>
        <Button title="Créer une habitude" onPress={() => navigation.navigate('CreateHabit')} />
      </View>
    </Screen>
  );
}
