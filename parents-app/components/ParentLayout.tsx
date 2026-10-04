import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface ParentLayoutProps {
  children: React.ReactNode;
  activeTab: 'Home' | 'Academics' | 'Fees' | 'Messages' | 'More';
  onTabPress: (tab: string) => void;
}

export default function ParentLayout({ children, activeTab, onTabPress }: ParentLayoutProps) {
  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/images/icon.png')}
            style={styles.logoImage} 
            resizeMode="contain" 
          />
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.profileButton}>
            <View style={styles.avatarPlaceholder} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#1e293b" />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content Area */}
      <View style={styles.content}>
        {children}
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={[styles.navItem, activeTab === 'Home' && styles.activeNavItem]} 
          onPress={() => onTabPress('Home')}
        >
          <Ionicons name="home" size={22} color={activeTab === 'Home' ? '#1e3a8a' : '#64748b'} />
          <Text style={[styles.navText, activeTab === 'Home' && styles.activeNavText]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navItem, activeTab === 'Academics' && styles.activeNavItem]} 
          onPress={() => onTabPress('Academics')}
        >
          <Ionicons name="school-outline" size={22} color={activeTab === 'Academics' ? '#1e3a8a' : '#64748b'} />
          <Text style={[styles.navText, activeTab === 'Academics' && styles.activeNavText]}>Academics</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navItem, activeTab === 'Fees' && styles.activeNavItem]} 
          onPress={() => onTabPress('Fees')}
        >
          <MaterialCommunityIcons name="wallet-outline" size={22} color={activeTab === 'Fees' ? '#1e3a8a' : '#64748b'} />
          <Text style={[styles.navText, activeTab === 'Fees' && styles.activeNavText]}>Fees</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navItem, activeTab === 'Messages' && styles.activeNavItem]} 
          onPress={() => onTabPress('Messages')}
        >
          <View>
            <Ionicons name="mail-outline" size={22} color={activeTab === 'Messages' ? '#1e3a8a' : '#64748b'} />
            <View style={styles.messageBadge} />
          </View>
          <Text style={[styles.navText, activeTab === 'Messages' && styles.activeNavText]}>Messages</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navItem, activeTab === 'More' && styles.activeNavItem]} 
          onPress={() => onTabPress('More')}
        >
          <Ionicons name="menu-outline" size={24} color={activeTab === 'More' ? '#1e3a8a' : '#64748b'} />
          <Text style={[styles.navText, activeTab === 'More' && styles.activeNavText]}>More</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    width: 120,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e2e8f0',
    overflow: 'hidden',
  },
  avatarPlaceholder: {
    flex: 1,
    backgroundColor: '#cbd5e1',
  },
  notificationButton: {
    position: 'relative',
    padding: 4,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#dc2626',
  },
  content: {
    flex: 1,
  },
  bottomNav: {
    height: 65,
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
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
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  navText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  activeNavText: {
    color: '#1e3a8a',
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
