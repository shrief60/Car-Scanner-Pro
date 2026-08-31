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
import { FONT } from '@/lib/typography';
import { mirrorIcon } from '@/lib/rtl';
import { alignStart } from '@/lib/direction';
import { useLocale } from '@/context/LocaleContext';

const QR_SIZE = 240;

export default function QRDisplayScreen() {
  const { t } = useLocale();
  const insets = useSafeAreaInsets();
  const { plate, make, model, color, qrCode } =
    useLocalSearchParams<{
      id: string;
      plate: string;
      make: string;
      model: string;
      color: string;
      qrCode: string;
    }>();

  // The QR code encodes the qrCode string from the server.
  // Strangers scan this → the app calls GET /api/scan/:qrCode
  const qrValue = qrCode ?? '';

  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const botPad = insets.bottom + (Platform.OS === 'web' ? 34 : 0);

  const carDesc = [make, model].filter(Boolean).join(' ');

  async function handleShare() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(t('qr.shareTitle'), t('qr.shareBody'), [{ text: t('common.ok') }]);
  }

  async function handleDownload() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(t('qr.downloadTitle'), t('qr.downloadBody'), [{ text: t('common.ok') }]);
  }

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
          onPress={() => router.back()}
        >
          <Ionicons name={mirrorIcon('arrow-back')} size={24} color="#FFFFFF" />
        </Pressable>
        <Text style={[styles.title, alignStart()]}>{t('qr.title')}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: botPad + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Car info */}
        <View style={styles.carInfo}>
          <Text style={[styles.plateLabel, alignStart()]}>{t('qr.licensePlate')}</Text>
          <Text style={[styles.plateValue, alignStart()]}>{plate}</Text>
          {carDesc ? <Text style={[styles.carMeta, alignStart()]}>{carDesc}</Text> : null}
          {color ? <Text style={[styles.carMeta, alignStart()]}>{color}</Text> : null}
        </View>

        {/* QR Code */}
        <View style={styles.qrWrapper}>
          <View style={styles.qrCard}>
            {qrValue ? (
              <View style={styles.qrContainer}>
                <QRCode
                  value={qrValue}
                  size={QR_SIZE}
                  backgroundColor="#FFFFFF"
                  color="#082926"
                />
              </View>
            ) : (
              <View style={[styles.qrContainer, styles.qrPlaceholder]}>
                <Ionicons name="qr-code" size={80} color="#ccc" />
                <Text style={[styles.qrMissing, alignStart()]}>{t('qr.notAvailable')}</Text>
              </View>
            )}
            <View style={[styles.corner, styles.cornerTS]} />
            <View style={[styles.corner, styles.cornerTE]} />
            <View style={[styles.corner, styles.cornerBS]} />
            <View style={[styles.corner, styles.cornerBE]} />
          </View>
          <Text style={styles.qrHint}>
            {t('qr.attachHint')}
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [styles.actionBtn, styles.actionBtnPrimary, pressed && { opacity: 0.85 }]}
            onPress={handleDownload}
          >
            <Ionicons name="download-outline" size={22} color="#082926" />
            <Text style={[styles.actionBtnTextPrimary, alignStart()]}>{t('qr.download')}</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.actionBtn, styles.actionBtnSecondary, pressed && { opacity: 0.85 }]}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={22} color="#FFFFFF" />
            <Text style={[styles.actionBtnTextSecondary, alignStart()]}>{t('qr.share')}</Text>
          </Pressable>
        </View>

        {/* Info box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#7fb5ae" />
          <Text style={[styles.infoText, alignStart()]}>
            {t('qr.privacyNote')}
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [styles.homeBtn, pressed && { opacity: 0.7 }]}
          onPress={() => router.replace('/(main)/home')}
        >
          <Text style={[styles.homeBtnText, alignStart()]}>{t('qr.backHome')}</Text>
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
  scroll: { paddingHorizontal: 24, paddingTop: 8, gap: 28, alignItems: 'center' },
  carInfo: { alignItems: 'center', gap: 4 },
  plateLabel: { fontSize: 13, fontFamily: FONT.regular, color: '#7fb5ae' },
  plateValue: { fontSize: 32, fontFamily: FONT.bold, color: '#FFFFFF', letterSpacing: 4 },
  carMeta: { fontSize: 15, fontFamily: FONT.regular, color: '#7fb5ae' },
  qrWrapper: { alignItems: 'center', gap: 14 },
  qrCard: {
    backgroundColor: '#FFFFFF', padding: 20, borderRadius: 24, position: 'relative',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 12,
  },
  qrContainer: { borderRadius: 8, overflow: 'hidden' },
  qrPlaceholder: {
    width: QR_SIZE, height: QR_SIZE,
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  qrMissing: { fontSize: 12, color: '#999' },
  corner: { position: 'absolute', width: 24, height: 24, borderColor: '#082926' },
  // Logical on BOTH axes. Mixing physical `left` with `borderLeftWidth` is what pulls
  // these brackets apart under RTL: the position mirrors and the border does not, so a
  // top-left bracket ends up on the right still drawing its left edge.
  cornerTS: { top: 8, start: 8, borderTopWidth: 3, borderStartWidth: 3, borderTopStartRadius: 6 },
  cornerTE: { top: 8, end: 8, borderTopWidth: 3, borderEndWidth: 3, borderTopEndRadius: 6 },
  cornerBS: { bottom: 8, start: 8, borderBottomWidth: 3, borderStartWidth: 3, borderBottomStartRadius: 6 },
  cornerBE: { bottom: 8, end: 8, borderBottomWidth: 3, borderEndWidth: 3, borderBottomEndRadius: 6 },
  qrHint: {
    fontSize: 13, fontFamily: FONT.regular, color: '#7fb5ae',
    textAlign: 'center', maxWidth: 260, lineHeight: 20,
  },
  actions: { flexDirection: 'row', gap: 12, width: '100%' },
  actionBtn: {
    flex: 1, borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8,
  },
  actionBtnPrimary: { backgroundColor: '#FFFFFF' },
  actionBtnSecondary: { backgroundColor: '#0e3b33', borderWidth: 1, borderColor: '#1a5048' },
  actionBtnTextPrimary: { fontSize: 15, fontFamily: FONT.bold, color: '#082926' },
  actionBtnTextSecondary: { fontSize: 15, fontFamily: FONT.bold, color: '#FFFFFF' },
  infoBox: {
    backgroundColor: '#0e3b33', borderRadius: 14, padding: 16,
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    borderWidth: 1, borderColor: '#1a5048', width: '100%',
  },
  infoText: { flex: 1, fontSize: 13, fontFamily: FONT.regular, color: '#7fb5ae', lineHeight: 20 },
  homeBtn: { paddingVertical: 12, paddingHorizontal: 24 },
  homeBtnText: { fontSize: 15, fontFamily: FONT.medium, color: '#7fb5ae', textDecorationLine: 'underline' },
});
