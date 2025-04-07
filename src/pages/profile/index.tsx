import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const UserAvailablePoints: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="container mt-5 d-flex justify-content-center">
      <div className="card text-center p-4 shadow-sm" style={{ maxWidth: '500px', width: '100%' }}>
        <h2 className="mb-3">Welcome {(str => str.charAt(0).toUpperCase() + str.slice(1))(user.name)}!</h2>
          {user.avatarUrl && (
            <div className="text-center mt-4" style={{ marginBottom: '20px' }}>
              <img
                src={user.avatarUrl}
                alt="Profile Avatar"
                className="rounded-circle"
                style={{ width: '150px', height: '150px', objectFit: 'cover', border: '2px solid #007bff' }}
              />
            </div>
          )}
        <p className="text-muted">These points can be used to redeem rewards or transfer to others.</p>

        <div className="display-4 fw-bold my-3 text-primary">
          {user.points}
        </div>

        <hr className="my-4" />

        <div className="text-start">
          <p><strong>UTORid:</strong> {user.utorid}</p>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
          {user.birthday && (
            <p><strong>Birthday:</strong> {user.birthday}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserAvailablePoints;
