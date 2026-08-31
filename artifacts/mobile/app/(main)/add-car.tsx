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
import { useLocale } from '@/context/LocaleContext';
import type { TranslationKey } from '@/i18n';
import { FONT } from '@/lib/typography';
import { mirrorIcon } from '@/lib/rtl';
import { alignInput, alignStart } from '@/lib/direction';

/**
 * `key` drives the translated label and the selection state; `apiValue` is what is
 * POSTed. Previously the English word was all three at once, so translating the label
 * would silently have changed the payload and broken car creation.
 */
const COLORS = [
  { key: 'white',  apiValue: 'White',  hex: '#F5F5F5' },
  { key: 'black',  apiValue: 'Black',  hex: '#1a1a1a' },
  { key: 'silver', apiValue: 'Silver', hex: '#9e9e9e' },
  { key: 'gray',   apiValue: 'Gray',   hex: '#616161' },
  { key: 'red',    apiValue: 'Red',    hex: '#e53935' },
  { key: 'blue',   apiValue: 'Blue',   hex: '#1e88e5' },
  { key: 'green',  apiValue: 'Green',  hex: '#43a047' },
  { key: 'brown',  apiValue: 'Brown',  hex: '#795548' },
  { key: 'yellow', apiValue: 'Yellow', hex: '#fdd835' },
  { key: 'orange', apiValue: 'Orange', hex: '#fb8c00' },
] as const;

interface PickedPhoto {
  uri: string;
  name: string;
  type: string;
}

