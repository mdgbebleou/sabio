import React, { useState } from 'react';
import { Slot, useRouter } from 'expo-router';
import ParentLayout from '../../components/ParentLayout';

export default function RootLayout() {
  const [activeTab, setActiveTab] = useState<'Home' | 'Academics' | 'Fees' | 'Messages' | 'More'>('Home');
  const router = useRouter();

  const handleTabPress = (tab: string) => {
    setActiveTab(tab as any);
    if (tab === 'Home') router.push('/');
    else router.push(`/${tab.toLowerCase()}` as any);
  };

  return (
    <ParentLayout activeTab={activeTab} onTabPress={handleTabPress}>
      <Slot />
    </ParentLayout>
  );
}
