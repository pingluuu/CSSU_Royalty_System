import React from 'react';
import { useAuth } from '../contexts/AuthContext';
const AvailablePoints: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="container mt-5 d-flex justify-content-center">
      <div className="card text-center p-4 shadow-sm" style={{ maxWidth: '500px', width: '100%' }}>
        <h2 className="mb-3">Your Available Points</h2>
        <p className="text-muted">These points can be used to redeem rewards or transfer to others.</p>

        <div className="display-4 fw-bold my-3 text-primary">
          {user.points}
        </div>

      </div>
    </div>
  );
};

export default AvailablePoints;