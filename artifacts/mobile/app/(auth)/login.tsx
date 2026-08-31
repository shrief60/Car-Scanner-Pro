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
import { loginSchema, LoginValues } from '@/lib/schemas';

const FIELDS = ['email', 'password'] as const;

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { loginWithPassword } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const passwordRef = useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isValid, isSubmitting },
  } = useForm<LoginValues>({
    resolver: yupResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: LoginValues) {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await loginWithPassword(values.email.trim(), values.password);
      router.replace('/(main)/home');
    } catch (err: unknown) {
      applyServerErrors<LoginValues>(err, setError, FIELDS);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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
            <Text style={styles.title}>Sign In</Text>
            <Text style={styles.subtitle}>Welcome back to Qar</Text>
          </View>

          <View style={styles.form}>
            <Controller
              control={control}
              name="email"
              render={({ field, fieldState }) => (
                <FormField
                  label="Email" placeholder="Enter your email" icon="mail-outline"
                  value={field.value} onChange={field.onChange} onBlur={field.onBlur}
                  error={fieldState.error?.message}
                  keyboardType="email-address"
                  autoComplete="email" textContentType="emailAddress"
                  returnKeyType="next" onSubmit={() => passwordRef.current?.focus()}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field, fieldState }) => (
                <FormField
                  ref={passwordRef}
                  label="Password" placeholder="Enter your password" icon="lock-closed-outline"
                  value={field.value} onChange={field.onChange} onBlur={field.onBlur}
                  error={fieldState.error?.message}
                  secure show={showPassword} setShow={setShowPassword}
                  autoComplete="current-password" textContentType="password"
                  returnKeyType="done" onSubmit={handleSubmit(onSubmit)}
                />
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
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </Pressable>
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Don't have an account? </Text>
            <Pressable onPress={() => router.replace('/(auth)/register')}>
              <Text style={styles.switchLink}>Create one</Text>
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
