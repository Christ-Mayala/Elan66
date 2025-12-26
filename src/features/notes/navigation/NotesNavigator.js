import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NotesListScreen } from '../screens/NotesListScreen';
import { NoteEditorScreen } from '../screens/NoteEditorScreen';

const Stack = createNativeStackNavigator();

export function NotesNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="NotesList" component={NotesListScreen} />
      <Stack.Screen name="NoteEditor" component={NoteEditorScreen} />
    </Stack.Navigator>
  );
}
