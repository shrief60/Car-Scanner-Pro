import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/context/AuthContext';

export default function OtpScreen() {
  const insets = useSafeAreaInsets();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { login } = useAuth();

  const [digits, setDigits] = useState<string[]>(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const inputs = useRef<(TextInput | null)[]>([]);

  const code = digits.join('');
  const isComplete = code.length === 4;

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setInterval(() => setResendTimer(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  function handleDigit(text: string, idx: number) {
    const d = text.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[idx] = d;
    setDigits(next);
    setError('');
    if (d && idx < 3) {
      inputs.current[idx + 1]?.focus();
    }
  }

  function handleKeyPress(key: string, idx: number) {
    if (key === 'Backspace' && !digits[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
      const next = [...digits];
      next[idx - 1] = '';
      setDigits(next);
    }
  }

  async function handleVerify() {
    if (!isComplete) return;
    setLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Simulate OTP verification — replace with Firebase Phone Auth in production
    await new Promise(r => setTimeout(r, 1500));
    const userId =
      Date.now().toString() + Math.random().toString(36).substr(2, 6);
    await login(phone ?? '', userId);
    setLoading(false);
    router.replace('/(main)/home');
  }

  async function handleResend() {
    if (resendTimer > 0) return;
    setResendTimer(30);
    setDigits(['', '', '', '']);
    inputs.current[0]?.focus();
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  const maskedPhone = phone
    ? phone.slice(0, 4) + ' **** ' + phone.slice(-3)
    : '';

  return (
    <LinearGradient
      colors={['#082926', '#16433B', '#082926']}
      locations={[0, 0.5, 1]}
      style={styles.gradient}
    >
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0),
            paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0),
          },
        ]}
      >
        {/* Back */}
        <Pressable style={styles.back} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Verification Code</Text>
          <Text style={styles.subtitle}>
            We sent a 4-digit code to
          </Text>
          <Text style={styles.phone}>{maskedPhone}</Text>
        </View>

        {/* OTP boxes */}
        <View style={styles.otpRow}>
          {digits.map((d, i) => (
            <TextInput
              key={i}
              ref={r => {
                inputs.current[i] = r;
              }}
              style={[styles.box, d ? styles.boxFilled : null]}
              value={d}
              onChangeText={t => handleDigit(t, i)}
              onKeyPress={({ nativeEvent }) =>
                handleKeyPress(nativeEvent.key, i)
              }
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              autoFocus={i === 0}
            />
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* Verify button */}
        <Pressable
          style={({ pressed }) => [
            styles.button,
            !isComplete && styles.buttonDisabled,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleVerify}
          disabled={loading || !isComplete}
        >
          {loading ? (
            <ActivityIndicator color="#082926" />
          ) : (
            <Text style={styles.buttonText}>Confirm</Text>
          )}
        </Pressable>

        {/* Resend */}
        <Pressable
          onPress={handleResend}
          disabled={resendTimer > 0}
          style={styles.resend}
        >
          <Text
            style={[styles.resendText, resendTimer > 0 && styles.resendDisabled]}
          >
            {resendTimer > 0
              ? `Resend code in ${resendTimer}s`
              : 'Resend code'}
          </Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingVertical: 24,
  },
  back: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  header: {
    marginTop: 48,
    marginBottom: 48,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: '#7fb5ae',
    textAlign: 'center',
  },
  phone: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    marginTop: 4,
    letterSpacing: 1,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    marginBottom: 24,
  },
  box: {
    width: 64,
    height: 72,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1.5,
    borderColor: '#1a5048',
    borderRadius: 16,
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  boxFilled: {
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  error: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.35 },
  buttonPressed: { opacity: 0.85 },
  buttonText: {
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
    color: '#082926',
  },
  resend: {
    marginTop: 24,
    alignItems: 'center',
  },
  resendText: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    color: '#FFFFFF',
  },
  resendDisabled: { color: '#4a8a82' },
});
