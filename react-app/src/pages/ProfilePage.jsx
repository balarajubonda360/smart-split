import { useAuth } from '../context/AuthContext';

export const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="page-section">
      <div className="page-header">
        <div>
          <div className="eyebrow">Profile</div>
          <h1>{user?.name}</h1>
        </div>
      </div>

      <div className="card-block">
        <div className="detail-list">
          <div><span>Name</span><strong>{user?.name}</strong></div>
          <div><span>Email</span><strong>{user?.email}</strong></div>
          <div><span>Role</span><strong>{user?.role}</strong></div>
          <div><span>Household</span><strong>{user?.householdId || 'Platform user'}</strong></div>
        </div>
      </div>
    </div>
  );
};
