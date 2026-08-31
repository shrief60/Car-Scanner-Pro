import React, { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { scanQrCode } from '@/services/scan';
import { FONT } from '@/lib/typography';
import { alignStart } from '@/lib/direction';
import { useLocale } from '@/context/LocaleContext';

/**
 * Extract the qrCode token from whatever the QR encodes.
 * Handles both bare UUIDs and full URLs like
 * https://qar-4uh5.onrender.com/api/scan/<qrCode>
 */
function extractQrCode(raw: string): string {
  try {
    const url = new URL(raw);
    const parts = url.pathname.split('/').filter(Boolean);
    // pathname: /api/scan/<qrCode>
    const scanIdx = parts.indexOf('scan');
    if (scanIdx !== -1 && parts[scanIdx + 1]) return parts[scanIdx + 1];
  } catch {
    // not a URL — use raw value directly
  }
  return raw.trim();
}

export default function ScannerScreen() {
  const { t } = useLocale();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [scanError, setScanError] = useState('');

  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const botPad = insets.bottom + (Platform.OS === 'web' ? 34 : 0);

  async function handleBarcode({ data }: { data: string }) {
    if (scanned || resolving) return;
    setScanned(true);
    setResolving(true);
    setScanError('');
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const qrCode = extractQrCode(data);
    try {
      const car = await scanQrCode(qrCode);
      router.push({
        pathname: '/scan/[id]',
        params: {
          id: String(car.id),
          qrCode,
          plate: car.plate_number ?? '',
          make: car.make ?? '',
          model: car.model ?? '',
          color: car.color ?? '',
        },
      });
    } catch (e: unknown) {
      setScanError((e as Error).message ?? t('scanner.unreadable'));
      setScanned(false);
    } finally {
      setResolving(false);
    }
  }

  if (!permission) {
    return (
      <View style={[styles.center, { paddingTop: topPad, paddingBottom: botPad }]}>
        <ActivityIndicator size="large" color="#7fb5ae" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.center, { paddingTop: topPad, paddingBottom: botPad }]}>
        <Ionicons name="camera-outline" size={64} color="#1a5048" />
        <Text style={styles.permTitle}>{t('scanner.permissionTitle')}</Text>
        <Text style={styles.permSubtitle}>{t('scanner.permissionBody')}</Text>
        <Pressable
          style={({ pressed }) => [styles.permBtn, pressed && { opacity: 0.85 }]}
          onPress={requestPermission}
        >
          <Text style={[styles.permBtnText, alignStart()]}>{t('scanner.allow')}</Text>
        </Pressable>
        <Pressable style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={[styles.cancelText, alignStart()]}>{t('common.cancel')}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        onBarcodeScanned={handleBarcode}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      />

      <View style={styles.overlay}>
        {/* Top bar */}
        <View style={[styles.topBar, { paddingTop: topPad + 8 }]}>
          <Pressable
            style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.7 }]}
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={26} color="#FFFFFF" />
          </Pressable>
          <Text style={[styles.scanTitle, alignStart()]}>{t('scanner.title')}</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Frame */}
        <View style={styles.frameArea}>
          <View style={styles.frame}>
            <View style={[styles.fc, styles.fcTS]} />
            <View style={[styles.fc, styles.fcTE]} />
            <View style={[styles.fc, styles.fcBS]} />
            <View style={[styles.fc, styles.fcBE]} />
          </View>
          {resolving ? (
            <View style={styles.resolving}>
              <ActivityIndicator color="#FFFFFF" />
              <Text style={styles.hint}>{t('scanner.looking')}</Text>
            </View>
          ) : (
            <Text style={styles.hint}>{t('scanner.aim')}</Text>
          )}
          {scanError ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color="#ef4444" />
              <Text style={[styles.errorText, alignStart()]}>{scanError}</Text>
            </View>
          ) : null}
        </View>

        {/* Bottom */}
        <View style={[styles.bottomArea, { paddingBottom: botPad + 16 }]}>
          {scanned && !resolving && (
            <Pressable
              style={({ pressed }) => [styles.rescanBtn, pressed && { opacity: 0.85 }]}
              onPress={() => { setScanned(false); setScanError(''); }}
            >
              <Text style={[styles.rescanText, alignStart()]}>{t('scanner.scanAgain')}</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: {
    flex: 1, backgroundColor: '#082926',
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 16,
  },
  permTitle: { fontSize: 22, fontFamily: FONT.bold, color: '#FFFFFF', textAlign: 'center' },
  permSubtitle: { fontSize: 14, fontFamily: FONT.regular, color: '#7fb5ae', textAlign: 'center' },
  permBtn: {
    backgroundColor: '#FFFFFF', borderRadius: 14,
    paddingVertical: 16, paddingHorizontal: 32, alignItems: 'center', marginTop: 8,
  },
  permBtnText: { fontSize: 16, fontFamily: FONT.bold, color: '#082926' },
  cancelBtn: { paddingVertical: 12 },
  cancelText: { fontSize: 15, fontFamily: FONT.medium, color: '#7fb5ae' },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between' },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 16, backgroundColor: 'rgba(8,41,38,0.6)',
  },
  closeBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  scanTitle: { fontSize: 18, fontFamily: FONT.bold, color: '#FFFFFF' },
  frameArea: { alignItems: 'center', gap: 20 },
  frame: { width: 240, height: 240, position: 'relative' },
  fc: { position: 'absolute', width: 32, height: 32, borderColor: '#FFFFFF' },
  // Logical on BOTH axes — see the note on qr-display's corners. A physical position
  // with a physical border comes apart the moment the layout mirrors.
  fcTS: { top: 0, start: 0, borderTopWidth: 3, borderStartWidth: 3, borderTopStartRadius: 8 },
  fcTE: { top: 0, end: 0, borderTopWidth: 3, borderEndWidth: 3, borderTopEndRadius: 8 },
  fcBS: { bottom: 0, start: 0, borderBottomWidth: 3, borderStartWidth: 3, borderBottomStartRadius: 8 },
  fcBE: { bottom: 0, end: 0, borderBottomWidth: 3, borderEndWidth: 3, borderBottomEndRadius: 8 },
  resolving: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  hint: {
    fontSize: 14, fontFamily: FONT.regular,
    color: 'rgba(255,255,255,0.85)', textAlign: 'center', maxWidth: 240,
  },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(239,68,68,0.85)', borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 14,
  },
  errorText: { fontSize: 13, fontFamily: FONT.regular, color: '#FFFFFF', flex: 1 },
  bottomArea: {
    alignItems: 'center', backgroundColor: 'rgba(8,41,38,0.6)', paddingTop: 16,
  },
  rescanBtn: {
    backgroundColor: '#FFFFFF', borderRadius: 12,
    paddingVertical: 14, paddingHorizontal: 32,
  },
  rescanText: { fontSize: 16, fontFamily: FONT.bold, color: '#082926' },
});
