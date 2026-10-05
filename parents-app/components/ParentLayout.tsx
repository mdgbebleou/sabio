import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';

interface ParentLayoutProps {
  children: React.ReactNode;
  activeTab: 'Home' | 'Academics' | 'Fees' | 'Messages' | 'More';
  onTabPress: (tab: string) => void;
}

export default function ParentLayout({ children, activeTab, onTabPress }: ParentLayoutProps) {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Main Content Area */}
      <View style={styles.content}>
        {children}
      </View>

      {/* Bottom Navigation Bar */}
      <View style={[styles.bottomNav, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        <TouchableOpacity 
          style={[styles.navItem, activeTab === 'Home' && [styles.activeNavItem, { backgroundColor: theme.tint + '15' }]]} 
          onPress={() => onTabPress('Home')}
        >
          <Ionicons name="home" size={22} color={activeTab === 'Home' ? theme.tint : theme.icon} />
          <Text style={[styles.navText, { color: theme.icon }, activeTab === 'Home' && [styles.activeNavText, { color: theme.tint }]]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navItem, activeTab === 'Academics' && [styles.activeNavItem, { backgroundColor: theme.tint + '15' }]]} 
          onPress={() => onTabPress('Academics')}
        >
          <Ionicons name="school-outline" size={22} color={activeTab === 'Academics' ? theme.tint : theme.icon} />
          <Text style={[styles.navText, { color: theme.icon }, activeTab === 'Academics' && [styles.activeNavText, { color: theme.tint }]]}>Academics</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navItem, activeTab === 'Fees' && [styles.activeNavItem, { backgroundColor: theme.tint + '15' }]]} 
          onPress={() => onTabPress('Fees')}
        >
          <MaterialCommunityIcons name="wallet-outline" size={22} color={activeTab === 'Fees' ? theme.tint : theme.icon} />
          <Text style={[styles.navText, { color: theme.icon }, activeTab === 'Fees' && [styles.activeNavText, { color: theme.tint }]]}>Fees</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navItem, activeTab === 'Messages' && [styles.activeNavItem, { backgroundColor: theme.tint + '15' }]]} 
          onPress={() => onTabPress('Messages')}
        >
          <View>
            <Ionicons name="mail-outline" size={22} color={activeTab === 'Messages' ? theme.tint : theme.icon} />
            <View style={styles.messageBadge} />
          </View>
          <Text style={[styles.navText, { color: theme.icon }, activeTab === 'Messages' && [styles.activeNavText, { color: theme.tint }]]}>Messages</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navItem, activeTab === 'More' && [styles.activeNavItem, { backgroundColor: theme.tint + '15' }]]} 
          onPress={() => onTabPress('More')}
        >
          <Ionicons name="menu-outline" size={24} color={activeTab === 'More' ? theme.tint : theme.icon} />
          <Text style={[styles.navText, { color: theme.icon }, activeTab === 'More' && [styles.activeNavText, { color: theme.tint }]]}>More</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  bottomNav: {
    height: 65,
    flexDirection: 'row',
    borderTopWidth: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 8,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 6,
  },
  activeNavItem: {
    borderRadius: 12,
    marginHorizontal: 4,
  },
  navText: {
    fontSize: 12,
    marginTop: 2,
  },
  activeNavText: {
    fontWeight: '600',
  },
  messageBadge: {
    position: 'absolute',
    top: 0,
    right: -2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#dc2626',
  },
});
