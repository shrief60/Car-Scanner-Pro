import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SearchCarScreen() {
  const insets = useSafeAreaInsets();
  const [plate, setPlate] = useState('');
  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.title}>Search by Car Number</Text>
        <View style={{ width: 44 }} />
      </View>
      <View style={styles.body}>
        <View style={styles.icon}><Ionicons name="search-outline" size={34} color="#7fb5ae" /></View>
        <Text style={styles.heading}>Find a Qar car</Text>
        <Text style={styles.subtitle}>Enter the license plate number to search.</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. ABC 1234"
          placeholderTextColor="#4a8a82"
          value={plate}
          onChangeText={setPlate}
          autoCapitalize="characters"
          autoFocus
        />
        <Pressable style={[styles.button, !plate.trim() && styles.disabled]} disabled={!plate.trim()}>
          <Text style={styles.buttonText}>Search Car</Text>
        </Pressable>
        <Text style={styles.note}>Public car-number search will be available when enabled by the Qar server.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#082926' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, fontFamily: 'Inter_700Bold', color: '#FFFFFF' },
  body: { padding: 28, alignItems: 'center', gap: 14 },
  icon: { width: 76, height: 76, borderRadius: 38, backgroundColor: 'rgba(127,181,174,0.1)', justifyContent: 'center', alignItems: 'center', marginTop: 48 },
  heading: { fontSize: 24, fontFamily: 'Inter_700Bold', color: '#FFFFFF', marginTop: 8 },
  subtitle: { fontSize: 14, fontFamily: 'Inter_400Regular', color: '#7fb5ae', textAlign: 'center' },
  input: { width: '100%', backgroundColor: '#0e3b33', borderWidth: 1, borderColor: '#1a5048', borderRadius: 14, paddingHorizontal: 18, paddingVertical: 16, color: '#FFFFFF', fontSize: 17, fontFamily: 'Inter_500Medium', letterSpacing: 2, marginTop: 12 },
  button: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 14, paddingVertical: 17, alignItems: 'center', marginTop: 4 },
  disabled: { opacity: 0.35 },
  buttonText: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#082926' },
  note: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#4a8a82', textAlign: 'center', lineHeight: 18, marginTop: 8 },
});