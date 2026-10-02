import React from 'react';
import { TeacherLayout } from '../components/TeacherLayout';
import { ReusableSettings } from '../components/ReusableSettings';

export const TeacherSettings: React.FC = () => {
  return (
    <TeacherLayout>
      <ReusableSettings userRole="Teacher" />
    </TeacherLayout>
  );
};
