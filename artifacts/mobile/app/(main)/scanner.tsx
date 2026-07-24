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
      setScanError((e as Error).message ?? 'Could not read this QR code');
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
        <Text style={styles.permTitle}>Camera Access Required</Text>
        <Text style={styles.permSubtitle}>We need camera access to scan QR codes</Text>
        <Pressable
          style={({ pressed }) => [styles.permBtn, pressed && { opacity: 0.85 }]}
          onPress={requestPermission}
        >
          <Text style={styles.permBtnText}>Allow Access</Text>
        </Pressable>
        <Pressable style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
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
          <Text style={styles.scanTitle}>Scan QR Code</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Frame */}
        <View style={styles.frameArea}>
          <View style={styles.frame}>
            <View style={[styles.fc, styles.fcTL]} />
            <View style={[styles.fc, styles.fcTR]} />
            <View style={[styles.fc, styles.fcBL]} />
            <View style={[styles.fc, styles.fcBR]} />
          </View>
          {resolving ? (
            <View style={styles.resolving}>
              <ActivityIndicator color="#FFFFFF" />
              <Text style={styles.hint}>Looking up car…</Text>
            </View>
          ) : (
            <Text style={styles.hint}>Point the camera at a Qar QR code</Text>
          )}
          {scanError ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color="#ef4444" />
              <Text style={styles.errorText}>{scanError}</Text>
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
              <Text style={styles.rescanText}>Scan Again</Text>
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
  permTitle: { fontSize: 22, fontFamily: 'Inter_700Bold', color: '#FFFFFF', textAlign: 'center' },
  permSubtitle: { fontSize: 14, fontFamily: 'Inter_400Regular', color: '#7fb5ae', textAlign: 'center' },
  permBtn: {
    backgroundColor: '#FFFFFF', borderRadius: 14,
    paddingVertical: 16, paddingHorizontal: 32, alignItems: 'center', marginTop: 8,
  },
  permBtnText: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#082926' },
  cancelBtn: { paddingVertical: 12 },
  cancelText: { fontSize: 15, fontFamily: 'Inter_500Medium', color: '#7fb5ae' },
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
  scanTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: '#FFFFFF' },
  frameArea: { alignItems: 'center', gap: 20 },
  frame: { width: 240, height: 240, position: 'relative' },
  fc: { position: 'absolute', width: 32, height: 32, borderColor: '#FFFFFF' },
  fcTL: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 8 },
  fcTR: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 8 },
  fcBL: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 8 },
  fcBR: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 8 },
  resolving: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  hint: {
    fontSize: 14, fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.85)', textAlign: 'center', maxWidth: 240,
  },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(239,68,68,0.85)', borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 14,
  },
  errorText: { fontSize: 13, fontFamily: 'Inter_400Regular', color: '#FFFFFF', flex: 1 },
  bottomArea: {
    alignItems: 'center', backgroundColor: 'rgba(8,41,38,0.6)', paddingTop: 16,
  },
  rescanBtn: {
    backgroundColor: '#FFFFFF', borderRadius: 12,
    paddingVertical: 14, paddingHorizontal: 32,
  },
  rescanText: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#082926' },
});
