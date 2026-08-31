import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FONT } from '@/lib/typography';
import { mirrorIcon } from '@/lib/rtl';
import { alignInput, alignStart } from '@/lib/direction';
import { useLocale } from '@/context/LocaleContext';

export default function SearchCarScreen() {
  const { t } = useLocale();
  const insets = useSafeAreaInsets();
  const [plate, setPlate] = useState('');
  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name={mirrorIcon('arrow-back')} size={24} color="#FFFFFF" />
        </Pressable>
        <Text style={[styles.title, alignStart()]}>{t('searchCar.title')}</Text>
        <View style={{ width: 44 }} />
      </View>
      <View style={styles.body}>
        <View style={styles.icon}><Ionicons name="search-outline" size={34} color="#7fb5ae" /></View>
        <Text style={[styles.heading, alignStart()]}>{t('searchCar.heading')}</Text>
        <Text style={styles.subtitle}>{t('searchCar.body')}</Text>
        <TextInput
          style={[styles.input, alignInput()]}
          placeholder={t('searchCar.placeholder')}
          placeholderTextColor="#4a8a82"
          value={plate}
          onChangeText={setPlate}
          autoCapitalize="characters"
          autoFocus
        />
        <Pressable style={[styles.button, !plate.trim() && styles.disabled]} disabled={!plate.trim()}>
          <Text style={[styles.buttonText, alignStart()]}>{t('searchCar.action')}</Text>
        </Pressable>
        <Text style={styles.note}>{t('searchCar.note')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#082926' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, fontFamily: FONT.bold, color: '#FFFFFF' },
  body: { padding: 28, alignItems: 'center', gap: 14 },
  icon: { width: 76, height: 76, borderRadius: 38, backgroundColor: 'rgba(127,181,174,0.1)', justifyContent: 'center', alignItems: 'center', marginTop: 48 },
  heading: { fontSize: 24, fontFamily: FONT.bold, color: '#FFFFFF', marginTop: 8 },
  subtitle: { fontSize: 14, fontFamily: FONT.regular, color: '#7fb5ae', textAlign: 'center' },
  input: { width: '100%', backgroundColor: '#0e3b33', borderWidth: 1, borderColor: '#1a5048', borderRadius: 14, paddingHorizontal: 18, paddingVertical: 16, color: '#FFFFFF', fontSize: 17, fontFamily: FONT.medium, letterSpacing: 2, marginTop: 12 },
  button: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 14, paddingVertical: 17, alignItems: 'center', marginTop: 4 },
  disabled: { opacity: 0.35 },
  buttonText: { fontSize: 16, fontFamily: FONT.bold, color: '#082926' },
  note: { fontSize: 12, fontFamily: FONT.regular, color: '#4a8a82', textAlign: 'center', lineHeight: 18, marginTop: 8 },
});