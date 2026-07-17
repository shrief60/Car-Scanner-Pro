import React, { useState } from 'react';
import {
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

export default function ScannerScreen() {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const botPad = insets.bottom + (Platform.OS === 'web' ? 34 : 0);

  async function handleBarcode({ data }: { data: string }) {
    if (scanned) return;
    setScanned(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      const parsed = JSON.parse(data);
      if (parsed.app === 'qar' && parsed.id) {
        router.push({
          pathname: '/scan/[id]',
          params: {
            id: parsed.id,
            plate: parsed.plate ?? '',
            type: parsed.type ?? '',
            color: parsed.color ?? '',
          },
        });
        return;
      }
    } catch {
      // not JSON, treat as plain text
    }

    // Unrecognized QR — go back
    router.back();
  }

  // Permission handling
  if (!permission) {
    return (
      <View
        style={[
          styles.center,
          { paddingTop: topPad, paddingBottom: botPad },
        ]}
      >
        <Text style={styles.permText}>جاري التحقق من الأذونات...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View
        style={[
          styles.center,
          { paddingTop: topPad, paddingBottom: botPad },
        ]}
      >
        <Ionicons name="camera-outline" size={64} color="#1a5048" />
        <Text style={styles.permTitle}>إذن الكاميرا مطلوب</Text>
        <Text style={styles.permSubtitle}>
          نحتاج إذن الكاميرا لمسح كود QR
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.permBtn,
            pressed && { opacity: 0.85 },
          ]}
          onPress={requestPermission}
        >
          <Text style={styles.permBtnText}>السماح بالوصول</Text>
        </Pressable>
        <Pressable style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelText}>إلغاء</Text>
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

      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Top bar */}
        <View style={[styles.topBar, { paddingTop: topPad + 8 }]}>
          <Pressable
            style={({ pressed }) => [
              styles.closeBtn,
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={26} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.scanTitle}>امسح كود QR</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Scan frame */}
        <View style={styles.frameArea}>
          <View style={styles.frame}>
            {/* Frame corners */}
            <View style={[styles.fc, styles.fcTL]} />
            <View style={[styles.fc, styles.fcTR]} />
            <View style={[styles.fc, styles.fcBL]} />
            <View style={[styles.fc, styles.fcBR]} />
          </View>
          <Text style={styles.hint}>وجّه الكاميرا نحو كود QR الخاص بالسيارة</Text>
        </View>

        {/* Bottom */}
        <View
          style={[styles.bottomArea, { paddingBottom: botPad + 16 }]}
        >
          {scanned && (
            <Pressable
              style={({ pressed }) => [
                styles.rescanBtn,
                pressed && { opacity: 0.85 },
              ]}
              onPress={() => setScanned(false)}
            >
              <Text style={styles.rescanText}>مسح مجدداً</Text>
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
    flex: 1,
    backgroundColor: '#082926',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  permText: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: '#7fb5ae',
  },
  permTitle: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  permSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#7fb5ae',
    textAlign: 'center',
  },
  permBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginTop: 8,
  },
  permBtnText: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: '#082926',
  },
  cancelBtn: { paddingVertical: 12 },
  cancelText: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    color: '#7fb5ae',
  },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: 'rgba(8,41,38,0.6)',
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
  },
  frameArea: {
    alignItems: 'center',
    gap: 20,
  },
  frame: {
    width: 240,
    height: 240,
    position: 'relative',
  },
  fc: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: '#FFFFFF',
  },
  fcTL: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 8 },
  fcTR: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 8 },
  fcBL: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 8 },
  fcBR: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 8 },
  hint: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    maxWidth: 240,
  },
  bottomArea: {
    alignItems: 'center',
    backgroundColor: 'rgba(8,41,38,0.6)',
    paddingTop: 16,
  },
  rescanBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  rescanText: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: '#082926',
  },
});
