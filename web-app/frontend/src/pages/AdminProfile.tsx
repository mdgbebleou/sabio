import React from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { ReusableProfile } from '../components/ReusableProfile';

export const AdminProfile: React.FC = () => {
  return (
    <AdminLayout>
      <ReusableProfile userRole="Administrator" />
    </AdminLayout>
  );
};