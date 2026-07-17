import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/context/AuthContext';

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const { register } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (username.trim().length < 3) e.username = 'Username must be at least 3 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) e.username = 'Only letters, numbers, and underscores';
    if (password.length < 6) e.password = 'Password must be at least 6 characters';
    if (password !== confirm) e.confirm = 'Passwords do not match';
    return e;
  }

  const canSubmit =
    username.trim().length >= 3 &&
    password.length >= 6 &&
    confirm.length > 0;

  async function handleRegister() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await register(username.trim(), password);
      router.replace('/(main)/home');
    } catch (err: any) {
      setErrors({ general: err.message ?? 'Registration failed' });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  }

  // Live password strength
  function strength(): { label: string; color: string; width: number } {
    const len = password.length;
    if (len === 0) return { label: '', color: 'transparent', width: 0 };
    if (len < 6) return { label: 'Too short', color: '#ef4444', width: 0.25 };
    const hasUpper = /[A-Z]/.test(password);
    const hasNum = /[0-9]/.test(password);
    const hasSymbol = /[^a-zA-Z0-9]/.test(password);
    const score = [hasUpper, hasNum, hasSymbol].filter(Boolean).length;
    if (score === 0) return { label: 'Weak', color: '#f97316', width: 0.4 };
    if (score === 1) return { label: 'Fair', color: '#eab308', width: 0.6 };
    if (score === 2) return { label: 'Strong', color: '#22c55e', width: 0.85 };
    return { label: 'Very strong', color: '#16a34a', width: 1 };
  }
  const str = strength();

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
        <ScrollView
          contentContainerStyle={[
            styles.container,
            {
              paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 16),
              paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 40),
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back */}
          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </Pressable>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join Qar and protect your car</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Username */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Username</Text>
              <View style={[styles.inputWrapper, errors.username ? styles.inputError : null]}>
                <Ionicons name="person-outline" size={18} color="#4a8a82" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Choose a username"
                  placeholderTextColor="#4a8a82"
                  value={username}
                  onChangeText={t => { setUsername(t); setErrors(p => ({ ...p, username: '' })); }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>
              {errors.username ? <Text style={styles.errorText}>{errors.username}</Text> : null}
              <Text style={styles.hint}>Letters, numbers, and underscores only</Text>
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputWrapper, errors.password ? styles.inputError : null]}>
                <Ionicons name="lock-closed-outline" size={18} color="#4a8a82" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.inputPassword]}
                  placeholder="Choose a password"
                  placeholderTextColor="#4a8a82"
                  value={password}
                  onChangeText={t => { setPassword(t); setErrors(p => ({ ...p, password: '' })); }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
                <Pressable onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#7fb5ae" />
                </Pressable>
              </View>
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

              {/* Strength bar */}
              {password.length > 0 && (
                <View style={styles.strengthRow}>
                  <View style={styles.strengthBar}>
                    <View
                      style={[
                        styles.strengthFill,
                        { width: `${str.width * 100}%` as any, backgroundColor: str.color },
                      ]}
                    />
                  </View>
                  <Text style={[styles.strengthLabel, { color: str.color }]}>{str.label}</Text>
                </View>
              )}
            </View>

            {/* Confirm password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={[styles.inputWrapper, errors.confirm ? styles.inputError : null]}>
                <Ionicons name="lock-closed-outline" size={18} color="#4a8a82" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.inputPassword]}
                  placeholder="Repeat your password"
                  placeholderTextColor="#4a8a82"
                  value={confirm}
                  onChangeText={t => { setConfirm(t); setErrors(p => ({ ...p, confirm: '' })); }}
                  secureTextEntry={!showConfirm}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleRegister}
                />
                <Pressable onPress={() => setShowConfirm(v => !v)} style={styles.eyeBtn}>
                  <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={20} color="#7fb5ae" />
                </Pressable>
                {confirm.length > 0 && (
                  <Ionicons
                    name={confirm === password ? 'checkmark-circle' : 'close-circle'}
                    size={20}
                    color={confirm === password ? '#22c55e' : '#ef4444'}
                    style={{ marginLeft: 4 }}
                  />
                )}
              </View>
              {errors.confirm ? <Text style={styles.errorText}>{errors.confirm}</Text> : null}
            </View>

            {/* General error */}
            {errors.general ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color="#ef4444" />
                <Text style={styles.errorText}>{errors.general}</Text>
              </View>
            ) : null}

            {/* Submit */}
            <Pressable
              style={({ pressed }) => [
                styles.button,
                !canSubmit && styles.buttonDisabled,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleRegister}
              disabled={loading || !canSubmit}
            >
              {loading ? (
                <ActivityIndicator color="#082926" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </Pressable>
          </View>

          {/* Switch to login */}
          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Already have an account? </Text>
            <Pressable onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.switchLink}>Sign in</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    paddingHorizontal: 28,
    gap: 28,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  header: { gap: 6 },
  title: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: '#7fb5ae',
  },
  form: { gap: 16 },
  fieldGroup: { gap: 7 },
  label: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#7fb5ae',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: '#1a5048',
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  inputError: { borderColor: '#ef4444' },
  inputIcon: { marginRight: 8 },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#FFFFFF',
  },
  inputPassword: { paddingRight: 8 },
  eyeBtn: { padding: 4 },
  hint: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: '#4a8a82',
  },
  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#1a5048',
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    width: 72,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.25)',
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#ef4444',
    flex: 1,
  },
  button: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.35 },
  buttonPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  buttonText: {
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
    color: '#082926',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  switchText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#7fb5ae',
  },
  switchLink: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    textDecorationLine: 'underline',
  },
});
