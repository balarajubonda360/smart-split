import { AdminDataTable } from '../components/AdminDataTable';
import { StatusBadge } from '../components/StatusBadge';
import { adminService } from '../services/adminService';

const columns = [
  { label: 'Transaction', value: (payment) => payment.transactionId },
  { label: 'Household', value: (payment) => payment.householdId },
  { label: 'Amount', value: (payment) => `₹${Number(payment.amount).toLocaleString('en-IN')}` },
  { label: 'Method', value: (payment) => payment.method },
  { label: 'Status', value: (payment) => <StatusBadge status={payment.status} /> },
  { label: 'Date', value: (payment) => payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : '—' },
];

export const AdminPaymentsPage = () => <AdminDataTable title="Settlement operations" load={adminService.payments} columns={columns} />;
