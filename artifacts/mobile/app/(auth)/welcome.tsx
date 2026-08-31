import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
import * as WebBrowser from 'expo-web-browser';
import {
  makeRedirectUri,
  useAuthRequest,
  ResponseType,
} from 'expo-auth-session';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { LanguageSheet } from '@/components/LanguageSheet';
import { alignStart } from '@/lib/direction';
import { FONT } from '@/lib/typography';
import { mirrorIcon } from '@/lib/rtl';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '';
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? '';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { t, locale } = useLocale();
  const [langOpen, setLangOpen] = useState(false);
  const { loginWithGoogle } = useAuth();
  const [googleError, setGoogleError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  const redirectUri = useMemo(() => {
    // Google requires an exact redirect URI for browser-based OAuth.
    // Use the current preview/deployment origin on web and the Qar scheme
    // for native builds.
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return `${window.location.origin}/auth/callback`;
    }
    return makeRedirectUri({ scheme: 'mobile', path: 'auth/callback' });
  }, []);

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId:
        Platform.OS === 'ios'
          ? GOOGLE_IOS_CLIENT_ID
          : Platform.OS === 'android'
            ? GOOGLE_ANDROID_CLIENT_ID
            : GOOGLE_WEB_CLIENT_ID,
      responseType: ResponseType.IdToken,
      // The Qar API expects Google's ID token directly. PKCE adds
      // code_challenge_method, which is not valid for this response type.
      usePKCE: false,
      scopes: ['openid', 'profile', 'email'],
      redirectUri,
    },
    { authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth' },
  );

  useEffect(() => {
    async function finishGoogleLogin() {
      if (response?.type !== 'success') {
        if (response?.type === 'error') setGoogleError(t('auth.googleCancelled'));
        return;
      }

      const idToken =
        response.authentication?.idToken ??
        (response.params as { id_token?: string } | undefined)?.id_token;

      if (!idToken) {
        setGoogleError(t('auth.googleNoToken'));
        return;
      }

      setGoogleLoading(true);
      setGoogleError('');
      try {
        const isNewAccount = await loginWithGoogle(idToken);
        // A brand-new account gets the plan picker first; a returning user does not.
        router.replace(isNewAccount ? '/(main)/packages' : '/(main)/home');
      } catch (e: unknown) {
        const error = e as Error & { status?: number; code?: string };
        if (error.code === 'requires_link' || error.status === 409) {
          setGoogleError(t('auth.googleEmailTaken'));
        } else {
          setGoogleError(error.message || t('auth.googleFailed'));
        }
      } finally {
        setGoogleLoading(false);
      }
    }
    finishGoogleLogin();
  }, [response, loginWithGoogle]);

  async function handleGoogle() {
    if (!request) {
      setGoogleError(t('auth.googleNotConfigured'));
      return;
    }
    setGoogleError('');
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await promptAsync();
  }

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
      <View style={[
        styles.container,
        {
          paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 32),
          paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 32),
        },
      ]}>
        <Pressable
          // Absolute children sit against the parent's *padding box*, so the container's
          // paddingTop does not push this down — the inset has to be applied here or the
          // pill lands on top of the status bar.
          style={({ pressed }) => [
            styles.langBtn,
            { top: insets.top + 10 },
            pressed && { opacity: 0.7 },
          ]}
          onPress={() => setLangOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={t('settings.language')}
        >
          <Ionicons name="language-outline" size={20} color="#FFFFFF" />
          <Text style={[styles.langText, alignStart()]}>{locale === 'ar' ? 'EN' : 'ع'}</Text>
        </Pressable>

        <View style={styles.logoSection}>
          <View style={styles.logoCard}>
            <Image source={require('@/assets/images/logo.png')} style={styles.logoImage} resizeMode="cover" />
          </View>
          <Text style={styles.tagline}>{t('auth.welcomeTagline')}</Text>
        </View>

        <View style={styles.options}>
          <Text style={[styles.optionsTitle, alignStart(), alignStart()]}>{t('auth.getStarted')}</Text>

          {/* OTP is intentionally hidden for now. Password and Google are active. */}
          <Pressable
            style={({ pressed }) => [styles.googleBtn, pressed && styles.pressed]}
            onPress={handleGoogle}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <ActivityIndicator color="#082926" />
            ) : (
              <Text style={styles.googleG}>G</Text>
            )}
            <Text style={styles.googleText}>{t('auth.continueWithGoogle')}</Text>
            <View style={{ width: 18 }} />
          </Pressable>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={[styles.dividerText, alignStart()]}>{t('common.or')}</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable
            style={({ pressed }) => [styles.optionBtn, pressed && styles.pressed]}
            onPress={() => go('/(auth)/login')}
          >
            <View style={styles.optionIcon}>
              <Ionicons name="person-outline" size={22} color="#FFFFFF" />
            </View>
            <View style={styles.optionText}>
              <Text style={[styles.optionLabel, alignStart(), alignStart()]}>{t('auth.signIn')}</Text>
              <Text style={[styles.optionSub, alignStart(), alignStart()]}>{t('auth.signInSubtitle')}</Text>
            </View>
            <Ionicons name={mirrorIcon('chevron-forward')} size={18} color="#7fb5ae" />
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.optionBtn, pressed && styles.pressed]}
            onPress={() => go('/(auth)/register')}
          >
            <View style={styles.optionIcon}>
              <Ionicons name="person-add-outline" size={22} color="#FFFFFF" />
            </View>
            <View style={styles.optionText}>
              <Text style={[styles.optionLabel, alignStart(), alignStart()]}>{t('auth.createAccount')}</Text>
              <Text style={[styles.optionSub, alignStart(), alignStart()]}>{t('auth.createAccountSubtitle')}</Text>
            </View>
            <Ionicons name={mirrorIcon('chevron-forward')} size={18} color="#7fb5ae" />
          </Pressable>

          {googleError ? <Text style={styles.error}>{googleError}</Text> : null}
        </View>

        <Text style={styles.footer}>{t('auth.phoneNeverShared')}</Text>
      </View>

      <LanguageSheet visible={langOpen} onClose={() => setLangOpen(false)} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  langBtn: {
    position: 'absolute', end: 28, zIndex: 10,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  langText: { fontSize: 13, fontFamily: FONT.semibold, color: '#FFFFFF' },
  container: { flex: 1, paddingHorizontal: 28, justifyContent: 'space-between' },
  logoSection: { alignItems: 'center', marginTop: 20, gap: 10 },
  logoCard: {
    width: 160, height: 160, borderRadius: 32, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35, shadowRadius: 16, elevation: 10,
  },
  logoImage: { width: 160, height: 160 },
  tagline: { fontSize: 15, fontFamily: FONT.regular, color: '#7fb5ae', textAlign: 'center' },
  options: { gap: 14 },
  optionsTitle: { fontSize: 13, fontFamily: FONT.medium, color: '#7fb5ae', marginBottom: 2 },
  googleBtn: {
    borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', backgroundColor: '#FFFFFF',
  },
  googleG: { width: 44, textAlign: 'center', fontSize: 24, fontFamily: FONT.bold, color: '#4285F4' },
  googleText: { flex: 1, textAlign: 'center', fontSize: 16, fontFamily: FONT.semibold, color: '#082926' },
  optionBtn: {
    borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center',
    gap: 14, backgroundColor: '#0e3b33', borderWidth: 1, borderColor: '#1a5048',
  },
  pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
  optionIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center', alignItems: 'center',
  },
  optionText: { flex: 1, gap: 2 },
  optionLabel: { fontSize: 16, fontFamily: FONT.semibold, color: '#FFFFFF' },
  optionSub: { fontSize: 12, fontFamily: FONT.regular, color: '#7fb5ae' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 2 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#1a5048' },
  dividerText: { fontSize: 13, fontFamily: FONT.regular, color: '#4a8a82' },
  error: { fontSize: 13, fontFamily: FONT.regular, color: '#ef4444', textAlign: 'center', lineHeight: 19 },
  footer: { fontSize: 12, fontFamily: FONT.regular, color: '#4a8a82', textAlign: 'center', lineHeight: 18 },
});