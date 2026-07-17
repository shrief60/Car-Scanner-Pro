import React, { useState } from 'react';
import {
  ActivityIndicator,
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

export default function PhoneScreen() {
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isValid = phone.replace(/\D/g, '').length >= 10;

  async function handleSend() {
    if (!isValid) {
      setError('Please enter a valid phone number');
      return;
    }
    setError('');
    setLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    router.push({ pathname: '/(auth)/otp', params: { phone } });
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
            <View style={styles.logoCircle}>
              <Text style={styles.logoQ}>Q</Text>
            </View>
            <Text style={styles.appName}>Qar</Text>
            <Text style={styles.tagline}>Get there in seconds</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputRow}>
              <View style={styles.prefix}>
                <Text style={styles.prefixText}>+20</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="10X XXX XXXX"
                placeholderTextColor="#4a8a82"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={t => {
                  setPhone(t);
                  setError('');
                }}
                maxLength={14}
                autoFocus
              />
            </View>
            {error ? <Text style={styles.error}>{error}</Text> : null}

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
                <Text style={styles.buttonText}>Send Verification Code</Text>
              )}
            </Pressable>
          </View>

          <Text style={styles.note}>
            We'll send a verification code to your number via SMS
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
  logoSection: {
    alignItems: 'center',
    marginTop: 40,
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoQ: {
    fontSize: 42,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  appName: {
    fontSize: 36,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#7fb5ae',
    marginTop: 6,
  },
  form: { gap: 12 },
  label: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#7fb5ae',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  prefix: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: '#1a5048',
    borderRadius: 14,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  prefixText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: '#1a5048',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 18,
    fontFamily: 'Inter_500Medium',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  error: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#ef4444',
  },
  button: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.4 },
  buttonPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  buttonText: {
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
    color: '#082926',
  },
  note: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#4a8a82',
    textAlign: 'center',
    lineHeight: 20,
  },
});
