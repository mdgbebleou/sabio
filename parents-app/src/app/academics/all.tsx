import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ParentLayout from '../../../components/ParentLayout';
import { useTheme } from '@/hooks/use-theme';
import { useStudent } from '../../context/StudentContext';

const AllSubjectsScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const { selectedStudent, linkedStudents } = useStudent();

  const currentStudent = selectedStudent || linkedStudents[0];
  const subjects = currentStudent?.subjects || [];

  return (
    <ParentLayout activeTab="Academics">
      <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={{ padding: 20, maxWidth: 600, width: '100%', alignSelf: 'center' }}>
        
        {/* HEADER */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 8, borderRadius: 12, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }}>
            <Ionicons name="arrow-back" size={20} color={theme.text} />
          </TouchableOpacity>
          <View>
            <Text style={{ fontSize: 24, fontWeight: '950', color: theme.text }}>All Subjects</Text>
            <Text style={{ fontSize: 13, color: theme.icon }}>{currentStudent ? `${currentStudent.firstName} ${currentStudent.lastName}` : 'Student Grades'}</Text>
          </View>
        </View>

        {/* SUBJECTS LIST */}
        <View style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 24, padding: 16 }}>
          {subjects.length === 0 ? (
            <Text style={{ textAlign: 'center', color: theme.icon, padding: 20 }}>No subjects recorded yet.</Text>
          ) : (
            subjects.map((sub: any, idx: number) => (
              <TouchableOpacity
                key={idx}
                onPress={() => router.push(`/academics/detail?subject=${encodeURIComponent(sub.name)}&score=${sub.score}&studentId=${currentStudent?.id}` as any)}
                style={{
                  paddingVertical: 14,
                  borderBottomWidth: idx < subjects.length - 1 ? 1 : 0,
                  borderColor: theme.border,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <View>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: theme.text }}>{sub.name}</Text>
                  <Text style={{ fontSize: 12, color: theme.icon, marginTop: 2 }}>Tap to view breakdown →</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 18, fontWeight: '900', color: theme.tint }}>{sub.score}%</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

      </ScrollView>
    </ParentLayout>
  );
};

export default AllSubjectsScreen;