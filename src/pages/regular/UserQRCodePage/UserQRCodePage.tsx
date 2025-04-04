import { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { QRCodeCanvas } from 'qrcode.react';
import './UserQRCodePage.css';

export default function UserQRCodePage() {
    const { user } = useAuth();
    const [qrData, setQrData] = useState('');

    useEffect(() => {
        if (user) {
            // Safely encode only essential info (avoid sensitive data)
            const safeUserData = {
                id: user.id,
                utorid: user.utorid,
                name: user.name,
                email: user.email,
                role: user.role
            };
            setQrData(JSON.stringify(safeUserData));
        }
    }, [user]);

    if (!user) {
        return <div className="container mt-4">User not logged in.</div>;
    }

    return (
        <div className="container mt-4 text-center">
            <h2>Your QR Code</h2>
            <p>This code can be scanned by a cashier to initiate a transaction.</p>

            <div style={{ display: 'inline-block', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
                <QRCodeCanvas value={qrData} size={256} />
            </div>

            <div className="mt-3">
                <p><strong>UTORid:</strong> {user.utorid}</p>
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role}</p>
            </div>
        </div>
    );
}
