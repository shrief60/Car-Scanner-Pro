import React, { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useCars } from '@/context/CarsContext';

const CAR_TYPES = [
  'Sedan', 'Hatchback', 'SUV', 'Pickup', 'Minivan', 'Coupe', 'Other',
];

const COLORS = [
  { label: 'White',  value: 'White',  hex: '#F5F5F5' },
  { label: 'Black',  value: 'Black',  hex: '#1a1a1a' },
  { label: 'Silver', value: 'Silver', hex: '#9e9e9e' },
  { label: 'Gray',   value: 'Gray',   hex: '#616161' },
  { label: 'Red',    value: 'Red',    hex: '#e53935' },
  { label: 'Blue',   value: 'Blue',   hex: '#1e88e5' },
  { label: 'Green',  value: 'Green',  hex: '#43a047' },
  { label: 'Brown',  value: 'Brown',  hex: '#795548' },
  { label: 'Yellow', value: 'Yellow', hex: '#fdd835' },
  { label: 'Orange', value: 'Orange', hex: '#fb8c00' },
];

export default function AddCarScreen() {
  const insets = useSafeAreaInsets();
  const { addCar } = useCars();

  const [plate, setPlate] = useState('');
  const [type, setType] = useState('');
  const [color, setColor] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const botPad = insets.bottom + (Platform.OS === 'web' ? 34 : 0);

  function validate() {
    const e: Record<string, string> = {};
    if (!plate.trim()) e.plate = 'License plate is required';
    return e;
  }

  async function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const car = await addCar({
      plate: plate.trim().toUpperCase(),
      type,
      color,
    });
    setLoading(false);
    router.replace({
      pathname: '/(main)/qr-display',
      params: { id: car.id, plate: car.plate, type: car.type, color: car.color },
    });
  }

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.title}>Add Car</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: botPad + 32 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Plate number */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>License Plate *</Text>
          <TextInput
            style={[styles.input, errors.plate && styles.inputError]}
            placeholder="e.g. ABC 1234"
            placeholderTextColor="#4a8a82"
            value={plate}
            onChangeText={t => {
              setPlate(t);
              setErrors(p => ({ ...p, plate: '' }));
            }}
            autoCapitalize="characters"
            autoFocus
          />
          {errors.plate ? (
            <Text style={styles.error}>{errors.plate}</Text>
          ) : null}
        </View>

        {/* Car type */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Car Type (optional)</Text>
          <View style={styles.chips}>
            {CAR_TYPES.map(t => (
              <Pressable
                key={t}
                style={({ pressed }) => [
                  styles.chip,
                  type === t && styles.chipSelected,
                  pressed && { opacity: 0.75 },
                ]}
                onPress={() => {
                  setType(type === t ? '' : t);
                  Haptics.selectionAsync();
                }}
              >
                <Text
                  style={[styles.chipText, type === t && styles.chipTextSelected]}
                >
                  {t}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Car color */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Car Color (optional)</Text>
          <View style={styles.colorGrid}>
            {COLORS.map(c => (
              <Pressable
                key={c.value}
                style={({ pressed }) => [
                  styles.colorItem,
                  color === c.value && styles.colorItemSelected,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={() => {
                  setColor(color === c.value ? '' : c.value);
                  Haptics.selectionAsync();
                }}
              >
                <View
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: c.hex },
                    color === c.value && styles.swatchSelected,
                  ]}
                />
                <Text style={styles.colorLabel}>{c.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Submit */}
        <Pressable
          style={({ pressed }) => [
            styles.button,
            !plate.trim() && styles.buttonDisabled,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleSubmit}
          disabled={loading || !plate.trim()}
        >
          {loading ? (
            <ActivityIndicator color="#082926" />
          ) : (
            <>
              <Ionicons name="qr-code" size={20} color="#082926" />
              <Text style={styles.buttonText}>Generate QR Code</Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#082926' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 28,
  },
  field: { gap: 10 },
  fieldLabel: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#7fb5ae',
  },
  input: {
    backgroundColor: '#0e3b33',
    borderWidth: 1,
    borderColor: '#1a5048',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  inputError: { borderColor: '#ef4444' },
  error: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#ef4444',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#0e3b33',
    borderWidth: 1,
    borderColor: '#1a5048',
  },
  chipSelected: { backgroundColor: '#FFFFFF', borderColor: '#FFFFFF' },
  chipText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#7fb5ae',
  },
  chipTextSelected: { color: '#082926' },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorItem: { alignItems: 'center', gap: 4, opacity: 0.75 },
  colorItemSelected: { opacity: 1 },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchSelected: {
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.15 }],
  },
  colorLabel: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: '#7fb5ae',
  },
  button: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.35 },
  buttonPressed: { opacity: 0.85 },
  buttonText: {
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
    color: '#082926',
  },
});
