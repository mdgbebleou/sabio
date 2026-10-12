import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Image, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ParentLayout from '../../components/ParentLayout';
import { supabase } from '../services/supabase';
import { useTheme } from '@/hooks/use-theme';
import { useStudent } from '../context/StudentContext';

interface AttendanceRecord {
  id: string;
  date: string;
  status: 'Present' | 'Late' | 'Absent';
  remark?: string;
}

const AttendanceScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  
  // Consume global student context
  const { selectedStudent, setSelectedStudent, linkedStudents, loadingStudents } = useStudent();
  
  const [isChildSelectorOpen, setIsChildSelectorOpen] = useState(false);
  const [tempSelectedStudent, setTempSelectedStudent] = useState(selectedStudent);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  // Sync temp selector when global selectedStudent changes
  useEffect(() => {
    if (selectedStudent) {
      setTempSelectedStudent(selectedStudent);
    }
  }, [selectedStudent]);

  // Fetch attendance records whenever selectedStudent changes
  useEffect(() => {
    if (!selectedStudent) return;

    let isMounted = true;
    const loadAttendanceRecords = async () => {
      try {
        setLoadingRecords(true);
        const { data: attData, error } = await supabase
          .from('attendance_records')
          .select(`
            id,
            status,
            remark,
            session:attendance_sessions(date)
          `)
          .eq('student_id', selectedStudent.id);

        if (!error && attData && isMounted) {
          const formatted: AttendanceRecord[] = attData.map((a: Record<string, unknown>) => {
            const sessionObj = a.session as { date?: string } | null;
            const rawDate = sessionObj?.date ? new Date(sessionObj.date) : new Date();
            return {
              id: a.id as string,
              date: rawDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              status: (a.status as 'Present' | 'Late' | 'Absent') || 'Present',
              remark: (a.remark as string) || undefined,
            };
          });
          formatted.sort((x, y) => new Date(y.date).getTime() - new Date(x.date).getTime());
          setRecords(formatted);
        }
      } catch (err) {
        console.error('Error loading attendance records:', err);
      } finally {
        if (isMounted) setLoadingRecords(false);
      }
    };

    loadAttendanceRecords();
    return () => { isMounted = false; };
  }, [selectedStudent]);

  const getStatusBadge = (status: 'Present' | 'Late' | 'Absent') => {
    switch (status) {
      case 'Present':
        return { bg: '#dcfce7', color: '#166534', icon: 'checkmark-circle' };
      case 'Late':
        return { bg: '#fef3c7', color: '#b45309', icon: 'time' };
      case 'Absent':
        return { bg: '#fee2e2', color: '#991b1b', icon: 'close-circle' };
    }
  };

  if (loadingStudents) {
    return (
      <ParentLayout activeTab="Home">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
          <ActivityIndicator size="large" color={theme.tint} />
          <Text style={{ marginTop: 12, color: theme.icon, fontSize: 14 }}>Loading attendance records...</Text>
        </View>
      </ParentLayout>
    );
  }

  return (
    <ParentLayout activeTab="Home">
      <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={{ padding: 20, maxWidth: 600, width: '100%', alignSelf: 'center' }}>
        
        {/* HEADER */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontWeight: '900', color: theme.text }}>Attendance Overview</Text>
        </View>

        {/* CHILD SELECTOR BAR */}
        {selectedStudent && (
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
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: theme.border, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
                {selectedStudent.avatarUrl ? (
                  <Image source={{ uri: selectedStudent.avatarUrl }} style={{ width: '100%', height: '100%' }} />
                ) : (
                  <Text style={{ fontWeight: 'bold', color: theme.icon, fontSize: 15 }}>
                    {selectedStudent.firstName.slice(0, 1)}{selectedStudent.lastName.slice(0, 1)}
                  </Text>
                )}
              </View>
              <View>
                <Text style={{ fontSize: 15, fontWeight: '800', color: theme.text }}>
                  {selectedStudent.firstName} {selectedStudent.lastName}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 }}>
                  <View style={{ backgroundColor: '#dcfce7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#166534' }}>{selectedStudent.className}</Text>
                  </View>
                </View>
              </View>
            </View>
            <Ionicons name="chevron-down" size={18} color={theme.icon} />
          </TouchableOpacity>
        )}

        {/* SUMMARY CARD */}
        <View style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 24, padding: 20, marginBottom: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontSize: 12, fontWeight: '700', color: theme.icon, marginBottom: 4 }}>OVERALL RATE</Text>
            <Text style={{ fontSize: 36, fontWeight: '900', color: theme.text }}>{selectedStudent?.attendancePercentage || 100}%</Text>
            <Text style={{ fontSize: 12, color: '#166534', fontWeight: 'bold', marginTop: 4 }}>Active Record</Text>
          </View>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="shield-checkmark" size={32} color="#166534" />
          </View>
        </View>

        {/* ATTENDANCE HISTORY LIST */}
        <Text style={{ fontSize: 16, fontWeight: '800', color: theme.text, marginBottom: 12 }}>Recent Log</Text>
        
        {loadingRecords ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="small" color={theme.tint} />
          </View>
        ) : records.length === 0 ? (
          <View style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 20, padding: 30, alignItems: 'center' }}>
            <Ionicons name="calendar-outline" size={32} color={theme.icon} style={{ marginBottom: 8 }} />
            <Text style={{ color: theme.icon, fontSize: 13, textAlign: 'center' }}>No attendance logs recorded for this term yet.</Text>
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            {records.map((rec) => {
              const badge = getStatusBadge(rec.status);
              return (
                <View 
                  key={rec.id}
                  style={{
                    backgroundColor: theme.card,
                    borderWidth: 1,
                    borderColor: theme.border,
                    borderRadius: 16,
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Ionicons name={badge.icon as any} size={20} color={badge.color} />
                    <View>
                      <Text style={{ fontSize: 15, fontWeight: '700', color: theme.text }}>{rec.date}</Text>
                      {rec.remark && <Text style={{ fontSize: 11, color: theme.icon, marginTop: 2 }}>{rec.remark}</Text>}
                    </View>
                  </View>
                  <View style={{ backgroundColor: badge.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                    <Text style={{ fontSize: 11, fontWeight: 'bold', color: badge.color }}>{rec.status}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* SELECT CHILD BOTTOM SHEET MODAL */}
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
              <Text style={{ fontSize: 13, color: theme.icon, marginBottom: 20 }}>Choose a child to view their attendance.</Text>

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
                          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: theme.border, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
                            {child.avatarUrl ? (
                              <Image source={{ uri: child.avatarUrl }} style={{ width: '100%', height: '100%' }} />
                            ) : (
                              <Text style={{ fontWeight: 'bold', color: theme.icon, fontSize: 15 }}>
                                {child.firstName.slice(0, 1)}{child.lastName.slice(0, 1)}
                              </Text>
                            )}
                          </View>
                          <View>
                            <Text style={{ fontSize: 15, fontWeight: '800', color: theme.text }}>
                              {child.firstName} {child.lastName}
                            </Text>
                            <Text style={{ fontSize: 11, color: theme.icon, marginTop: 2 }}>{child.className}</Text>
                          </View>
                        </View>

                        <View style={{
                          width: 22,
                          height: 22,
                          borderRadius: 11,
                          borderWidth: isSelected ? 0 : 2,
                          borderColor: theme.border,
                          backgroundColor: isSelected ? theme.tint : 'transparent',
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
                  backgroundColor: theme.tint,
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

export default AttendanceScreen;
