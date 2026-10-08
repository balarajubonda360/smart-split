import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppShell } from './layouts/AppShell';
import { ProtectedRoute } from './components/ProtectedRoute';
const lazyPage = (load, name) => lazy(() => load().then((module) => ({ default: module[name] })));
const LoginPage = lazyPage(() => import('./pages/LoginPage'), 'LoginPage');
const RegisterPage = lazyPage(() => import('./pages/RegisterPage'), 'RegisterPage');
const DashboardPage = lazyPage(() => import('./pages/DashboardPage'), 'DashboardPage');
const BillsPage = lazyPage(() => import('./pages/BillsPage'), 'BillsPage');
const BillDetailPage = lazyPage(() => import('./pages/BillDetailPage'), 'BillDetailPage');
const UsagePage = lazyPage(() => import('./pages/UsagePage'), 'UsagePage');
const PaymentsPage = lazyPage(() => import('./pages/PaymentsPage'), 'PaymentsPage');
const AutoPayPage = lazyPage(() => import('./pages/AutoPayPage'), 'AutoPayPage');
const PredictionsPage = lazyPage(() => import('./pages/PredictionsPage'), 'PredictionsPage');
const DisputesPage = lazyPage(() => import('./pages/DisputesPage'), 'DisputesPage');
const NotificationsPage = lazyPage(() => import('./pages/NotificationsPage'), 'NotificationsPage');
const LoyaltyPage = lazyPage(() => import('./pages/LoyaltyPage'), 'LoyaltyPage');
const ProfilePage = lazyPage(() => import('./pages/ProfilePage'), 'ProfilePage');
const HouseholdPage = lazyPage(() => import('./pages/HouseholdPage'), 'HouseholdPage');
const MembersPage = lazyPage(() => import('./pages/MembersPage'), 'MembersPage');
const UtilitiesPage = lazyPage(() => import('./pages/UtilitiesPage'), 'UtilitiesPage');
const SplitPage = lazyPage(() => import('./pages/SplitPage'), 'SplitPage');
const ReportsPage = lazyPage(() => import('./pages/ReportsPage'), 'ReportsPage');
const AdminPage = lazyPage(() => import('./pages/AdminPage'), 'AdminPage');
const AdminUsersPage = lazyPage(() => import('./pages/AdminUsersPage'), 'AdminUsersPage');
const AdminHouseholdsPage = lazyPage(() => import('./pages/AdminHouseholdsPage'), 'AdminHouseholdsPage');
const AdminBillsPage = lazyPage(() => import('./pages/AdminBillsPage'), 'AdminBillsPage');
const AdminPaymentsPage = lazyPage(() => import('./pages/AdminPaymentsPage'), 'AdminPaymentsPage');
const AdminDisputesPage = lazyPage(() => import('./pages/AdminDisputesPage'), 'AdminDisputesPage');
const AdminReportsPage = lazyPage(() => import('./pages/AdminReportsPage'), 'AdminReportsPage');
const CustomerCarePage = lazyPage(() => import('./pages/CustomerCarePage'), 'CustomerCarePage');
const AccountServicesPage = lazyPage(() => import('./pages/AccountServicesPage'), 'AccountServicesPage');
const LandingPage = lazyPage(() => import('./pages/LandingPage'), 'LandingPage');
import { VoiceAssistant } from './components/VoiceAssistant';
import { LiveUpdates } from './components/LiveUpdates';
import { RouteSwitchAnimation } from './components/RouteSwitchAnimation';
import './App.css';

const getPageEffect = (pathname) => {
  if (/^\/(bills|utilities|usage)(\/|$)/.test(pathname)) return 'water';
  if (/^\/(payments|splits|autopay|disputes|customer-care|account-services|loyalty)(\/|$)/.test(pathname)) return 'fire';
  return 'electricity';
};

