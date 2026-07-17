import React from 'react';
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  function go(path: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(path as any);
  }

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
            paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 32),
            paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 32),
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
          <Text style={styles.tagline}>Smart QR management for your car</Text>
        </View>

        {/* Auth options */}
        <View style={styles.options}>
          <Text style={styles.optionsTitle}>Get started</Text>

          {/* Phone OTP */}
          <Pressable
            style={({ pressed }) => [styles.optionBtn, styles.optionBtnPrimary, pressed && styles.pressed]}
            onPress={() => go('/(auth)/phone')}
          >
            <View style={styles.optionIcon}>
              <Ionicons name="phone-portrait-outline" size={22} color="#082926" />
            </View>
            <View style={styles.optionText}>
              <Text style={styles.optionLabel}>Continue with Phone</Text>
              <Text style={styles.optionSub}>Verify with a one-time code</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#082926" />
          </Pressable>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Sign in */}
          <Pressable
            style={({ pressed }) => [styles.optionBtn, styles.optionBtnSecondary, pressed && styles.pressed]}
            onPress={() => go('/(auth)/login')}
          >
            <View style={[styles.optionIcon, styles.optionIconSecondary]}>
              <Ionicons name="person-outline" size={22} color="#FFFFFF" />
            </View>
            <View style={styles.optionText}>
              <Text style={[styles.optionLabel, { color: '#FFFFFF' }]}>Sign In</Text>
              <Text style={styles.optionSub}>With username & password</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#7fb5ae" />
          </Pressable>

          {/* Sign up */}
          <Pressable
            style={({ pressed }) => [styles.optionBtn, styles.optionBtnSecondary, pressed && styles.pressed]}
            onPress={() => go('/(auth)/register')}
          >
            <View style={[styles.optionIcon, styles.optionIconSecondary]}>
              <Ionicons name="person-add-outline" size={22} color="#FFFFFF" />
            </View>
            <View style={styles.optionText}>
              <Text style={[styles.optionLabel, { color: '#FFFFFF' }]}>Create Account</Text>
              <Text style={styles.optionSub}>Sign up with username & password</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#7fb5ae" />
          </Pressable>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Your phone number is never shared with anyone
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
  },
  logoSection: {
    alignItems: 'center',
    marginTop: 20,
    gap: 10,
  },
  logoCard: {
    width: 160,
    height: 160,
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  logoImage: {
    width: 160,
    height: 160,
  },
  tagline: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: '#7fb5ae',
    textAlign: 'center',
  },
  options: { gap: 14 },
  optionsTitle: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: '#7fb5ae',
    marginBottom: 2,
  },
  optionBtn: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  optionBtnPrimary: { backgroundColor: '#FFFFFF' },
  optionBtnSecondary: {
    backgroundColor: '#0e3b33',
    borderWidth: 1,
    borderColor: '#1a5048',
  },
  pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(8,41,38,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionIconSecondary: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  optionText: { flex: 1, gap: 2 },
  optionLabel: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#082926',
  },
  optionSub: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#7fb5ae',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 2,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#1a5048' },
  dividerText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#4a8a82',
  },
  footer: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#4a8a82',
    textAlign: 'center',
    lineHeight: 18,
  },
});
