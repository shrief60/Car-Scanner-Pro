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
import { alignInput, alignStart, ltrIsolate } from '@/lib/direction';
import { FONT } from '@/lib/typography';

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
  // The field's furniture — leading icon, dialling code, eye toggle — keeps its physical
  // position in both languages, so the row is pinned LTR and does not mirror. Only the
  // typed text follows the reading edge.
  return (
    <View style={styles.fieldGroup}>
      <Text style={[styles.label, alignStart()]}>{label}</Text>
      <View style={[styles.inputWrapper, error ? styles.inputError : null]}>
        <Ionicons name={icon as any} size={18} color="#4a8a82" style={styles.inputIcon} />
        {/* Isolated: a dialling code is all bidi-neutral, so in Arabic the leading
            `+` migrates to the far end and `+20` renders as `20+`. */}
        {!!prefix && <Text style={styles.prefixText}>{ltrIsolate(prefix)}</Text>}
        <TextInput
          ref={ref}
          // `alignInput()`, not `alignStart()` — see its note. `alignStart()` returns
          // 'left' on the premise the platform mirrors it, and nothing mirrors here.
          style={[styles.input, secure && styles.inputPassword, alignInput()]}
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
            style={{ marginStart: 4 }}
          />
        )}
      </View>
      {error ? <Text style={[styles.errorText, alignStart()]}>{error}</Text> : null}
      {hint && !error ? <Text style={[styles.hint, alignStart()]}>{hint}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  fieldGroup: { gap: 8 },
  label: { fontSize: 14, fontFamily: FONT.medium, color: '#7fb5ae' },
  inputWrapper: {
    // See the note in the component: this row is deliberately never mirrored.
    direction: 'ltr',
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1, borderColor: '#1a5048', borderRadius: 14, paddingHorizontal: 14,
  },
  inputError: { borderColor: '#ef4444' },
  inputIcon: { marginEnd: 8 },
  input: {
    flex: 1, paddingVertical: 16, fontSize: 16,
    fontFamily: FONT.regular, color: '#FFFFFF',
  },
  inputPassword: { paddingEnd: 8 },
  eyeBtn: { padding: 4 },
  errorText: { fontSize: 12, fontFamily: FONT.regular, color: '#ef4444' },
  hint: { fontSize: 11, fontFamily: FONT.regular, color: '#4a8a82' },
  prefixText: {
    fontSize: 16, fontFamily: FONT.semibold, color: '#FFFFFF',
    marginEnd: 8, paddingEnd: 8,
    borderEndWidth: 1, borderEndColor: '#1a5048',
  },
});
