import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { sendOtpChallenge } from '@/services/auth';
import { FONT } from '@/lib/typography';
import { alignStart, ltrIsolate } from '@/lib/direction';
import { useLocale } from '@/context/LocaleContext';

export default function PhoneScreen() {
  const { t } = useLocale();
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState('');
  const [isNew, setIsNew] = useState(false); // false = login, true = register
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const digits = phone.replace(/\D/g, '');
  const isValid = digits.length >= 10;

  async function handleSend() {
    if (!isValid) {
      setError(t('phoneAuth.invalid'));
      return;
    }
    setError('');
    setLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const fullPhone = '+2' + digits;
    try {
      await sendOtpChallenge(fullPhone, isNew ? 'register' : 'login');
      router.push({
        pathname: '/(auth)/otp',
        params: { phone: fullPhone, isNew: isNew ? '1' : '0' },
      });
    } catch (e: unknown) {
      setError((e as Error).message ?? t('phoneAuth.sendFailed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient
      colors={['#082926', '#16433B', '#082926']}
      locations={[0, 0.5, 1]}
      style={styles.gradient}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
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
          {/* Logo */}
          <View style={styles.logoSection}>
            <View style={styles.logoCard}>
              <Image
                source={require('@/assets/images/logo.png')}
                style={styles.logoImage}
                resizeMode="cover"
              />
            </View>
            <Text style={[styles.tagline, alignStart()]}>{t('phoneAuth.tagline')}</Text>
          </View>

          {/* Mode toggle */}
          <View style={styles.modeRow}>
            <Pressable
              style={[styles.modeBtn, !isNew && styles.modeBtnActive]}
              onPress={() => { setIsNew(false); setError(''); }}
            >
              <Text style={[styles.modeBtnText, alignStart(), !isNew && styles.modeBtnTextActive]}>
                {t('phoneAuth.signIn')}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.modeBtn, isNew && styles.modeBtnActive]}
              onPress={() => { setIsNew(true); setError(''); }}
            >
              <Text style={[styles.modeBtnText, alignStart(), isNew && styles.modeBtnTextActive]}>
                {t('phoneAuth.newAccount')}
              </Text>
            </Pressable>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={[styles.label, alignStart()]}>{t('auth.phoneNumber')}</Text>
            <View style={styles.inputRow}>
              <View style={styles.prefix}>
                <Text style={[styles.prefixText, alignStart()]}>{ltrIsolate('+20')}</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder={t('auth.phonePlaceholder')}
                placeholderTextColor="#4a8a82"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={value => { setPhone(value); setError(''); }}
                maxLength={14}
                autoFocus
              />
            </View>
            {error ? <Text style={[styles.error, alignStart()]}>{error}</Text> : null}

            <Pressable
              style={({ pressed }) => [
                styles.button,
                !isValid && styles.buttonDisabled,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleSend}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={[styles.buttonText, alignStart()]}>{t('phoneAuth.send')}</Text>
              )}
            </Pressable>
          </View>

          <Text style={styles.note}>
            {t('phoneAuth.note')}
          </Text>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  flex: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  logoSection: { alignItems: 'center', gap: 8, marginTop: 20 },
  logoCard: {
    width: 140,
    height: 140,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  logoImage: { width: 140, height: 140 },
  tagline: {
    fontSize: 16,
    fontFamily: FONT.regular,
    color: '#7fb5ae',
  },
  modeRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#1a5048',
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: 'center',
  },
  modeBtnActive: { backgroundColor: '#FFFFFF' },
  modeBtnText: {
    fontSize: 14,
    fontFamily: FONT.semibold,
    color: '#7fb5ae',
  },
  modeBtnTextActive: { color: '#082926' },
  form: { gap: 12 },
  label: { fontSize: 14, fontFamily: FONT.medium, color: '#7fb5ae' },
  inputRow: { flexDirection: 'row', gap: 8 },
  prefix: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: '#1a5048',
    borderRadius: 14,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  prefixText: { fontSize: 16, fontFamily: FONT.semibold, color: '#FFFFFF' },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: '#1a5048',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 18,
    fontFamily: FONT.medium,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  error: { fontSize: 13, fontFamily: FONT.regular, color: '#ef4444' },
  button: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.4 },
  buttonPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  buttonText: { fontSize: 17, fontFamily: FONT.bold, color: '#082926' },
  note: {
    fontSize: 13,
    fontFamily: FONT.regular,
    color: '#4a8a82',
    textAlign: 'center',
    lineHeight: 20,
  },
});
