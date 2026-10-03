import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ParentDashboardScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Sabio Parent Portal Dashboard</Text>
      <Text style={styles.subText}>Welcome back</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  subText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
  },
});
