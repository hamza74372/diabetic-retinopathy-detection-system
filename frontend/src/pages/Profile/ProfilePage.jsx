import React from 'react';
import { useAuth } from '../../context/AuthContext';
import './ProfilePage.css';

const ProfilePage = () => {
  const { currentUser } = useAuth();

  return (
    <div className="profile-container">
      <h1>My Profile</h1>
      <div className="profile-card">
        <div className="profile-info-grid">
          {/* CORRECTED PATHS BELOW */}
          <p><strong>Full Name:</strong></p><p>{currentUser?.profile?.name}</p>
          <p><strong>Email:</strong></p><p>{currentUser?.auth?.email}</p>
          <p><strong>Age:</strong></p><p>{currentUser?.profile?.age}</p>
          <p><strong>Gender:</strong></p><p>{currentUser?.profile?.gender}</p>
          <p><strong>User ID:</strong></p><p>{currentUser?.auth?.uid}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;