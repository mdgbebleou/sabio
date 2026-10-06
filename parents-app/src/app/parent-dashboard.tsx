import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator, Modal } from 'react-native';
import ParentLayout from '../../components/ParentLayout';
import { supabase } from '../services/supabase';

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
  const [loading, setIsLoading] = useState(true);
  const [linkedStudents, setLinkedStudents] = useState<LinkedStudent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<LinkedStudent | null>(null);
  const [isChildSelectorOpen, setIsChildSelectorOpen] = useState(false);
  const [tempSelectedStudent, setTempSelectedStudent] = useState<LinkedStudent | null>(null);

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
            customId: (st.custom_id as string) || 'BFA-2026-0000',
            avatarUrl: (st.avatar_url as string) || undefined,
            attendancePercentage: (st.attendance_percentage as number) || 94,
            academicAverage: (st.academic_average as number) || 78,
            outstandingBalance: (st.outstanding_balance as number) || 1250,
            totalFees: (st.total_fees as number) || 5000,
            paidFees: (st.paid_fees as number) || 3750,
            unreadMessagesCount: (st.unread_messages_count as number) || 3,
            subjects: (st.subjects as Array<{ name: string; score: number }>) || [
              { name: 'Mathematics', score: 82 },
              { name: 'English Language', score: 76 },
              { name: 'Integrated Science', score: 79 }
            ],
          }));

          setLinkedStudents(formattedStudents);
          setSelectedStudent(formattedStudents[0]);
          setTempSelectedStudent(formattedStudents[0]);
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

  if (loading) {
    return (
      <ParentLayout>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
          <ActivityIndicator size="large" color="#002b49" />
          <Text style={{ marginTop: 12, color: '#64748b', fontSize: 14 }}>Loading parent dashboard...</Text>
        </View>
      </ParentLayout>
    );
  }

  return (
    <ParentLayout>
      <ScrollView style={{ flex: 1, backgroundColor: '#f8fafc' }} contentContainerStyle={{ padding: 20, maxWidth: 600, width: '100%', alignSelf: 'center' }}>
        
        {linkedStudents.length === 0 ? (
          <View style={{ backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 20, padding: 40, alignItems: 'center', marginTop: 40 }}>
            <Text style={{ color: '#64748b', textAlign: 'center', fontSize: 14 }}>
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
                  backgroundColor: '#ffffff',
                  borderWidth: 1,
                  borderColor: '#e2e8f0',
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
                  <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#e2e8f0', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
                    {selectedStudent.avatarUrl ? (
                      <Image source={{ uri: selectedStudent.avatarUrl }} style={{ width: '100%', height: '100%' }} />
                    ) : (
                      <Text style={{ fontWeight: 'bold', color: '#475569', fontSize: 16 }}>
                        {selectedStudent.firstName.slice(0, 1)}{selectedStudent.lastName.slice(0, 1)}
                      </Text>
                    )}
                  </View>
                  <View>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: '#0f172a' }}>
                      {selectedStudent.firstName} {selectedStudent.lastName}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                      <View style={{ backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                        <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#166534' }}>{selectedStudent.className}</Text>
                      </View>
                      <Text style={{ fontSize: 11, color: '#64748b' }}>{selectedStudent.customId}</Text>
                    </View>
                  </View>
                </View>
                <Text style={{ fontSize: 16, color: '#64748b', fontWeight: 'bold', transform: [{ rotate: '90deg' }] }}>›</Text>
              </TouchableOpacity>

              {/* METRIC CARDS GRID (2x2) */}
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
                {/* CURRENT AVERAGE */}
                <View style={{ flex: 1, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 20, padding: 18 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Text style={{ fontSize: 30, fontWeight: '900', color: '#0f172a' }}>{selectedStudent.academicAverage}%</Text>
                    <View style={{ backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                      <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#166534' }}>+2%</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748b', marginTop: 8 }}>Current Average</Text>
                </View>

                {/* ATTENDANCE */}
                <View style={{ flex: 1, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 20, padding: 18 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Text style={{ fontSize: 30, fontWeight: '900', color: '#0f172a' }}>{selectedStudent.attendancePercentage}%</Text>
                    <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: '#166534', fontSize: 12 }}>✓</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748b', marginTop: 8 }}>Attendance</Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
                {/* OUTSTANDING BALANCE */}
                <View style={{ flex: 1, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 20, padding: 18 }}>
                  <Text style={{ fontSize: 22, fontWeight: '900', color: '#3d1c02' }}>GHS {selectedStudent.outstandingBalance.toLocaleString()}</Text>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748b', marginTop: 8 }}>Outstanding</Text>
                </View>

                {/* UNREAD MESSAGES */}
                <View style={{ flex: 1, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 20, padding: 18 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Text style={{ fontSize: 30, fontWeight: '900', color: '#0f172a' }}>{selectedStudent.unreadMessagesCount}</Text>
                    <View style={{ position: 'relative', padding: 4 }}>
                      <View style={{ width: 24, height: 24, borderRadius: 6, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 12 }}>✉</Text>
                      </View>
                      <View style={{ position: 'absolute', top: 2, right: 2, width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444' }} />
                    </View>
                  </View>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748b', marginTop: 8 }}>Unread Messages</Text>
                </View>
              </View>

              {/* ACADEMIC PERFORMANCE CARD */}
              <View style={{ backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 24, padding: 20, marginBottom: 20 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: '#002b49' }}>Academic Performance</Text>
                  <Text style={{ fontSize: 22, fontWeight: '900', color: '#002b49' }}>{selectedStudent.academicAverage}%</Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <View style={{ backgroundColor: '#dcfce7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                    <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#166534' }}>Good Progress</Text>
                  </View>
                </View>

                {/* PROGRESS BAR */}
                <View style={{ height: 8, backgroundColor: '#e2e8f0', borderRadius: 4, overflow: 'hidden', marginBottom: 20 }}>
                  <View style={{ height: '100%', width: `${selectedStudent.academicAverage}%`, backgroundColor: '#002b49', borderRadius: 4 }} />
                </View>

                {/* SUBJECTS LIST */}
                {selectedStudent.subjects.map((sub, idx) => (
                  <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: idx < selectedStudent.subjects.length - 1 ? 1 : 0, borderColor: '#f1f5f9' }}>
                    <Text style={{ fontSize: 14, color: '#334155', fontWeight: '500' }}>{sub.name}</Text>
                    <Text style={{ fontSize: 14, color: '#002b49', fontWeight: '800' }}>{sub.score}%</Text>
                  </View>
                ))}

                <TouchableOpacity style={{ marginTop: 16, alignItems: 'center', paddingVertical: 8 }}>
                  <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#002b49' }}>View Academic Performance →</Text>
                </TouchableOpacity>
              </View>

              {/* SCHOOL FEES CARD */}
              <View style={{ backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 24, padding: 20, marginBottom: 20 }}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#002b49', marginBottom: 12 }}>School Fees</Text>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ fontSize: 12, color: '#64748b' }}>Total: GHS {selectedStudent.totalFees.toLocaleString()}</Text>
                  <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#002b49' }}>Paid: GHS {selectedStudent.paidFees.toLocaleString()}</Text>
                </View>

                {/* FEES PROGRESS BAR */}
                <View style={{ height: 8, backgroundColor: '#e2e8f0', borderRadius: 4, overflow: 'hidden', marginBottom: 16 }}>
                  <View style={{ height: '100%', width: `${(selectedStudent.paidFees / selectedStudent.totalFees) * 100}%`, backgroundColor: '#002b49', borderRadius: 4 }} />
                </View>

                <View style={{ marginBottom: 20 }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748b' }}>Outstanding Balance</Text>
                  <Text style={{ fontSize: 24, fontWeight: '900', color: '#3d1c02', marginTop: 4 }}>GHS {selectedStudent.outstandingBalance.toLocaleString()}</Text>
                </View>

                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity style={{ flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#cbd5e1', backgroundColor: '#ffffff', alignItems: 'center' }}>
                    <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#334155' }}>View Fees</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#002b49', alignItems: 'center' }}>
                    <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#ffffff' }}>Make Payment</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )
        )}

        {/* SELECT CHILD BOTTOM SHEET MODAL */}
        <Modal
          visible={isChildSelectorOpen}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsChildSelectorOpen(false)}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: '#ffffff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40, maxHeight: '80%' }}>
              
              {/* DRAG HANDLE */}
              <View style={{ alignSelf: 'center', width: 40, height: 4, backgroundColor: '#cbd5e1', borderRadius: 2, marginBottom: 20 }} />

              <Text style={{ fontSize: 20, fontWeight: '900', color: '#0f172a', marginBottom: 6 }}>Select Child</Text>
              <Text style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>Choose a child to view their school information.</Text>

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
                          borderColor: isSelected ? '#002b49' : '#e2e8f0',
                          backgroundColor: '#ffffff'
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                          <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#e2e8f0', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
                            {child.avatarUrl ? (
                              <Image source={{ uri: child.avatarUrl }} style={{ width: '100%', height: '100%' }} />
                            ) : (
                              <Text style={{ fontWeight: 'bold', color: '#475569', fontSize: 16 }}>
                                {child.firstName.slice(0, 1)}{child.lastName.slice(0, 1)}
                              </Text>
                            )}
                          </View>
                          <View>
                            <Text style={{ fontSize: 15, fontWeight: '800', color: '#0f172a' }}>
                              {child.firstName} {child.lastName}
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                              <View style={{ backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                                <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#166534' }}>{child.className}</Text>
                              </View>
                              <Text style={{ fontSize: 11, color: '#64748b' }}>ID: {child.customId}</Text>
                            </View>
                          </View>
                        </View>

                        {/* RADIO CHECKBOX */}
                        <View style={{
                          width: 22,
                          height: 22,
                          borderRadius: 11,
                          borderWidth: isSelected ? 0 : 2,
                          borderColor: '#cbd5e1',
                          backgroundColor: isSelected ? '#002b49' : 'transparent',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {isSelected && <Text style={{ color: '#ffffff', fontSize: 11, fontWeight: 'bold' }}>✓</Text>}
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
                style={{
                  backgroundColor: '#002b49',
                  paddingVertical: 16,
                  borderRadius: 16,
                  alignItems: 'center'
                }}
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