function AppRoutes() {
  const { user, token } = useAuth();
  const location = useLocation();
  const [electricSpark, setElectricSpark] = useState(null);
  const sparkTimer = useRef(null);
  const sparkSequence = useRef(0);

  useEffect(() => {
    try {
      document.documentElement.dataset.theme = window.localStorage.getItem('paymate-theme') === 'light' ? 'light' : 'dark';
    } catch {
      document.documentElement.dataset.theme = 'dark';
    }
    return () => window.clearTimeout(sparkTimer.current);
  }, []);

  const triggerElectricity = (event) => {
    const button = event.target.closest?.('button');
    if (!button || button.disabled) return;
    const bounds = button.getBoundingClientRect();
    sparkSequence.current += 1;
    setElectricSpark({ x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2, id: sparkSequence.current });
    window.clearTimeout(sparkTimer.current);
    sparkTimer.current = window.setTimeout(() => setElectricSpark(null), 560);
  };

  return (
    <>
    <div className="global-atmosphere" aria-hidden="true"><span /><span /><span /><i /></div>
    <RouteSwitchAnimation />
    <div className="route-transition" data-effect={getPageEffect(location.pathname)} key={location.pathname} onClickCapture={triggerElectricity}>
      {electricSpark && (
        <div className="electricity-burst" key={electricSpark.id} style={{ left: electricSpark.x, top: electricSpark.y }} aria-hidden="true">
          <svg viewBox="0 0 100 100" focusable="false">
            <circle className="electricity-ring" cx="50" cy="50" r="38" />
            <path className="electricity-bolt" d="M55 7 29 48h18l-8 45 34-55H53z" />
            <path className="electricity-arc" d="m19 29 8 5M77 27l-7 7M18 69l10-4m49 8-7-5" />
          </svg>
        </div>
      )}
      <Suspense fallback={<div className="route-loading" role="status">Loading page...</div>}>
      <Routes location={location}>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />

      <Route path="/dashboard" element={<ProtectedRoute><AppShell><DashboardPage /></AppShell></ProtectedRoute>} />
      <Route path="/bills" element={<ProtectedRoute><AppShell><BillsPage /></AppShell></ProtectedRoute>} />
      <Route path="/bills/:id" element={<ProtectedRoute><AppShell><BillDetailPage /></AppShell></ProtectedRoute>} />
      <Route path="/usage" element={<ProtectedRoute><AppShell><UsagePage /></AppShell></ProtectedRoute>} />
      <Route path="/payments" element={<ProtectedRoute><AppShell><PaymentsPage /></AppShell></ProtectedRoute>} />
      <Route path="/customer-care" element={<ProtectedRoute allowedRoles={['HOUSEHOLD_ADMIN', 'HOUSEHOLD_MEMBER']}><AppShell><CustomerCarePage /></AppShell></ProtectedRoute>} />
      <Route path="/account-services" element={<ProtectedRoute allowedRoles={['HOUSEHOLD_ADMIN', 'HOUSEHOLD_MEMBER']}><AppShell><AccountServicesPage /></AppShell></ProtectedRoute>} />
      <Route path="/autopay" element={<ProtectedRoute><AppShell><AutoPayPage /></AppShell></ProtectedRoute>} />
      <Route path="/predictions" element={<ProtectedRoute><AppShell><PredictionsPage /></AppShell></ProtectedRoute>} />
      <Route path="/disputes" element={<ProtectedRoute><AppShell><DisputesPage /></AppShell></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><AppShell><NotificationsPage /></AppShell></ProtectedRoute>} />
      <Route path="/loyalty" element={<ProtectedRoute><AppShell><LoyaltyPage /></AppShell></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><AppShell><ProfilePage /></AppShell></ProtectedRoute>} />

      <Route path="/household" element={<ProtectedRoute allowedRoles={['HOUSEHOLD_ADMIN', 'HOUSEHOLD_MEMBER']}><AppShell><HouseholdPage /></AppShell></ProtectedRoute>} />
      <Route path="/members" element={<ProtectedRoute allowedRoles={['HOUSEHOLD_ADMIN']}><AppShell><MembersPage /></AppShell></ProtectedRoute>} />
      <Route path="/utilities" element={<ProtectedRoute allowedRoles={['HOUSEHOLD_ADMIN']}><AppShell><UtilitiesPage /></AppShell></ProtectedRoute>} />
      <Route path="/splits" element={<ProtectedRoute allowedRoles={['HOUSEHOLD_ADMIN']}><AppShell><SplitPage /></AppShell></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute allowedRoles={['HOUSEHOLD_ADMIN']}><AppShell><ReportsPage /></AppShell></ProtectedRoute>} />

      <Route path="/admin" element={<ProtectedRoute allowedRoles={['PLATFORM_ADMIN']}><AppShell><AdminPage /></AppShell></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['PLATFORM_ADMIN']}><AppShell><AdminUsersPage /></AppShell></ProtectedRoute>} />
      <Route path="/admin/households" element={<ProtectedRoute allowedRoles={['PLATFORM_ADMIN']}><AppShell><AdminHouseholdsPage /></AppShell></ProtectedRoute>} />
      <Route path="/admin/bills" element={<ProtectedRoute allowedRoles={['PLATFORM_ADMIN']}><AppShell><AdminBillsPage /></AppShell></ProtectedRoute>} />
      <Route path="/admin/payments" element={<ProtectedRoute allowedRoles={['PLATFORM_ADMIN']}><AppShell><AdminPaymentsPage /></AppShell></ProtectedRoute>} />
      <Route path="/admin/disputes" element={<ProtectedRoute allowedRoles={['PLATFORM_ADMIN']}><AppShell><AdminDisputesPage /></AppShell></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['PLATFORM_ADMIN']}><AppShell><AdminReportsPage /></AppShell></ProtectedRoute>} />

      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
      </Routes>
      </Suspense>
    </div>
    {user && <LiveUpdates token={token} userId={user.id} />}
    {user && <VoiceAssistant user={user} />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
