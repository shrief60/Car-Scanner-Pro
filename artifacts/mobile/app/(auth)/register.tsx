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

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!/\S+@\S+\.\S+/.test(email.trim())) e.email = 'Enter a valid email address';
    if (password.length < 6) e.password = 'Password must be at least 6 characters';
    if (password !== confirm) e.confirm = 'Passwords do not match';
    return e;
  }

  const canSubmit =
    name.trim().length >= 2 &&
    email.trim().includes('@') &&
    password.length >= 6 &&
    confirm.length > 0;

  async function handleRegister() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        password_confirmation: confirm,
      });
      router.replace('/(main)/home');
    } catch (err: unknown) {
      setErrors({ general: (err as Error).message ?? 'Registration failed' });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  }

  function strength(): { label: string; color: string; width: number } {
    const len = password.length;
    if (len === 0) return { label: '', color: 'transparent', width: 0 };
    if (len < 6) return { label: 'Too short', color: '#ef4444', width: 0.25 };
    const score = [/[A-Z]/.test(password), /[0-9]/.test(password), /[^a-zA-Z0-9]/.test(password)].filter(Boolean).length;
    if (score === 0) return { label: 'Weak', color: '#f97316', width: 0.4 };
    if (score === 1) return { label: 'Fair', color: '#eab308', width: 0.6 };
    if (score === 2) return { label: 'Strong', color: '#22c55e', width: 0.85 };
    return { label: 'Very strong', color: '#16a34a', width: 1 };
  }
  const str = strength();

  const Field = ({
    label, value, onChange, placeholder, keyboardType, secure, show, setShow, icon, error, hint, returnKeyType, onSubmit,
  }: {
    label: string; value: string; onChange: (t: string) => void; placeholder: string;
    keyboardType?: 'email-address' | 'default'; secure?: boolean; show?: boolean;
    setShow?: (v: boolean) => void; icon: string; error?: string; hint?: string;
    returnKeyType?: 'next' | 'done'; onSubmit?: () => void;
  }) => (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, error ? styles.inputError : null]}>
        <Ionicons name={icon as any} size={18} color="#4a8a82" style={styles.inputIcon} />
        <TextInput
          style={[styles.input, secure && styles.inputPassword]}
          placeholder={placeholder}
          placeholderTextColor="#4a8a82"
          value={value}
          onChangeText={onChange}
          secureTextEntry={secure && !show}
          keyboardType={keyboardType ?? 'default'}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType={returnKeyType ?? 'next'}
          onSubmitEditing={onSubmit}
        />
        {secure && setShow && (
          <Pressable onPress={() => setShow(!show)} style={styles.eyeBtn}>
            <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={20} color="#7fb5ae" />
          </Pressable>
        )}
        {secure && value.length > 0 && label === 'Confirm Password' && (
          <Ionicons
            name={value === password ? 'checkmark-circle' : 'close-circle'}
            size={20}
            color={value === password ? '#22c55e' : '#ef4444'}
            style={{ marginLeft: 4 }}
          />
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {hint && !error ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );

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
          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </Pressable>

          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join Qar and protect your car</Text>
          </View>

          <View style={styles.form}>
            <Field
              label="Full Name" value={name}
              onChange={t => { setName(t); setErrors(p => ({ ...p, name: '' })); }}
              placeholder="Your full name" icon="person-outline" error={errors.name}
            />
            <Field
              label="Email" value={email}
              onChange={t => { setEmail(t); setErrors(p => ({ ...p, email: '' })); }}
              placeholder="your@email.com" keyboardType="email-address"
              icon="mail-outline" error={errors.email}
            />
            <View style={styles.fieldGroup}>
              <Field
                label="Password" value={password}
                onChange={t => { setPassword(t); setErrors(p => ({ ...p, password: '' })); }}
                placeholder="Choose a password" icon="lock-closed-outline"
                secure show={showPassword} setShow={setShowPassword} error={errors.password}
              />
              {password.length > 0 && (
                <View style={styles.strengthRow}>
                  <View style={styles.strengthBar}>
                    <View style={[styles.strengthFill, { width: `${str.width * 100}%` as any, backgroundColor: str.color }]} />
                  </View>
                  <Text style={[styles.strengthLabel, { color: str.color }]}>{str.label}</Text>
                </View>
              )}
            </View>
            <Field
              label="Confirm Password" value={confirm}
              onChange={t => { setConfirm(t); setErrors(p => ({ ...p, confirm: '' })); }}
              placeholder="Repeat your password" icon="lock-closed-outline"
              secure show={showConfirm} setShow={setShowConfirm} error={errors.confirm}
              returnKeyType="done" onSubmit={handleRegister}
            />

            {errors.general ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color="#ef4444" />
                <Text style={styles.errorText}>{errors.general}</Text>
              </View>
            ) : null}

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
  container: { flexGrow: 1, paddingHorizontal: 28, gap: 24 },
  backBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center', alignItems: 'center', alignSelf: 'flex-start',
  },
  header: { gap: 6 },
  title: { fontSize: 32, fontFamily: 'Inter_700Bold', color: '#FFFFFF' },
  subtitle: { fontSize: 15, fontFamily: 'Inter_400Regular', color: '#7fb5ae' },
  form: { gap: 14 },
  fieldGroup: { gap: 7 },
  label: { fontSize: 14, fontFamily: 'Inter_500Medium', color: '#7fb5ae' },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1, borderColor: '#1a5048', borderRadius: 14, paddingHorizontal: 14,
  },
  inputError: { borderColor: '#ef4444' },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 16, fontSize: 16, fontFamily: 'Inter_400Regular', color: '#FFFFFF' },
  inputPassword: { paddingRight: 8 },
  eyeBtn: { padding: 4 },
  hint: { fontSize: 11, fontFamily: 'Inter_400Regular', color: '#4a8a82' },
  strengthRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 },
  strengthBar: { flex: 1, height: 4, backgroundColor: '#1a5048', borderRadius: 2, overflow: 'hidden' },
  strengthFill: { height: '100%', borderRadius: 2 },
  strengthLabel: { fontSize: 12, fontFamily: 'Inter_500Medium', width: 72 },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)',
  },
  errorText: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#ef4444', flex: 1 },
  button: {
    backgroundColor: '#FFFFFF', borderRadius: 14, paddingVertical: 18,
    alignItems: 'center', marginTop: 4,
  },
  buttonDisabled: { opacity: 0.35 },
  buttonPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  buttonText: { fontSize: 17, fontFamily: 'Inter_700Bold', color: '#082926' },
  switchRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' },
  switchText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: '#7fb5ae' },
  switchLink: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#FFFFFF', textDecorationLine: 'underline' },
});
