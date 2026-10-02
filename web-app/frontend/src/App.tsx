import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Public Pages
import { Login } from './pages/Login';

// Admin Pages
import { Dashboard } from './pages/Dashboard';
import { AccessManagement } from './pages/AccessManagement';
import { Students } from './pages/Students';
import { Parents } from './pages/Parents';
import { Teachers } from './pages/Teachers';
import { Classes } from './pages/Classes';
import { Academics } from './pages/Academics';
import { Calendar } from './pages/Calendar';
import { Attendance } from './pages/Attendance';
import { Finance } from './pages/Finance';
import { Messages } from './pages/Messages';
import { Notifications } from './pages/Notifications';
import { ReportsAnalytics } from './pages/ReportsAnalytics';
import { Settings } from './pages/Settings';
import { AdminProfile } from './pages/AdminProfile';

// Teacher Pages (Isolated Portal)
import { TeacherDashboard } from './pages/TeacherDashboard';
import { TeacherClassView } from './pages/TeacherClassView';
import { TeacherAcademics } from './pages/TeacherAcademics';
import { TeacherAttendance } from './pages/TeacherAttendance';
import { TeacherCalendar } from './pages/TeacherCalendar';
import { TeacherMessages } from './pages/TeacherMessages';
import { TeacherProfile } from './pages/TeacherProfile';
import { TeacherAssessments } from './pages/TeacherAssessments';
import { TeacherNotifications } from './pages/TeacherNotifications';

// Accountant Pages (Isolated Portal)
import { FinanceDashboard } from './pages/FinanceDashboard';
import { AccountantFees } from './pages/AccountantFees';
import { AccountantPayments } from './pages/AccountantPayments';
import { AccountantInvoices } from './pages/AccountantInvoices';
import { AccountantStructures } from './pages/AccountantStructures';
import { AccountantBalances } from './pages/AccountantBalances';
import { AccountantReports } from './pages/AccountantReports';
import { AccountantNotifications } from './pages/AccountantNotifications';
import { AccountantSettings } from './pages/AccountantSettings';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTE */}
        <Route path="/login" element={<Login />} />

        {/* ADMIN PORTAL ROUTES */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/access-management" element={<AccessManagement />} />
        <Route path="/students" element={<Students />} />
        <Route path="/parents" element={<Parents />} />
        <Route path="/teachers" element={<Teachers />} />
        <Route path="/classes" element={<Classes />} />
        <Route path="/academics" element={<Academics />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/reports-analytics" element={<ReportsAnalytics />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<AdminProfile />} />

        {/* TEACHER PORTAL ROUTES */}
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/class" element={<TeacherClassView />} />
        <Route path="/teacher/academics" element={<TeacherAcademics />} />
        <Route path="/teacher/attendance" element={<TeacherAttendance />} />
        <Route path="/teacher/calendar" element={<TeacherCalendar />} />
        <Route path="/teacher/messages" element={<TeacherMessages />} />
        <Route path="/teacher/profile" element={<TeacherProfile />} />
        <Route path="/teacher/assessments" element={<TeacherAssessments />} />
        <Route path="/teacher/notifications" element={<TeacherNotifications />} />

        {/* ACCOUNTANT PORTAL ROUTES */}
        <Route path="/finance-dashboard" element={<FinanceDashboard />} />
        <Route path="/accountant/fees" element={<AccountantFees />} />
        <Route path="/accountant/payments" element={<AccountantPayments />} />
        <Route path="/accountant/invoices" element={<AccountantInvoices />} />
        <Route path="/accountant/structures" element={<AccountantStructures />} />
        <Route path="/accountant/balances" element={<AccountantBalances />} />
        <Route path="/accountant/reports" element={<AccountantReports />} />
        <Route path="/accountant/notifications" element={<AccountantNotifications />} />
        <Route path="/accountant/settings" element={<AccountantSettings />} />

        {/* FALLBACK REDIRECT */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
