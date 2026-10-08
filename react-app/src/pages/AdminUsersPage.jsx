import { AdminDataTable } from '../components/AdminDataTable';
import { adminService } from '../services/adminService';

const columns = [
  { label: 'Name', value: (user) => user.name },
  { label: 'Email', value: (user) => user.email },
  { label: 'Role', value: (user) => user.role?.replaceAll('_', ' ') },
  { label: 'Status', value: (user) => user.status },
  { label: 'Created', value: (user) => user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—' },
];

export const AdminUsersPage = () => <AdminDataTable title="Platform users" load={adminService.users} columns={columns} />;
