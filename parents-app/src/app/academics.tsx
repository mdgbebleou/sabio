import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ParentLayout from '../../components/ParentLayout';
import { useTheme } from '@/hooks/use-theme';
import { useStudent } from '../context/StudentContext';

interface SubjectPerformance {
  name: string;
  score: number;
  gradeRemark: 'Excellent' | 'Good' | 'Average' | 'Needs Improvement';
}

interface StudentAcademicRecord {
  id: string;
  firstName: string;
  lastName: string;
  className: string;
  customId: string;
  avatarUrl?: string;
  academicAverage: number;
  previousAverage: number;
  subjects: SubjectPerformance[];
}

// Helper to determine dynamic, industry-standard academic performance remarks
const getAcademicRemark = (score: number) => {
  if (score >= 85) return { label: 'Distinction', bg: '#dcfce7', color: '#166534' };
  if (score >= 75) return { label: 'Above Average', bg: '#dbeafe', color: '#1e40af' };
  if (score >= 60) return { label: 'Satisfactory', bg: '#fef3c7', color: '#b45309' };
  if (score >= 50) return { label: 'Pass', bg: '#f3f4f6', color: '#374151' };
  return { label: 'Needs Improvement', bg: '#fee2e2', color: '#991b1b' };
};

const AcademicsScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  
  // Consume global student context
  const { selectedStudent, setSelectedStudent, linkedStudents: rawLinkedStudents, loadingStudents } = useStudent();
  
  const [isChildSelectorOpen, setIsChildSelectorOpen] = useState(false);
  const [tempSelectedStudent, setTempSelectedStudent] = useState<StudentAcademicRecord | null>(null);

  // Map raw context students to local academic view model
  const linkedStudents: StudentAcademicRecord[] = rawLinkedStudents.map((st) => {
    const rawSubjects = st.subjects || [];
    const formattedSubjects: SubjectPerformance[] = rawSubjects.map(sub => ({
      name: sub.name,
      score: sub.score,
      gradeRemark: sub.score >= 80 ? 'Excellent' : sub.score >= 70 ? 'Good' : sub.score >= 50 ? 'Average' : 'Needs Improvement'
    }));

    const avgScore = st.academicAverage || 0;

    return {
      id: st.id,
      firstName: st.firstName,
      lastName: st.lastName,
      className: st.className,
      customId: st.customId,
      avatarUrl: st.avatarUrl,
      academicAverage: avgScore,
      previousAverage: avgScore > 0 ? avgScore - 4 : 0,
      subjects: formattedSubjects,
    };
  });

  const currentAcademicStudent: StudentAcademicRecord | null = selectedStudent
    ? linkedStudents.find(s => s.id === selectedStudent.id) || linkedStudents[0] || null
    : null;