export default function AddCarScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useLocale();
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
      setErrors(p => ({ ...p, photo: t('addCar.galleryPermission') }));
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
      setErrors(p => ({ ...p, photo: t('addCar.cameraPermission') }));
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
      setErrors({ plate: t('addCar.plateRequired') });
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
        // Send the stable English value, never the translated label.
        color: COLORS.find(c => c.key === color)?.apiValue,
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
      setErrors({ general: (e as Error).message ?? t('addCar.createFailed') });
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
          <Ionicons name={mirrorIcon('arrow-back')} size={24} color="#FFFFFF" />
        </Pressable>
        <Text style={[styles.title, alignStart()]}>{t('addCar.title')}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: botPad + 32 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Car photo ─────────────────────────────────────────────────────── */}
        <View style={styles.field}>
          <Text style={[styles.fieldLabel, alignStart()]}>{t('addCar.photo')}</Text>

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
                <Text style={[styles.rePickText, alignStart()]}>{t('addCar.change')}</Text>
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
                <Text style={[styles.photoPickLabel, alignStart()]}>{t('addCar.gallery')}</Text>
              </Pressable>

              <View style={styles.photoPickDivider} />

              <Pressable
                style={({ pressed }) => [styles.photoPickBtn, pressed && { opacity: 0.75 }]}
                onPress={pickFromCamera}
              >
                <Ionicons name="camera-outline" size={26} color="#7fb5ae" />
                <Text style={[styles.photoPickLabel, alignStart()]}>{t('addCar.camera')}</Text>
              </Pressable>
            </View>
          )}

          {errors.photo ? <Text style={[styles.error, alignStart()]}>{errors.photo}</Text> : null}
        </View>

        {/* ── License plate ─────────────────────────────────────────────────── */}
        <View style={styles.field}>
          <Text style={[styles.fieldLabel, alignStart()]}>{t('addCar.plate')}</Text>
          <TextInput
            style={[styles.input, alignInput(), errors.plate && styles.inputError]}
            placeholder={t('addCar.platePlaceholder')}
            placeholderTextColor="#4a8a82"
            value={plate}
            onChangeText={next => { setPlate(next); setErrors(p => ({ ...p, plate: '' })); }}
            autoCapitalize="characters"
            autoFocus
          />
          {errors.plate ? <Text style={[styles.error, alignStart()]}>{errors.plate}</Text> : null}
        </View>

        {/* ── Make ─────────────────────────────────────────────────────────── */}
        <View style={styles.field}>
          <Text style={[styles.fieldLabel, alignStart()]}>{t('addCar.make')}</Text>
          <TextInput
            style={[styles.input, alignInput()]}
            placeholder={t('addCar.makePlaceholder')}
            placeholderTextColor="#4a8a82"
            value={make}
            onChangeText={setMake}
            autoCapitalize="words"
          />
        </View>

        {/* ── Model ────────────────────────────────────────────────────────── */}
        <View style={styles.field}>
          <Text style={[styles.fieldLabel, alignStart()]}>{t('addCar.model')}</Text>
          <TextInput
            style={[styles.input, alignInput()]}
            placeholder={t('addCar.modelPlaceholder')}
            placeholderTextColor="#4a8a82"
            value={model}
            onChangeText={setModel}
            autoCapitalize="words"
          />
        </View>

        {/* ── Color ────────────────────────────────────────────────────────── */}
        <View style={styles.field}>
          <Text style={[styles.fieldLabel, alignStart()]}>{t('addCar.color')}</Text>
          <View style={styles.colorGrid}>
            {COLORS.map(c => (
              <Pressable
                key={c.key}
                style={({ pressed }) => [
                  styles.colorItem,
                  color === c.key && styles.colorItemSelected,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={() => {
                  setColor(color === c.key ? '' : c.key);
                  Haptics.selectionAsync();
                }}
              >
                <View
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: c.hex },
                    color === c.key && styles.swatchSelected,
                  ]}
                />
                <Text style={[styles.colorLabel, alignStart()]}>{t(`colors.${c.key}` as TranslationKey)}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── General error ─────────────────────────────────────────────────── */}
        {errors.general ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color="#ef4444" />
            <Text style={[styles.errorGeneral, alignStart()]}>{errors.general}</Text>
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
              <Text style={[styles.buttonText, alignStart()]}>{t('addCar.generate')}</Text>
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
  title: { fontSize: 20, fontFamily: FONT.bold, color: '#FFFFFF' },
  scroll: { paddingHorizontal: 20, paddingTop: 8, gap: 24 },
  field: { gap: 10 },
  fieldLabel: { fontSize: 14, fontFamily: FONT.medium, color: '#7fb5ae' },

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
  photoPickLabel: { fontSize: 13, fontFamily: FONT.medium, color: '#7fb5ae' },

  // Photo preview
  photoPreviewWrapper: {
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  photoPreview: { width: '100%', height: '100%' },
  removePhotoBtn: {
    position: 'absolute', top: 8, end: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 14,
  },
  rePickOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10,
  },
  rePickText: { fontSize: 13, fontFamily: FONT.medium, color: '#FFFFFF' },

  // Text inputs
  input: {
    backgroundColor: '#0e3b33', borderWidth: 1, borderColor: '#1a5048',
    borderRadius: 14, paddingHorizontal: 18, paddingVertical: 16,
    fontSize: 16, fontFamily: FONT.medium, color: '#FFFFFF',
  },
  inputError: { borderColor: '#ef4444' },
  error: { fontSize: 12, fontFamily: FONT.regular, color: '#ef4444' },

  // Color swatches
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  colorItem: { alignItems: 'center', gap: 4, opacity: 0.75 },
  colorItemSelected: { opacity: 1 },
  colorSwatch: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 2, borderColor: 'transparent',
  },
  swatchSelected: { borderColor: '#FFFFFF', transform: [{ scale: 1.15 }] },
  colorLabel: { fontSize: 11, fontFamily: FONT.regular, color: '#7fb5ae' },

  // General error
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)',
  },
  errorGeneral: { flex: 1, fontSize: 13, fontFamily: FONT.regular, color: '#ef4444' },

  // Submit button
  button: {
    backgroundColor: '#FFFFFF', borderRadius: 14, paddingVertical: 18,
    alignItems: 'center', flexDirection: 'row', justifyContent: 'center',
    gap: 8, marginTop: 8,
  },
  buttonDisabled: { opacity: 0.35 },
  buttonPressed: { opacity: 0.85 },
  buttonText: { fontSize: 17, fontFamily: FONT.bold, color: '#082926' },
});
