import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ParentLayout from './components/ParentLayout';

export default function App() {
  const [activeTab, setActiveTab] = useState<'Home' | 'Academics' | 'Fees' | 'Messages' | 'More'>('Home');

  return (
    <ParentLayout activeTab={activeTab} onTabPress={(tab) => setActiveTab(tab as any)}>
      <View style={styles.container}>
        <Text style={styles.text}>Welcome to the Parent Portal</Text>
        <Text style={styles.subText}>Current Active Tab: {activeTab}</Text>
      </View>
    </ParentLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
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
