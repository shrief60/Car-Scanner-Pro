import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type FormFieldProps = {
  label: string;
  value: string;
  onChange: (t: string) => void;
  onBlur?: () => void;
  placeholder: string;
  icon: string;
  error?: string;
  hint?: string;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoComplete?: TextInputProps['autoComplete'];
  textContentType?: TextInputProps['textContentType'];
  secure?: boolean;
  show?: boolean;
  setShow?: (v: boolean) => void;
  returnKeyType?: TextInputProps['returnKeyType'];
  onSubmit?: () => void;
  maxLength?: number;
  /** Static text shown before the input, e.g. a "+20" dialling code. */
  prefix?: string;
  /** Trailing tick/cross: true = matches, false = differs, undefined = no indicator. */
  match?: boolean;
};

/**
 * The shared text field for auth forms.
 *
 * Declared at module scope on purpose. Defining a component inside a screen's body
 * gives it a new identity on every render, so React unmounts and remounts the
 * TextInput on each keystroke and the field loses focus after one character.
 *
 * `forwardRef` is what lets a screen chain focus between fields — react-hook-form
 * does not manage focus itself.
 */
export const FormField = React.forwardRef<TextInput, FormFieldProps>(function FormField(
  {
    label, value, onChange, onBlur, placeholder, icon, error, hint,
    keyboardType, autoCapitalize, autoComplete, textContentType,
    secure, show, setShow, returnKeyType, onSubmit, match, maxLength, prefix,
  },
  ref,
) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, error ? styles.inputError : null]}>
        <Ionicons name={icon as any} size={18} color="#4a8a82" style={styles.inputIcon} />
        {!!prefix && <Text style={styles.prefixText}>{prefix}</Text>}
        <TextInput
          ref={ref}
          style={[styles.input, secure && styles.inputPassword]}
          maxLength={maxLength}
          placeholder={placeholder}
          placeholderTextColor="#4a8a82"
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          secureTextEntry={secure && !show}
          keyboardType={keyboardType ?? 'default'}
          autoCapitalize={autoCapitalize ?? 'none'}
          autoComplete={autoComplete}
          textContentType={textContentType}
          autoCorrect={false}
          returnKeyType={returnKeyType ?? 'next'}
          onSubmitEditing={onSubmit}
          // Keep the keyboard up while moving between fields.
          blurOnSubmit={returnKeyType === 'done'}
        />
        {secure && setShow && (
          <Pressable onPress={() => setShow(!show)} style={styles.eyeBtn} hitSlop={8}>
            <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={20} color="#7fb5ae" />
          </Pressable>
        )}
        {match !== undefined && value.length > 0 && (
          <Ionicons
            name={match ? 'checkmark-circle' : 'close-circle'}
            size={20}
            color={match ? '#22c55e' : '#ef4444'}
            style={{ marginLeft: 4 }}
          />
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {hint && !error ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  fieldGroup: { gap: 8 },
  label: { fontSize: 14, fontFamily: 'Inter_500Medium', color: '#7fb5ae' },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1, borderColor: '#1a5048', borderRadius: 14, paddingHorizontal: 14,
  },
  inputError: { borderColor: '#ef4444' },
  inputIcon: { marginRight: 8 },
  input: {
    flex: 1, paddingVertical: 16, fontSize: 16,
    fontFamily: 'Inter_400Regular', color: '#FFFFFF',
  },
  inputPassword: { paddingRight: 8 },
  eyeBtn: { padding: 4 },
  errorText: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#ef4444' },
  hint: { fontSize: 11, fontFamily: 'Inter_400Regular', color: '#4a8a82' },
  prefixText: {
    fontSize: 16, fontFamily: 'Inter_600SemiBold', color: '#FFFFFF',
    marginRight: 8, paddingRight: 8,
    borderRightWidth: 1, borderRightColor: '#1a5048',
  },
});
