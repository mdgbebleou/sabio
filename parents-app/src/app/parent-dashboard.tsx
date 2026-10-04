import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import ParentLayout from '../../components/ParentLayout';
import { useRouter } from 'expo-router';

export default function ParentDashboard() {
  const [activeTab, setActiveTab] = useState<'Home' | 'Academics' | 'Fees' | 'Messages' | 'More'>('Home');
  const router = useRouter();

  const handleTabPress = (tab: string) => {
    setActiveTab(tab as any);
    if (tab === 'Academics') {
      router.push('/academics' as any);
    } else if (tab === 'Fees') {
      router.push('/fees' as any);
    } else if (tab === 'Messages') {
      router.push('/messages' as any);
    } else if (tab === 'More') {
      router.push('/more' as any);
    }
  };

  return (
    <ParentLayout activeTab={activeTab} onTabPress={handleTabPress}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.welcomeText}>Welcome, Parent</Text>
        <Text style={styles.subText}>Here is an overview of your child's school activities.</Text>
      </ScrollView>
    </ParentLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  subText: {
    fontSize: 14,
    color: '#64748b',
  },
});
