import { AdminDataTable } from '../components/AdminDataTable';
import { adminService } from '../services/adminService';

const columns = [
  { label: 'Name', value: (household) => household.name },
  { label: 'Address', value: (household) => household.address },
  { label: 'Members', value: (household) => household.members?.length || 0 },
  { label: 'Created', value: (household) => household.createdAt ? new Date(household.createdAt).toLocaleDateString() : '—' },
];

export const AdminHouseholdsPage = () => <AdminDataTable title="Household portfolio" load={adminService.households} columns={columns} />;
