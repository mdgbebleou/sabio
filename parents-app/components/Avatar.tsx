import React from 'react';
import { Image, View, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AvatarProps {
  url?: string | null;
  size?: number;
  isLoading?: boolean;
}

export function Avatar({ url, size = 80, isLoading = false }: AvatarProps) {
  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {isLoading ? (
        <ActivityIndicator size="small" color="#1e3a8a" />
      ) : url ? (
        <Image source={{ uri: url }} style={[styles.image, containerStyle]} />
      ) : (
        <View style={[styles.placeholder, containerStyle]}>
          <Ionicons name="person" size={size * 0.4} color="#94a3b8" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#cbd5e1',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#94a3b8',
    width: '100%',
    height: '100%',
  },
});
