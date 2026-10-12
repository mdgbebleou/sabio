import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

interface StudentContextType {
  linkedStudents: LinkedStudent[];
  setLinkedStudents: React.Dispatch<React.SetStateAction<LinkedStudent[]>>;
  selectedStudent: LinkedStudent | null;
  setSelectedStudent: (student: LinkedStudent | null) => void;
  loadingStudents: boolean;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [linkedStudents, setLinkedStudents] = useState<LinkedStudent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<LinkedStudent | null>(null);
  const [loadingStudents, setLoadingStudents] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchStudents = async () => {
      try {
        setLoadingStudents(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          if (isMounted) {
            setLinkedStudents([]);
            setSelectedStudent(null);
            setLoadingStudents(false);
          }
          return;
        }

        const { data: studentsData, error } = await supabase
          .from('students')
          .select('*')
          .eq('parent_id', session.user.id);

        if (error) throw error;

        if (studentsData && studentsData.length > 0 && isMounted) {
          const formatted: LinkedStudent[] = studentsData.map((st: Record<string, unknown>) => ({
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

          setLinkedStudents(formatted);
          setSelectedStudent(formatted[0]);
        } else if (isMounted) {
          // Explicitly clear state if this user has no linked children
          setLinkedStudents([]);
          setSelectedStudent(null);
        }
      } catch (err) {
        console.error('Error loading global students context:', err);
        if (isMounted) {
          setLinkedStudents([]);
          setSelectedStudent(null);
        }
      } finally {
        if (isMounted) setLoadingStudents(false);
      }
    };

    fetchStudents();
    return () => { isMounted = false; };
  }, []);

  return (
    <StudentContext.Provider value={{ linkedStudents, setLinkedStudents, selectedStudent, setSelectedStudent, loadingStudents }}>
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = (): StudentContextType => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return context;
};
