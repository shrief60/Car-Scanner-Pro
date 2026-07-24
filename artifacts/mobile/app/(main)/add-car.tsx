import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
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
import * as ImagePicker from 'expo-image-picker';
import { useCars } from '@/context/CarsContext';

const COLORS = [
  { label: 'White',  hex: '#F5F5F5' },
  { label: 'Black',  hex: '#1a1a1a' },
  { label: 'Silver', hex: '#9e9e9e' },
  { label: 'Gray',   hex: '#616161' },
  { label: 'Red',    hex: '#e53935' },
  { label: 'Blue',   hex: '#1e88e5' },
  { label: 'Green',  hex: '#43a047' },
  { label: 'Brown',  hex: '#795548' },
  { label: 'Yellow', hex: '#fdd835' },
  { label: 'Orange', hex: '#fb8c00' },
];

interface PickedPhoto {
  uri: string;
  name: string;
  type: string;
}

export default function AddCarScreen() {
  const insets = useSafeAreaInsets();
  const { addCar } = useCars();

  const [plate, setPlate] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [photo, setPhoto] = useState<PickedPhoto | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const botPad = insets.bottom + (Platform.OS === 'web' ? 34 : 0);

  // ── Image picker ────────────────────────────────────────────────────────────

  async function pickFromGallery() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setErrors(p => ({ ...p, photo: 'Gallery permission is required' }));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const ext = asset.uri.split('.').pop() ?? 'jpg';
      setPhoto({ uri: asset.uri, name: `car_photo.${ext}`, type: asset.mimeType ?? `image/${ext}` });
      setErrors(p => ({ ...p, photo: '' }));
      Haptics.selectionAsync();
    }
  }

  async function pickFromCamera() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      setErrors(p => ({ ...p, photo: 'Camera permission is required' }));
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const ext = asset.uri.split('.').pop() ?? 'jpg';
      setPhoto({ uri: asset.uri, name: `car_photo.${ext}`, type: asset.mimeType ?? `image/${ext}` });
      setErrors(p => ({ ...p, photo: '' }));
      Haptics.selectionAsync();
    }
  }

  function removePhoto() {
    setPhoto(null);
    Haptics.selectionAsync();
  }

  // ── Submit ──────────────────────────────────────────────────────────────────

  async function handleSubmit() {
    if (!plate.trim()) {
      setErrors({ plate: 'License plate is required' });
      return;
    }
    setErrors({});
    setLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const car = await addCar({
        plate_number: plate.trim().toUpperCase(),
        make: make.trim() || undefined,
        model: model.trim() || undefined,
        color: color || undefined,
        photo: photo ?? undefined,
      });
      router.replace({
        pathname: '/(main)/qr-display',
        params: {
          id: String(car.id),
          plate: car.plate_number,
          make: car.make ?? '',
          model: car.model ?? '',
          color: car.color ?? '',
          qrCode: car.qr_code,
        },
      });
    } catch (e: unknown) {
      setErrors({ general: (e as Error).message ?? 'Failed to create car' });
    } finally {
      setLoading(false);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

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
        {/* ── Car photo ─────────────────────────────────────────────────────── */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Car Photo (optional)</Text>

          {photo ? (
            /* Preview with remove button */
            <View style={styles.photoPreviewWrapper}>
              <Image source={{ uri: photo.uri }} style={styles.photoPreview} resizeMode="cover" />
              <Pressable style={styles.removePhotoBtn} onPress={removePhoto}>
                <Ionicons name="close-circle" size={28} color="#ef4444" />
              </Pressable>
              {/* Re-pick overlay */}
              <Pressable style={styles.rePickOverlay} onPress={pickFromGallery}>
                <Ionicons name="pencil" size={16} color="#FFFFFF" />
                <Text style={styles.rePickText}>Change</Text>
              </Pressable>
            </View>
          ) : (
            /* Picker buttons */
            <View style={styles.photoPickRow}>
              <Pressable
                style={({ pressed }) => [styles.photoPickBtn, pressed && { opacity: 0.75 }]}
                onPress={pickFromGallery}
              >
                <Ionicons name="images-outline" size={26} color="#7fb5ae" />
                <Text style={styles.photoPickLabel}>Gallery</Text>
              </Pressable>

              <View style={styles.photoPickDivider} />

              <Pressable
                style={({ pressed }) => [styles.photoPickBtn, pressed && { opacity: 0.75 }]}
                onPress={pickFromCamera}
              >
                <Ionicons name="camera-outline" size={26} color="#7fb5ae" />
                <Text style={styles.photoPickLabel}>Camera</Text>
              </Pressable>
            </View>
          )}

          {errors.photo ? <Text style={styles.error}>{errors.photo}</Text> : null}
        </View>

        {/* ── License plate ─────────────────────────────────────────────────── */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>License Plate *</Text>
          <TextInput
            style={[styles.input, errors.plate && styles.inputError]}
            placeholder="e.g. ABC 1234"
            placeholderTextColor="#4a8a82"
            value={plate}
            onChangeText={t => { setPlate(t); setErrors(p => ({ ...p, plate: '' })); }}
            autoCapitalize="characters"
            autoFocus
          />
          {errors.plate ? <Text style={styles.error}>{errors.plate}</Text> : null}
        </View>

        {/* ── Make ─────────────────────────────────────────────────────────── */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Make (Brand)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Toyota, Kia, Hyundai"
            placeholderTextColor="#4a8a82"
            value={make}
            onChangeText={setMake}
            autoCapitalize="words"
          />
        </View>

        {/* ── Model ────────────────────────────────────────────────────────── */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Model</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Corolla, Sportage, i10"
            placeholderTextColor="#4a8a82"
            value={model}
            onChangeText={setModel}
            autoCapitalize="words"
          />
        </View>

        {/* ── Color ────────────────────────────────────────────────────────── */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Color (optional)</Text>
          <View style={styles.colorGrid}>
            {COLORS.map(c => (
              <Pressable
                key={c.label}
                style={({ pressed }) => [
                  styles.colorItem,
                  color === c.label && styles.colorItemSelected,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={() => {
                  setColor(color === c.label ? '' : c.label);
                  Haptics.selectionAsync();
                }}
              >
                <View
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: c.hex },
                    color === c.label && styles.swatchSelected,
                  ]}
                />
                <Text style={styles.colorLabel}>{c.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── General error ─────────────────────────────────────────────────── */}
        {errors.general ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color="#ef4444" />
            <Text style={styles.errorGeneral}>{errors.general}</Text>
          </View>
        ) : null}

        {/* ── Submit ────────────────────────────────────────────────────────── */}
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
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12,
  },
  backBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center', alignItems: 'center',
  },
  title: { fontSize: 20, fontFamily: 'Inter_700Bold', color: '#FFFFFF' },
  scroll: { paddingHorizontal: 20, paddingTop: 8, gap: 24 },
  field: { gap: 10 },
  fieldLabel: { fontSize: 14, fontFamily: 'Inter_500Medium', color: '#7fb5ae' },

  // Photo picker
  photoPickRow: {
    flexDirection: 'row',
    backgroundColor: '#0e3b33',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1a5048',
    overflow: 'hidden',
    height: 110,
  },
  photoPickBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  photoPickDivider: { width: 1, backgroundColor: '#1a5048' },
  photoPickLabel: { fontSize: 13, fontFamily: 'Inter_500Medium', color: '#7fb5ae' },

  // Photo preview
  photoPreviewWrapper: {
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  photoPreview: { width: '100%', height: '100%' },
  removePhotoBtn: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 14,
  },
  rePickOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10,
  },
  rePickText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: '#FFFFFF' },

  // Text inputs
  input: {
    backgroundColor: '#0e3b33', borderWidth: 1, borderColor: '#1a5048',
    borderRadius: 14, paddingHorizontal: 18, paddingVertical: 16,
    fontSize: 16, fontFamily: 'Inter_500Medium', color: '#FFFFFF',
  },
  inputError: { borderColor: '#ef4444' },
  error: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#ef4444' },

  // Color swatches
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  colorItem: { alignItems: 'center', gap: 4, opacity: 0.75 },
  colorItemSelected: { opacity: 1 },
  colorSwatch: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 2, borderColor: 'transparent',
  },
  swatchSelected: { borderColor: '#FFFFFF', transform: [{ scale: 1.15 }] },
  colorLabel: { fontSize: 11, fontFamily: 'Inter_400Regular', color: '#7fb5ae' },

  // General error
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)',
  },
  errorGeneral: { flex: 1, fontSize: 13, fontFamily: 'Inter_400Regular', color: '#ef4444' },

  // Submit button
  button: {
    backgroundColor: '#FFFFFF', borderRadius: 14, paddingVertical: 18,
    alignItems: 'center', flexDirection: 'row', justifyContent: 'center',
    gap: 8, marginTop: 8,
  },
  buttonDisabled: { opacity: 0.35 },
  buttonPressed: { opacity: 0.85 },
  buttonText: { fontSize: 17, fontFamily: 'Inter_700Bold', color: '#082926' },
});
