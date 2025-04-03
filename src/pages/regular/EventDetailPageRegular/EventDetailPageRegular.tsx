import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';

interface Event {
    id: number;
    name: string;
    description: string;
    location: string;
    startTime: string;
    endTime: string;
    points: number;
    capacity?: number;
    published: boolean;
    guests: { userId: number }[];
}

export default function EventDetailPageRegular() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [rsvped, setRsvped] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const fetchEvent = async () => {
        try {
            const res = await api.get(`/events/${id}`);
            const data = res.data;
            setEvent(data);

            if (data.guests.some((g: any) => g.userId === user.id)) {
                setRsvped(true);
            }
        } catch (err) {
            console.error('Error fetching event:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRSVP = async () => {
        if (!event || rsvped) return;

        setSubmitting(true);
        try {
            const res = await api.post(`/events/${event.id}/rsvp`);
            setRsvped(true);
            alert(res.data.message || 'RSVP successful!');
        } catch (err: any) {
            console.error('RSVP failed:', err);
            const message = err.response?.data?.message || 'RSVP failed';
            alert(message); // This will show "startTime and endTime must not be in the past."
        } finally {
            setSubmitting(false);
        }
    };


    useEffect(() => {
        fetchEvent();
    }, [id]);

    if (loading) return <div className="container mt-4">Loading...</div>;
    if (!event) return <div className="container mt-4">Event not found</div>;

    return (
        <div className="container mt-4">
            <h2>{event.name}</h2>
            <p><strong>Description:</strong> {event.description}</p>
            <p><strong>Location:</strong> {event.location}</p>
            <p><strong>Time:</strong> {new Date(event.startTime).toLocaleString()} - {new Date(event.endTime).toLocaleString()}</p>
            <p><strong>Points:</strong> {event.points}</p>
            <p><strong>Capacity:</strong> {event.capacity ?? 'Unlimited'}</p>

            <button
                className="btn btn-primary"
                onClick={handleRSVP}
                disabled={rsvped || submitting}
            >
                {rsvped ? 'RSVPed' : submitting ? 'Submitting...' : 'RSVP'}
            </button>
        </div>
    );
}
