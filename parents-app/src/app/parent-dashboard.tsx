import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ParentLayout from '../../components/ParentLayout';
import { supabase } from '../services/supabase';
import { useTheme } from '@/hooks/use-theme';
import { useStudent } from '../context/StudentContext';
import { AIInsightsCard } from '../../components/AIInsightsCard'; // ✨ 1. Imported the AI component

interface LinkedStudent {
  id: string;
  firstName: string;
  lastName: string;
  className: string;
  customId: string;
  avatarUrl?: string;
  attendancePercentage: number;
  academicAverage: number;
  outstandingBalance: number;
  totalFees: number;
  paidFees: number;
  unreadMessagesCount: number;
  subjects: Array<{ name: string; score: number }>;
}

const ParentDashboard: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const { selectedStudent, setSelectedStudent, linkedStudents, setLinkedStudents, loadingStudents } = useStudent();
  
  const [loading, setIsLoading] = useState(true);
  const [parentFirstName, setParentFirstName] = useState('User');
  const [isChildSelectorOpen, setIsChildSelectorOpen] = useState(false);
  const [tempSelectedStudent, setTempSelectedStudent] = useState<LinkedStudent | null>(null);
  
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    let isMounted = true;

    const loadParentDashboardData = async () => {
      try {
        setIsLoading(true);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          if (isMounted) setIsLoading(false);
          return;
        }

        // 1. Clear stale context data immediately for fresh session isolation
        setLinkedStudents([]);
        setSelectedStudent(null);

        // 2. Fetch Parent Profile First Name (Ensuring a clean name is ALWAYS displayed)
        const { data: profileData } = await supabase
          .from('profiles')
          .select('first_name, full_name, name, username')
          .eq('id', session.user.id)
          .single();

        if (isMounted) {
          const rawName = 
            profileData?.first_name || 
            profileData?.full_name || 
            profileData?.name || 
            profileData?.username || 
            session.user.user_metadata?.first_name || 
            session.user.user_metadata?.full_name ||
            session.user.user_metadata?.name ||
            (session.user.email ? session.user.email.split('@')[0] : 'User');

          // Extract the first word/name and capitalize it nicely
          const firstName = rawName.toString().trim().split(' ')[0];
          const capitalizedName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();

          setParentFirstName(capitalizedName);
        }

        // 3. Check for unread notifications for badge
        const { count: unreadNotifCount } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', session.user.id)
          .eq('is_read', false);

        if (isMounted) {
          setHasUnreadNotifications((unreadNotifCount || 0) > 0);
        }

        // 4. Fetch Linked Students strictly scoped to current session user id
        const { data: studentsData } = await supabase
          .from('students')
          .select('*')
          .eq('parent_id', session.user.id);

        if (studentsData && studentsData.length > 0 && isMounted) {
          const formattedStudents: LinkedStudent[] = studentsData.map((st: Record<string, unknown>) => ({
            id: st.id as string,
            firstName: (st.first_name as string) || '',
            lastName: (st.last_name as string) || '',
            className: (st.class_name as string) || 'Unassigned',
            customId: (st.custom_id as string) || '',
            avatarUrl: (st.avatar_url as string) || undefined,
            attendancePercentage: (st.attendance_score as number) || 100,
            academicAverage: (st.academic_score as number) || 0,
            outstandingBalance: (st.outstanding_balance as number) || 0,
            totalFees: (st.total_fees as number) || 0,
            paidFees: (st.paid_fees as number) || 0,
            unreadMessagesCount: (st.unread_messages_count as number) || 0,
            subjects: (st.subjects as Array<{ name: string; score: number }>) || [],
          }));

          setLinkedStudents(formattedStudents);
          setSelectedStudent(formattedStudents[0]);
          setTempSelectedStudent(formattedStudents[0]);
        } else if (isMounted) {
          setLinkedStudents([]);
          setSelectedStudent(null);
        }

      } catch (err) {
        console.error('Error fetching parent dashboard data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadParentDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading || loadingStudents) {
    return (
      <ParentLayout activeTab="Home">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, backgroundColor: theme.background }}>
          <ActivityIndicator size="large" color={theme.tint} />
          <Text style={{ marginTop: 12, color: theme.icon, fontSize: 14 }}>Loading parent dashboard...</Text>
        </View>
      </ParentLayout>
    );
  }

  return (
    <ParentLayout activeTab="Home">
      <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={{ padding: 20, maxWidth: 600, width: '100%', alignSelf: 'center' }}>
        
        {/* TIME-OF-DAY GREETING & HEADER ACTIONS */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <View>
            <Text style={{ fontSize: 14, color: theme.icon, fontWeight: '600' }}>{getGreeting()},</Text>
            <Text style={{ fontSize: 26, fontWeight: '900', color: theme.text, marginTop: 2 }}>{parentFirstName}</Text>
          </View>
          
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              onPress={() => router.push('/calendar' as any)}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: theme.card,
                borderWidth: 1,
                borderColor: theme.border,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.03,
                shadowRadius: 8,
                elevation: 2
              }}
            >
              <Ionicons name="calendar-outline" size={20} color={theme.text} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setHasUnreadNotifications(false);
                router.push('/notifications' as any);
              }}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: theme.card,
                borderWidth: 1,
                borderColor: theme.border,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.03,
                shadowRadius: 8,
                elevation: 2,
                position: 'relative'
              }}
            >
              <Ionicons name="notifications-outline" size={20} color={theme.text} />
              {hasUnreadNotifications && (
                <View style={{ position: 'absolute', top: 10, right: 10, width: 9, height: 9, borderRadius: 4.5, backgroundColor: theme.tint }} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* ✨ 2. AI INTELLIGENCE CARD PLACED HERE FOR EASY ACCESS */}
        <AIInsightsCard 
          appType="parent" 
          moduleName="calendar" 
          title="Parent AI Support Assistant" 
        />

        {linkedStudents.length === 0 ? (
          <View style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 20, padding: 40, alignItems: 'center', marginTop: 20 }}>
            <Text style={{ color: theme.icon, textAlign: 'center', fontSize: 14 }}>
              No student wards are currently linked to your parent account. Please contact school administration.
            </Text>
          </View>
        ) : (
          selectedStudent && (
            <View>
              {/* TOP CHILD SELECTOR BAR */}
              <TouchableOpacity
                onPress={() => {
                  setTempSelectedStudent(selectedStudent);
                  setIsChildSelectorOpen(true);
                }}
                style={{
                  backgroundColor: theme.card,
                  borderWidth: 1,
                  borderColor: theme.border,
                  borderRadius: 20,
                  padding: 14,
                  marginBottom: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.03,
                  shadowRadius: 8,
                  elevation: 2
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: theme.border, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
                    {selectedStudent.avatarUrl ? (
                      <Image source={{ uri: selectedStudent.avatarUrl }} style={{ width: '100%', height: '100%' }} />
                    ) : (
                      <Text style={{ fontWeight: 'bold', color: theme.icon, fontSize: 16 }}>
                        {selectedStudent.firstName.slice(0, 1)}{selectedStudent.lastName.slice(0, 1)}
                      </Text>
                    )}
                  </View>
                  <View>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: theme.text }}>
                      {selectedStudent.firstName} {selectedStudent.lastName}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                      <View style={{ backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                        <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#166534' }}>{selectedStudent.className}</Text>
                      </View>
                      <Text style={{ fontSize: 11, color: theme.icon }}>{selectedStudent.customId}</Text>
                    </View>
                  </View>
                </View>
                <Text style={{ fontSize: 16, color: theme.icon, fontWeight: 'bold', transform: [{ rotate: '90deg' }] }}>›</Text>
              </TouchableOpacity>

              {/* METRIC CARDS GRID */}
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
                <TouchableOpacity 
                  onPress={() => router.push('/academics' as any)}
                  style={{ flex: 1, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 20, padding: 18 }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Text style={{ fontSize: 30, fontWeight: '900', color: theme.text }}>{selectedStudent.academicAverage}%</Text>
                    <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name="bar-chart-outline" size={16} color="#166534" />
                    </View>
                  </View>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: theme.icon, marginTop: 8 }}>Current Average</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => router.push('/attendance' as any)}
                  style={{ flex: 1, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 20, padding: 18 }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Text style={{ fontSize: 30, fontWeight: '900', color: theme.text }}>{selectedStudent.attendancePercentage}%</Text>
                    <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: '#166534', fontSize: 12, fontWeight: 'bold' }}>✓</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: theme.icon, marginTop: 8 }}>Attendance</Text>
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
                <TouchableOpacity 
                  onPress={() => router.push('/fees' as any)}
                  style={{ flex: 1, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 20, padding: 18 }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Text style={{ fontSize: 20, fontWeight: '900', color: theme.text }} numberOfLines={1}>GHS {selectedStudent.outstandingBalance.toLocaleString()}</Text>
                    <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#fef3c7', alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name="wallet-outline" size={16} color="#b45309" />
                    </View>
                  </View>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: theme.icon, marginTop: 8 }}>Outstanding</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => router.push('/messages' as any)}
                  style={{ flex: 1, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 20, padding: 18 }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Text style={{ fontSize: 30, fontWeight: '900', color: theme.text }}>{selectedStudent.unreadMessagesCount}</Text>
                    <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      <Ionicons name="mail-outline" size={16} color="#1d4ed8" />
                      {selectedStudent.unreadMessagesCount > 0 && (
                        <View style={{ position: 'absolute', top: -4, right: -4, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: theme.tint, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 }}>
                          <Text style={{ color: '#ffffff', fontSize: 9, fontWeight: 'bold' }}>{selectedStudent.unreadMessagesCount}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: theme.icon, marginTop: 8 }}>Unread Messages</Text>
                </TouchableOpacity>
              </View>

              {/* ACADEMIC PERFORMANCE CARD */}
              <View style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 24, padding: 20, marginBottom: 20 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: theme.text }}>Academic Performance</Text>
                  <Text style={{ fontSize: 22, fontWeight: '900', color: theme.text }}>{selectedStudent.academicAverage}%</Text>
                </View>

                <View style={{ height: 8, backgroundColor: theme.border, borderRadius: 4, overflow: 'hidden', marginBottom: 20 }}>
                  <View style={{ height: '100%', width: `${selectedStudent.academicAverage}%`, backgroundColor: theme.tint, borderRadius: 4 }} />
                </View>

                {selectedStudent.subjects.length === 0 ? (
                  <Text style={{ fontSize: 13, color: theme.icon, fontStyle: 'italic', paddingVertical: 8 }}>No subject results recorded yet.</Text>
                ) : (
                  selectedStudent.subjects.map((sub, idx) => (
                    <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: idx < selectedStudent.subjects.length - 1 ? 1 : 0, borderColor: theme.border }}>
                      <Text style={{ fontSize: 14, color: theme.text, fontWeight: '500' }}>{sub.name}</Text>
                      <Text style={{ fontSize: 14, color: theme.tint, fontWeight: '800' }}>{sub.score}%</Text>
                    </View>
                  ))
                )}

                <TouchableOpacity style={{ marginTop: 16, alignItems: 'center', paddingVertical: 8 }} onPress={() => router.push('/academics' as any)}>
                  <Text style={{ fontSize: 13, fontWeight: 'bold', color: theme.tint }}>View Academic Performance →</Text>
                </TouchableOpacity>
              </View>
            </View>
          )
        )}

        {/* SELECT CHILD MODAL */}
        <Modal
          visible={isChildSelectorOpen}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsChildSelectorOpen(false)}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: theme.card, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40, maxHeight: '80%' }}>
              <View style={{ alignSelf: 'center', width: 40, height: 4, backgroundColor: theme.border, borderRadius: 2, marginBottom: 20 }} />

              <Text style={{ fontSize: 20, fontWeight: '900', color: theme.text, marginBottom: 6 }}>Select Child</Text>
              <Text style={{ fontSize: 13, color: theme.icon, marginBottom: 20 }}>Choose a child to view their school information.</Text>

              <ScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: 20 }}>
                <View style={{ gap: 12 }}>
                  {linkedStudents.map((child) => {
                    const isSelected = tempSelectedStudent?.id === child.id;
                    return (
                      <TouchableOpacity
                        key={child.id}
                        onPress={() => setTempSelectedStudent(child)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: 16,
                          borderRadius: 20,
                          borderWidth: isSelected ? 2 : 1,
                          borderColor: isSelected ? theme.tint : theme.border,
                          backgroundColor: theme.card
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                          <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: theme.border, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
                            {child.avatarUrl ? (
                              <Image source={{ uri: child.avatarUrl }} style={{ width: '100%', height: '100%' }} />
                            ) : (
                              <Text style={{ fontWeight: 'bold', color: theme.icon, fontSize: 16 }}>
                                {child.firstName.slice(0, 1)}{child.lastName.slice(0, 1)}
                              </Text>
                            )}
                          </View>
                          <View>
                            <Text style={{ fontSize: 15, fontWeight: '800', color: theme.text }}>
                              {child.firstName} {child.lastName}
                            </Text>
                            <Text style={{ fontSize: 11, color: theme.icon, marginTop: 4 }}>ID: {child.customId}</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>

              <TouchableOpacity
                onPress={() => {
                  if (tempSelectedStudent) {
                    setSelectedStudent(tempSelectedStudent);
                  }
                  setIsChildSelectorOpen(false);
                }}
                style={{ backgroundColor: theme.tint, paddingVertical: 16, borderRadius: 16, alignItems: 'center' }}
              >
                <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: 'bold' }}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </ScrollView>
    </ParentLayout>
  );
};

export default ParentDashboard;
