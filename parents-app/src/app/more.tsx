import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../services/supabase';
import ParentLayout from '../../components/ParentLayout';
import { useAppTheme } from '../context/ThemeContext';
import { useTheme } from '@/hooks/use-theme';

export default function MoreScreen() {
  const [activeTab, setActiveTab] = useState<'Home' | 'Academics' | 'Fees' | 'Messages' | 'More'>('More');
  const [isLoading, setIsLoading] = useState(true);
  const theme = useTheme();

  const [userProfile, setUserProfile] = useState<{
    fullName: string;
    email: string;
    role: string;
  } | null>(null);
  const [childrenList, setChildrenList] = useState<Array<{
    id: string;
    name: string;
    className: string;
    studentId: string;
  }>>([]);

  const { themePreference, setThemePreference } = useAppTheme();
  const [isThemeModalVisible, setIsThemeModalVisible] = useState(false);
  const systemColorScheme = useColorScheme();

  const router = useRouter();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace('/login' as any);
        return;
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const firstName = profileData?.first_name || '';
      const lastName = profileData?.last_name || '';
      const combinedName = `${firstName} ${lastName}`.trim();

      const dbName = 
        combinedName || 
        profileData?.full_name || 
        profileData?.name || 
        profileData?.username || 
        user.user_metadata?.full_name || 
        user.user_metadata?.name;

      const fallbackName = user.email ? user.email.split('@')[0] : 'N/A';

      setUserProfile({
        fullName: dbName || fallbackName,
        email: user.email || 'N/A',
        role: profileData?.role || user.user_metadata?.role || 'Parent / Guardian',
      });

      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('parent_id', user.id);

      if (!studentsError && studentsData && studentsData.length > 0) {
        setChildrenList(
          studentsData.map((child: any) => ({
            id: child.id || Math.random().toString(),
            name: child.full_name || child.name || 'N/A',
            className: child.class_name || child.grade || 'N/A',
            studentId: child.student_id || child.id || 'N/A',
          }))
        );
      } else {
        setChildrenList([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabPress = (tab: string) => {
    setActiveTab(tab as any);
    if (tab === 'Home') router.replace('/parent-dashboard' as any);
    else if (tab === 'Academics') router.replace('/academics' as any);
    else if (tab === 'Fees') router.replace('/fees' as any);
    else if (tab === 'Messages') router.replace('/messages' as any);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.replace('/login' as any);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (isLoading) {
    return (
      <ParentLayout activeTab={activeTab} onTabPress={handleTabPress}>
        <View style={[styles.loaderContainer, { backgroundColor: theme.background }]}>
          <ActivityIndicator size="large" color={theme.tint} />
        </View>
      </ParentLayout>
    );
  }

  return (
    <ParentLayout activeTab={activeTab} onTabPress={handleTabPress}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={[styles.screenTitle, { color: theme.text }]}>More</Text>

        {/* Profile Card */}
        <TouchableOpacity style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarPlaceholder} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userProfile?.fullName || 'N/A'}</Text>
            <Text style={styles.profileRole}>{userProfile?.role || 'Parent / Guardian'}</Text>
            <Text style={styles.profileEmail}>{userProfile?.email || 'N/A'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </TouchableOpacity>

        {/* My Children Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionHeader, { color: theme.tint }]}>My Children</Text>
          <View style={[styles.cardGroup, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {childrenList.length > 0 ? (
              childrenList.map((child, index) => (
                <React.Fragment key={child.id}>
                  {index > 0 && <View style={[styles.divider, { backgroundColor: theme.border }]} />}
                  <TouchableOpacity style={styles.menuRow}>
                    <View style={styles.childAvatarPlaceholder} />
                    <View style={styles.menuRowText}>
                      <Text style={[styles.menuRowTitle, { color: theme.text }]}>{child.name}</Text>
                      <Text style={[styles.menuRowSubtitle, { color: theme.textSecondary }]}>
                        {child.className} • ID: {child.studentId}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
                  </TouchableOpacity>
                </React.Fragment>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>N/A (No children linked)</Text>
              </View>
            )}
          </View>
        </View>

        {/* Services Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionHeader, { color: theme.tint }]}>Services</Text>
          <View style={[styles.cardGroup, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <TouchableOpacity style={styles.menuRow}>
              <View style={[styles.iconBox, { backgroundColor: '#eff6ff' }]}>
                <Ionicons name="calendar-outline" size={20} color="#2563eb" />
              </View>
              <View style={styles.menuRowText}>
                <Text style={[styles.menuRowTitle, { color: theme.text }]}>Attendance</Text>
                <Text style={[styles.menuRowSubtitle, { color: theme.textSecondary }]}>View attendance records and history.</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <TouchableOpacity style={styles.menuRow}>
              <View style={[styles.iconBox, { backgroundColor: '#f0fdf4' }]}>
                <Ionicons name="today-outline" size={20} color="#16a34a" />
              </View>
              <View style={styles.menuRowText}>
                <Text style={[styles.menuRowTitle, { color: theme.text }]}>School Calendar</Text>
                <Text style={[styles.menuRowSubtitle, { color: theme.textSecondary }]}>View upcoming school activities and dates.</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <TouchableOpacity style={styles.menuRow}>
              <View style={[styles.iconBox, { backgroundColor: '#fff7ed' }]}>
                <Ionicons name="folder-outline" size={20} color="#ea580c" />
              </View>
              <View style={styles.menuRowText}>
                <Text style={[styles.menuRowTitle, { color: theme.text }]}>Documents</Text>
                <Text style={[styles.menuRowSubtitle, { color: theme.textSecondary }]}>Access reports, receipts, and records.</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Account & Preferences */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionHeader, { color: theme.tint }]}>Account & Preferences</Text>
          <View style={[styles.cardGroup, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <TouchableOpacity style={styles.menuRow}>
              <Ionicons name="person-outline" size={20} color={theme.textSecondary} style={styles.leftIcon} />
              <Text style={[styles.standardMenuText, { color: theme.text }]}>Profile Settings</Text>
              <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <TouchableOpacity style={styles.menuRow}>
              <Ionicons name="notifications-outline" size={20} color={theme.textSecondary} style={styles.leftIcon} />
              <Text style={[styles.standardMenuText, { color: theme.text }]}>Notification Preferences</Text>
              <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            {/* Appearance Trigger */}
            <TouchableOpacity style={styles.menuRow} onPress={() => setIsThemeModalVisible(true)}>
              <Ionicons name="contrast-outline" size={20} color={theme.textSecondary} style={styles.leftIcon} />
              <View style={styles.menuRowText}>
                <Text style={[styles.standardMenuText, { color: theme.text }]}>Appearance</Text>
                <Text style={[styles.menuRowSubtitle, { color: theme.textSecondary }]}>
                  {themePreference === 'system' ? 'System (Device)' : themePreference === 'light' ? 'Light Mode' : 'Dark Mode'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <TouchableOpacity style={styles.menuRow}>
              <Ionicons name="lock-closed-outline" size={20} color={theme.textSecondary} style={styles.leftIcon} />
              <Text style={[styles.standardMenuText, { color: theme.text }]}>Security</Text>
              <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <TouchableOpacity style={styles.menuRow}>
              <Ionicons name="help-circle-outline" size={20} color={theme.textSecondary} style={styles.leftIcon} />
              <Text style={[styles.standardMenuText, { color: theme.text }]}>Help & Support</Text>
              <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Help Banner Card */}
        <View style={[styles.helpCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.helpIconContainer}>
            <Ionicons name="headset-outline" size={24} color="#1e3a8a" />
          </View>
          <Text style={[styles.helpTitle, { color: theme.text }]}>Need help?</Text>
          <Text style={[styles.helpSubtitle, { color: theme.textSecondary }]}>Contact the school support team for any inquiries or assistance.</Text>
          <TouchableOpacity style={styles.supportButton}>
            <Ionicons name="chatbubble-outline" size={16} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.supportButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={[styles.logoutButton, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#dc2626" style={{ marginRight: 8 }} />
          <Text style={styles.logoutButtonText}>LOG OUT</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Theme Selection Modal */}
      <Modal
        visible={isThemeModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsThemeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Choose Appearance</Text>
            <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>Select how Sabio appears on your device.</Text>

            <TouchableOpacity 
              style={[styles.modalOption, themePreference === 'system' && styles.modalOptionActive]}
              onPress={() => { setThemePreference('system'); setIsThemeModalVisible(false); }}
            >
              <Ionicons name="phone-portrait-outline" size={20} color={themePreference === 'system' ? '#1e3a8a' : '#475569'} />
              <Text style={[styles.modalOptionText, themePreference === 'system' && styles.modalOptionTextActive]}>System (Use Device Theme)</Text>
              {themePreference === 'system' && <Ionicons name="checkmark" size={18} color="#1e3a8a" />}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.modalOption, themePreference === 'light' && styles.modalOptionActive]}
              onPress={() => { setThemePreference('light'); setIsThemeModalVisible(false); }}
            >
              <Ionicons name="sunny-outline" size={20} color={themePreference === 'light' ? '#1e3a8a' : '#475569'} />
              <Text style={[styles.modalOptionText, themePreference === 'light' && styles.modalOptionTextActive]}>Light</Text>
              {themePreference === 'light' && <Ionicons name="checkmark" size={18} color="#1e3a8a" />}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.modalOption, themePreference === 'dark' && styles.modalOptionActive]}
              onPress={() => { setThemePreference('dark'); setIsThemeModalVisible(false); }}
            >
              <Ionicons name="moon-outline" size={20} color={themePreference === 'dark' ? '#1e3a8a' : '#475569'} />
              <Text style={[styles.modalOptionText, themePreference === 'dark' && styles.modalOptionTextActive]}>Dark</Text>
              {themePreference === 'dark' && <Ionicons name="checkmark" size={18} color="#1e3a8a" />}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setIsThemeModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ParentLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 16,
  },
  profileCard: {
    backgroundColor: '#1e3a8a',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#cbd5e1',
    overflow: 'hidden',
    marginRight: 12,
  },
  avatarPlaceholder: {
    flex: 1,
    backgroundColor: '#94a3b8',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  profileRole: {
    fontSize: 12,
    color: '#cbd5e1',
    marginTop: 2,
  },
  profileEmail: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  cardGroup: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  divider: {
    height: 1,
    marginLeft: 14,
    marginRight: 14,
  },
  childAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
    marginRight: 12,
  },
  menuRowText: {
    flex: 1,
  },
  menuRowTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  menuRowSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  leftIcon: {
    marginRight: 14,
  },
  standardMenuText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  helpCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  helpIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  helpSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 16,
  },
  supportButton: {
    backgroundColor: '#1e3a8a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '100%',
  },
  supportButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fca5a5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  logoutButtonText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    marginBottom: 16,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f8fafc',
  },
  modalOptionActive: {
    backgroundColor: '#eff6ff',
  },
  modalOptionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
    marginLeft: 12,
  },
  modalOptionTextActive: {
    color: '#1e3a8a',
    fontWeight: '600',
  },
  modalCloseButton: {
    marginTop: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  modalCloseButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
});
