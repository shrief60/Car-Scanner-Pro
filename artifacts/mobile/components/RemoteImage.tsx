import React, { useState } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

/**
 * A remote thumbnail with a graceful fallback.
 *
 * This is the app's first remote-image surface, and the data is unreliable: menu items
 * can have `image_url: null`, and real `…/storage/menu-items/…` paths 404 today. Both
 * land on the same icon placeholder rather than an empty hole.
 *
 * `recyclingKey` matters inside a FlatList — without it a recycled row briefly shows
 * the previous item's photo while the new one decodes.
 */
export function RemoteImage({
  uri,
  size,
  radius = 12,
  icon = 'image-outline',
  recyclingKey,
  style,
}: {
  uri?: string | null;
  size: number;
  radius?: number;
  icon?: string;
  recyclingKey?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const [failed, setFailed] = useState(false);
  const showPlaceholder = !uri || failed;

  return (
    <View
      style={[
        styles.frame,
        { width: size, height: size, borderRadius: radius },
        style,
      ]}
    >
      {/* The icon always renders *underneath*. A slow, missing or silently-failed
          image then degrades to it instead of leaving an empty hole — onError is not
          guaranteed to fire promptly on a hung request. */}
      <Ionicons name={icon as any} size={Math.round(size * 0.36)} color="#4a8a82" />
      {!showPlaceholder && (
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
          recyclingKey={recyclingKey}
          onError={() => setFailed(true)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: '#082926',
    borderWidth: 1,
    borderColor: '#1a5048',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
