import { AdminDataTable } from '../components/AdminDataTable';
import { StatusBadge } from '../components/StatusBadge';
import { adminService } from '../services/adminService';

const columns = [
  { label: 'Utility', value: (bill) => bill.utilityType },
  { label: 'Provider', value: (bill) => bill.provider },
  { label: 'Household', value: (bill) => bill.householdId },
  { label: 'Period', value: (bill) => bill.billingPeriod },
  { label: 'Amount', value: (bill) => `₹${Number(bill.amount).toLocaleString('en-IN')}` },
  { label: 'Status', value: (bill) => <StatusBadge status={bill.status} /> },
];

export const AdminBillsPage = () => <AdminDataTable title="All household bills" load={adminService.bills} columns={columns} />;
