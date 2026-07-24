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
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withSequence,
} from 'react-native-reanimated';
import { sendAlert, AlertType } from '@/services/scan';

const ALERTS: { id: AlertType; icon: string; label: string; description: string; color: string }[] = [
  { id: 'double_parked', icon: 'car-sport',  label: 'Blocking My Car',  description: 'This car is blocking me in',     color: '#1e6b60' },
  { id: 'lights_on',    icon: 'flash',       label: 'Lights Are On',    description: 'Car headlights are still on',    color: '#d97706' },
  { id: 'danger',       icon: 'warning',     label: 'Danger Nearby',    description: 'There is a hazard near this car', color: '#ef4444' },
];

function AlertButton({
  item, onPress, sent, loading,
}: {
  item: typeof ALERTS[0];
  onPress: () => void;
  sent: boolean;
  loading: boolean;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  async function handlePress() {
    scale.value = withSequence(withSpring(0.94, { damping: 10 }), withSpring(1, { damping: 10 }));
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onPress();
  }

  return (
    <Animated.View style={[animStyle, { width: '100%' }]}>
      <Pressable
        style={({ pressed }) => [styles.alertBtn, sent && styles.alertBtnSent, pressed && { opacity: 0.85 }]}
        onPress={handlePress}
        disabled={sent || loading}
      >
        <View style={[styles.alertIconBg, { backgroundColor: sent ? '#1a5048' : item.color + '22' }]}>
          {loading ? (
            <ActivityIndicator size="small" color="#7fb5ae" />
          ) : (
            <Ionicons name={item.icon as any} size={28} color={sent ? '#7fb5ae' : item.color} />
          )}
        </View>
        <View style={styles.alertInfo}>
          <Text style={[styles.alertLabel, sent && styles.alertLabelSent]}>{item.label}</Text>
          <Text style={styles.alertDesc}>{item.description}</Text>
        </View>
        {sent
          ? <Ionicons name="checkmark-circle" size={24} color="#7fb5ae" />
          : <Ionicons name="chevron-forward" size={20} color="#7fb5ae" />
        }
      </Pressable>
    </Animated.View>
  );
}

export default function ScanNotificationScreen() {
  const insets = useSafeAreaInsets();
  const { qrCode, plate, make, model, color } =
    useLocalSearchParams<{ id: string; qrCode: string; plate: string; make: string; model: string; color: string }>();

  const [sentAlert, setSentAlert] = useState<AlertType | null>(null);
  const [loadingAlert, setLoadingAlert] = useState<AlertType | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const botPad = insets.bottom + (Platform.OS === 'web' ? 34 : 0);

  async function handleAlert(type: AlertType) {
    if (sentAlert || loadingAlert) return;
    setLoadingAlert(type);
    setError('');
    try {
      await sendAlert(qrCode ?? '', type);
      setSentAlert(type);
      setShowSuccess(true);
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Failed to send alert');
    } finally {
      setLoadingAlert(null);
    }
  }

  const carDesc = [make, model].filter(Boolean).join(' ');

  return (
    <LinearGradient colors={['#082926', '#16433B', '#082926']} locations={[0, 0.5, 1]} style={styles.gradient}>
      <View style={[styles.container, { paddingTop: topPad + 12, paddingBottom: botPad + 20 }]}>
        {/* Close */}
        <View style={styles.topRow}>
          <Pressable
            style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.7 }]}
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Car info */}
        <View style={styles.carSection}>
          <View style={styles.carIconBg}>
            <Ionicons name="car" size={36} color="#7fb5ae" />
          </View>
          <Text style={styles.question}>Need to reach the car owner?</Text>
          {plate ? (
            <View style={styles.plateBadge}>
              <Text style={styles.plateText}>{plate}</Text>
            </View>
          ) : null}
          {carDesc ? <Text style={styles.carMeta}>{carDesc}</Text> : null}
          {color ? <Text style={styles.carMeta}>{color}</Text> : null}
        </View>

        {/* Success banner */}
        {showSuccess && (
          <View style={styles.successBanner}>
            <Ionicons name="checkmark-circle" size={20} color="#4ade80" />
            <Text style={styles.successText}>Alert sent successfully</Text>
          </View>
        )}

        {/* Error banner */}
        {error ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={16} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Alert buttons */}
        <View style={styles.alerts}>
          <Text style={styles.alertsTitle}>Choose an alert type</Text>
          {ALERTS.map(a => (
            <AlertButton
              key={a.id}
              item={a}
              onPress={() => handleAlert(a.id)}
              sent={sentAlert === a.id}
              loading={loadingAlert === a.id}
            />
          ))}
        </View>

        {/* Privacy note */}
        <View style={styles.privacyNote}>
          <Ionicons name="lock-closed" size={14} color="#4a8a82" />
          <Text style={styles.privacyText}>
            Phone number is fully protected — it will never be revealed
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 24, gap: 20 },
  topRow: { flexDirection: 'row', justifyContent: 'flex-end' },
  closeBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center', alignItems: 'center',
  },
  carSection: { alignItems: 'center', gap: 10 },
  carIconBg: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(127,181,174,0.1)',
    borderWidth: 1, borderColor: '#1a5048',
    justifyContent: 'center', alignItems: 'center',
  },
  question: { fontSize: 24, fontFamily: 'Inter_700Bold', color: '#FFFFFF', textAlign: 'center' },
  plateBadge: {
    backgroundColor: '#0e3b33', borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 8,
    borderWidth: 1, borderColor: '#1a5048',
  },
  plateText: { fontSize: 22, fontFamily: 'Inter_700Bold', color: '#FFFFFF', letterSpacing: 3 },
  carMeta: { fontSize: 14, fontFamily: 'Inter_400Regular', color: '#7fb5ae' },
  successBanner: {
    backgroundColor: 'rgba(74,222,128,0.12)', borderRadius: 12,
    paddingVertical: 14, paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderColor: 'rgba(74,222,128,0.25)',
  },
  successText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: '#4ade80' },
  errorBanner: {
    backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 12,
    paddingVertical: 12, paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)',
  },
  errorText: { flex: 1, fontSize: 13, fontFamily: 'Inter_400Regular', color: '#ef4444' },
  alerts: { gap: 12 },
  alertsTitle: { fontSize: 13, fontFamily: 'Inter_500Medium', color: '#7fb5ae' },
  alertBtn: {
    backgroundColor: '#0e3b33', borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderWidth: 1, borderColor: '#1a5048',
  },
  alertBtnSent: { opacity: 0.6 },
  alertIconBg: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  alertInfo: { flex: 1 },
  alertLabel: { fontSize: 17, fontFamily: 'Inter_600SemiBold', color: '#FFFFFF' },
  alertLabelSent: { color: '#7fb5ae' },
  alertDesc: { fontSize: 13, fontFamily: 'Inter_400Regular', color: '#7fb5ae', marginTop: 2 },
  privacyNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  privacyText: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#4a8a82', textAlign: 'center' },
});
