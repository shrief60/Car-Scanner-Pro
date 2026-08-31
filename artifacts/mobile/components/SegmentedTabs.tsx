import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { FONT } from '@/lib/typography';
import { alignStart } from '@/lib/direction';

/**
 * Two-way segmented control. Lifted from the Sign In / New Account switch in
 * `app/(auth)/phone.tsx`, which was the only segmented idiom in the app.
 */
export function SegmentedTabs<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.row}>
      {options.map(option => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            style={[styles.btn, active && styles.btnActive]}
            onPress={() => {
              if (active) return;
              Haptics.selectionAsync();
              onChange(option.value);
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.text, alignStart(), active && styles.textActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#1a5048',
  },
  btn: { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: 'center' },
  btnActive: { backgroundColor: '#FFFFFF' },
  text: { fontSize: 14, fontFamily: FONT.semibold, color: '#7fb5ae' },
  textActive: { color: '#082926' },
});
