import React, { useRef, useState } from 'react';
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
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormField } from '@/components/FormField';
import { useAuth } from '@/context/AuthContext';
import { applyServerErrors } from '@/lib/serverErrors';
import { MIN_PASSWORD, registerSchema, RegisterValues, toE164 } from '@/lib/schemas';

const FIELDS = ['name', 'email', 'phone', 'password', 'confirm'] as const;

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const { register } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // "next" on the keyboard walks down the form instead of dismissing it.
  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: yupResolver(registerSchema),
    // onTouched, not onChange — otherwise the phone errors while you are still typing it.
    mode: 'onTouched',
    defaultValues: { name: '', email: '', phone: '', password: '', confirm: '', acceptedTerms: false },
  });

  const password = watch('password');
  const confirm = watch('confirm');

  async function onSubmit(values: RegisterValues) {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await register({
        name: values.name.trim(),
        email: values.email.trim(),
        // The form holds national digits; the API wants E.164.
        phone: toE164(values.phone),
        password: values.password,
        password_confirmation: values.confirm,
      });
      router.replace('/(main)/home');
    } catch (err: unknown) {
      applyServerErrors<RegisterValues>(err, setError, FIELDS);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  function strength(): { label: string; color: string; width: number } {
    const len = password?.length ?? 0;
    if (len === 0) return { label: '', color: 'transparent', width: 0 };
    if (len < MIN_PASSWORD) return { label: 'Too short', color: '#ef4444', width: 0.25 };
    const score = [/[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].filter(re => re.test(password)).length;
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
            <Controller
              control={control}
              name="name"
              render={({ field, fieldState }) => (
                <FormField
                  label="Full Name" placeholder="Your full name" icon="person-outline"
                  value={field.value} onChange={field.onChange} onBlur={field.onBlur}
                  error={fieldState.error?.message}
                  autoCapitalize="words" autoComplete="name" textContentType="name"
                  returnKeyType="next" onSubmit={() => emailRef.current?.focus()}
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field, fieldState }) => (
                <FormField
                  ref={emailRef}
                  label="Email" placeholder="your@email.com" icon="mail-outline"
                  value={field.value} onChange={field.onChange} onBlur={field.onBlur}
                  error={fieldState.error?.message}
                  keyboardType="email-address"
                  autoComplete="email" textContentType="emailAddress"
                  returnKeyType="next" onSubmit={() => phoneRef.current?.focus()}
                />
              )}
            />

            <Controller
              control={control}
              name="phone"
              render={({ field, fieldState }) => (
                <FormField
                  ref={phoneRef}
                  label="Phone Number" placeholder="10X XXX XXXX" icon="call-outline"
                  value={field.value} onChange={field.onChange} onBlur={field.onBlur}
                  error={fieldState.error?.message}
                  keyboardType="phone-pad" prefix="+20" maxLength={14}
                  autoComplete="tel" textContentType="telephoneNumber"
                  hint="We never show your number to anyone who scans your car."
                  returnKeyType="next" onSubmit={() => passwordRef.current?.focus()}
                />
              )}
            />

            <View style={styles.fieldGroup}>
              <Controller
                control={control}
                name="password"
                render={({ field, fieldState }) => (
                  <FormField
                    ref={passwordRef}
                    label="Password" placeholder="Choose a password" icon="lock-closed-outline"
                    value={field.value} onChange={field.onChange} onBlur={field.onBlur}
                    error={fieldState.error?.message}
                    secure show={showPassword} setShow={setShowPassword}
                    autoComplete="new-password" textContentType="newPassword"
                    returnKeyType="next" onSubmit={() => confirmRef.current?.focus()}
                  />
                )}
              />
              {!!password?.length && (
                <View style={styles.strengthRow}>
                  <View style={styles.strengthBar}>
                    <View style={[styles.strengthFill, { width: `${str.width * 100}%` as any, backgroundColor: str.color }]} />
                  </View>
                  <Text style={[styles.strengthLabel, { color: str.color }]}>{str.label}</Text>
                </View>
              )}
            </View>

            <Controller
              control={control}
              name="confirm"
              render={({ field, fieldState }) => (
                <FormField
                  ref={confirmRef}
                  label="Confirm Password" placeholder="Repeat your password" icon="lock-closed-outline"
                  value={field.value} onChange={field.onChange} onBlur={field.onBlur}
                  error={fieldState.error?.message}
                  secure show={showConfirm} setShow={setShowConfirm}
                  autoComplete="new-password" textContentType="newPassword"
                  match={!!confirm && confirm === password}
                  returnKeyType="done" onSubmit={handleSubmit(onSubmit)}
                />
              )}
            />

            <Controller
              control={control}
              name="acceptedTerms"
              render={({ field, fieldState }) => (
                <View>
                  <Pressable
                    style={styles.termsRow}
                    onPress={() => field.onChange(!field.value)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: !!field.value }}
                    hitSlop={6}
                  >
                    <View style={[styles.checkbox, field.value && styles.checkboxOn]}>
                      {!!field.value && <Ionicons name="checkmark" size={15} color="#082926" />}
                    </View>
                    <Text style={styles.termsText}>
                      I agree to the{' '}
                      <Text
                        style={styles.termsLink}
                        onPress={() =>
                          router.push({ pathname: '/legal/[doc]', params: { doc: 'terms' } })
                        }
                      >
                        Terms of Use
                      </Text>
                    </Text>
                  </Pressable>
                  {fieldState.error ? (
                    <Text style={styles.termsError}>{fieldState.error.message}</Text>
                  ) : null}
                </View>
              )}
            />

            {errors.root ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color="#ef4444" />
                <Text style={styles.errorText}>{errors.root.message}</Text>
              </View>
            ) : null}

            <Pressable
              style={({ pressed }) => [
                styles.button,
                (!isValid || isSubmitting) && styles.buttonDisabled,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleSubmit(onSubmit)}
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#082926" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </Pressable>

            <View style={styles.switchRow}>
              <Text style={styles.switchText}>Already have an account? </Text>
              <Pressable onPress={() => router.replace('/(auth)/login')}>
                <Text style={styles.switchLink}>Sign in</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  flex: { flex: 1 },
  container: { flexGrow: 1, paddingHorizontal: 28, gap: 32 },
  backBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center', alignItems: 'center', alignSelf: 'flex-start',
  },
  header: { gap: 6 },
  title: { fontSize: 32, fontFamily: 'Inter_700Bold', color: '#FFFFFF' },
  subtitle: { fontSize: 15, fontFamily: 'Inter_400Regular', color: '#7fb5ae' },
  form: { gap: 18 },
  fieldGroup: { gap: 8 },
  strengthRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  strengthBar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: '#124038', overflow: 'hidden' },
  strengthFill: { height: '100%', borderRadius: 2 },
  strengthLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  termsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 2 },
  checkbox: {
    width: 22, height: 22, borderRadius: 7,
    borderWidth: 1.5, borderColor: '#1a5048',
    backgroundColor: 'rgba(255,255,255,0.07)',
    justifyContent: 'center', alignItems: 'center',
  },
  checkboxOn: { backgroundColor: '#FFFFFF', borderColor: '#FFFFFF' },
  termsText: { flex: 1, fontSize: 13, fontFamily: 'Inter_400Regular', color: '#7fb5ae', lineHeight: 19 },
  termsLink: { fontFamily: 'Inter_600SemiBold', color: '#FFFFFF', textDecorationLine: 'underline' },
  termsError: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#ef4444', marginTop: 6, marginLeft: 32 },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)',
  },
  errorText: { fontSize: 13, fontFamily: 'Inter_400Regular', color: '#ef4444', flex: 1 },
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