useEffect(() => {
  if (currentAcademicStudent) {
    setTempSelectedStudent(currentAcademicStudent);
  }
}, [currentAcademicStudent?.id]);

  if (loadingStudents) {
    return (
      <ParentLayout activeTab="Academics">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
          <ActivityIndicator size="large" color={theme.tint} />
          <Text style={{ marginTop: 12, color: theme.icon, fontSize: 14 }}>Loading academic performance...</Text>
        </View>
      </ParentLayout>
    );
  }

  const averageDiff = currentAcademicStudent ? currentAcademicStudent.academicAverage - currentAcademicStudent.previousAverage : 0;
  const remarkInfo = currentAcademicStudent ? getAcademicRemark(currentAcademicStudent.academicAverage) : { label: 'Pending', bg: theme.border, color: theme.icon };

  return (
    <ParentLayout activeTab="Academics">
      <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={{ padding: 20, maxWidth: 600, width: '100%', alignSelf: 'center' }}>
        
        {/* HEADER TITLE */}
        <Text style={{ fontSize: 28, fontWeight: '900', color: theme.text, marginBottom: 16 }}>Academic Performance</Text>

        {linkedStudents.length === 0 ? (
          <View style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 20, padding: 40, alignItems: 'center', marginTop: 20 }}>
            <Text style={{ color: theme.icon, textAlign: 'center', fontSize: 14 }}>
              No student wards are currently linked to your account.
            </Text>
          </View>
        ) : (
          currentAcademicStudent && (
            <View>
              {/* CHILD SELECTOR TOP CARD */}
              <TouchableOpacity
                onPress={() => {
                  setTempSelectedStudent(currentAcademicStudent);
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
                    {currentAcademicStudent.avatarUrl ? (
                      <Image source={{ uri: currentAcademicStudent.avatarUrl }} style={{ width: '100%', height: '100%' }} />
                    ) : (
                      <Text style={{ fontWeight: 'bold', color: theme.icon, fontSize: 16 }}>
                        {currentAcademicStudent.firstName.slice(0, 1)}{currentAcademicStudent.lastName.slice(0, 1)}
                      </Text>
                    )}
                  </View>
                  <View>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: theme.text }}>
                      {currentAcademicStudent.firstName} {currentAcademicStudent.lastName}
                    </Text>
                    <Text style={{ fontSize: 11, color: theme.icon, marginTop: 2 }}>
                      {currentAcademicStudent.className} • Academic Year
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-down" size={18} color={theme.icon} />
              </TouchableOpacity>

              {/* OVERALL PERFORMANCE CARD */}
              <View style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 24, padding: 20, marginBottom: 24 }}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: theme.text, marginBottom: 12 }}>Overall Performance</Text>
                
                {/* PERCENTAGE AND DYNAMIC REMARK ROW */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ fontSize: 32, fontWeight: '900', color: theme.text }}>{currentAcademicStudent.academicAverage}%</Text>
                  <View style={{ backgroundColor: remarkInfo.bg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: remarkInfo.color }}>{remarkInfo.label}</Text>
                  </View>
                </View>

                {/* PREVIOUS AVERAGE METRIC ON ITS OWN CLEAN LINE */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 12, color: theme.icon }}>
                    Previous Term: <Text style={{ fontWeight: '700', color: theme.text }}>{currentAcademicStudent.previousAverage}%</Text> ({averageDiff >= 0 ? `+${averageDiff}%` : `${averageDiff}%`})
                  </Text>
                </View>

                {/* PROGRESS BAR */}
                <View style={{ height: 8, backgroundColor: theme.border, borderRadius: 4, overflow: 'hidden' }}>
                  <View style={{ height: '100%', width: `${currentAcademicStudent.academicAverage}%`, backgroundColor: theme.tint, borderRadius: 4 }} />
                </View>
              </View>

              {/* SUBJECT PERFORMANCE SECTION */}
              <Text style={{ fontSize: 18, fontWeight: '800', color: theme.text, marginBottom: 12 }}>Subject Performance</Text>

              <View style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 24, padding: 16, marginBottom: 20 }}>
                {currentAcademicStudent.subjects.length === 0 ? (
                  <View style={{ padding: 24, alignItems: 'center' }}>
                    <Text style={{ color: theme.icon, fontSize: 13, fontStyle: 'italic' }}>No subject grades recorded in the database yet.</Text>
                  </View>
                ) : (
                  currentAcademicStudent.subjects.map((sub, idx) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => router.push(`/academics/detail?subject=${sub.name}` as any)}
                      style={{
                        paddingVertical: 14,
                        borderBottomWidth: idx < currentAcademicStudent.subjects.length - 1 ? 1 : 0,
                        borderColor: theme.border
                      }}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <Text style={{ fontSize: 15, fontWeight: '700', color: theme.text }}>{sub.name}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Text style={{ fontSize: 16, fontWeight: '900', color: theme.text }}>{sub.score}%</Text>
                          <Text style={{ fontSize: 12, fontWeight: '600', color: sub.score >= 80 ? '#2563eb' : '#16a34a' }}>
                            ({sub.gradeRemark})
                          </Text>
                        </View>
                      </View>

                      {/* SUBJECT BAR */}
                      <View style={{ height: 6, backgroundColor: theme.border, borderRadius: 3, overflow: 'hidden' }}>
                        <View style={{ height: '100%', width: `${sub.score}%`, backgroundColor: sub.score >= 80 ? '#2563eb' : '#16a34a', borderRadius: 3 }} />
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </View>

              <TouchableOpacity 
                onPress={() => router.push('/academics/all' as any)}
                style={{ alignItems: 'center', paddingVertical: 12 }}
              >
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: theme.tint }}>View All Subjects →</Text>
              </TouchableOpacity>
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
              <Text style={{ fontSize: 13, color: theme.icon, marginBottom: 20 }}>Choose a child to view their academic performance.</Text>

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
                            <Text style={{ fontSize: 11, color: theme.icon, marginTop: 2 }}>{child.className} • ID: {child.customId}</Text>
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
                    const match = rawLinkedStudents.find(s => s.id === tempSelectedStudent.id);
                    if (match) setSelectedStudent(match);
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

export default AcademicsScreen;
