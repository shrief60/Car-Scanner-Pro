import React from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import QRCode from 'react-native-qrcode-svg';

const QR_SIZE = 240;

export default function QRDisplayScreen() {
  const insets = useSafeAreaInsets();
  const { id, plate, type, color } =
    useLocalSearchParams<{
      id: string;
      plate: string;
      type: string;
      color: string;
    }>();

  const qrValue = JSON.stringify({
    app: 'qar',
    id: id ?? '',
    plate: plate ?? '',
    type: type ?? '',
    color: color ?? '',
  });

  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const botPad = insets.bottom + (Platform.OS === 'web' ? 34 : 0);

  async function handleShare() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Share QR',
      'In the full version you can download and share your car QR code',
      [{ text: 'OK' }],
    );
  }

  async function handleDownload() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Download QR',
      'In the full version you can download the QR code as an image and print it for your car',
      [{ text: 'OK' }],
    );
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
        <Text style={styles.title}>QR Code</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: botPad + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Car info */}
        <View style={styles.carInfo}>
          <Text style={styles.plateLabel}>License Plate</Text>
          <Text style={styles.plateValue}>{plate}</Text>
          {(type || color) ? (
            <Text style={styles.carMeta}>
              {[type, color].filter(Boolean).join(' · ')}
            </Text>
          ) : null}
        </View>

        {/* QR Code */}
        <View style={styles.qrWrapper}>
          <View style={styles.qrCard}>
            <View style={styles.qrContainer}>
              <QRCode
                value={qrValue}
                size={QR_SIZE}
                backgroundColor="#FFFFFF"
                color="#082926"
              />
            </View>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
          <Text style={styles.qrHint}>
            Attach this code to your car to receive anonymous alerts
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [
              styles.actionBtn,
              styles.actionBtnPrimary,
              pressed && { opacity: 0.85 },
            ]}
            onPress={handleDownload}
          >
            <Ionicons name="download-outline" size={22} color="#082926" />
            <Text style={styles.actionBtnTextPrimary}>Download QR</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.actionBtn,
              styles.actionBtnSecondary,
              pressed && { opacity: 0.85 },
            ]}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={22} color="#FFFFFF" />
            <Text style={styles.actionBtnTextSecondary}>Share</Text>
          </Pressable>
        </View>

        {/* Info box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#7fb5ae" />
          <Text style={styles.infoText}>
            When someone scans this code they will see options to send you an
            alert — your phone number stays completely hidden
          </Text>
        </View>

        {/* Go home */}
        <Pressable
          style={({ pressed }) => [styles.homeBtn, pressed && { opacity: 0.7 }]}
          onPress={() => router.replace('/(main)/home')}
        >
          <Text style={styles.homeBtnText}>Back to Home</Text>
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
    paddingHorizontal: 24,
    paddingTop: 8,
    gap: 28,
    alignItems: 'center',
  },
  carInfo: { alignItems: 'center', gap: 4 },
  plateLabel: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#7fb5ae',
  },
  plateValue: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
    letterSpacing: 4,
  },
  carMeta: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: '#7fb5ae',
  },
  qrWrapper: { alignItems: 'center', gap: 14 },
  qrCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 24,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  qrContainer: { borderRadius: 8, overflow: 'hidden' },
  corner: { position: 'absolute', width: 24, height: 24, borderColor: '#082926' },
  cornerTL: { top: 8, left: 8, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 6 },
  cornerTR: { top: 8, right: 8, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 6 },
  cornerBL: { bottom: 8, left: 8, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 6 },
  cornerBR: { bottom: 8, right: 8, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 6 },
  qrHint: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#7fb5ae',
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 20,
  },
  actions: { flexDirection: 'row', gap: 12, width: '100%' },
  actionBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  actionBtnPrimary: { backgroundColor: '#FFFFFF' },
  actionBtnSecondary: {
    backgroundColor: '#0e3b33',
    borderWidth: 1,
    borderColor: '#1a5048',
  },
  actionBtnTextPrimary: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    color: '#082926',
  },
  actionBtnTextSecondary: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
  },
  infoBox: {
    backgroundColor: '#0e3b33',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#1a5048',
    width: '100%',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#7fb5ae',
    lineHeight: 20,
  },
  homeBtn: { paddingVertical: 12, paddingHorizontal: 24 },
  homeBtnText: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    color: '#7fb5ae',
    textDecorationLine: 'underline',
  },
});
