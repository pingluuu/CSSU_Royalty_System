import { useEffect, useState } from 'react';
import api from '../../../services/api';
import { Link, useLocation } from 'react-router-dom';
import './PublishedEventsPageRegular.css';

interface Event {
    id: number;
    name: string;
    description: string;
    startTime: string;
    endTime: string;
    location: string;
    points: number;
    capacity?: number;
    published: boolean;
}

export default function PublishedEventsPageRegular() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const link_location = useLocation();

    const fetchPublishedEvents = async () => {
        setLoading(true);
        try {
            const res = await api.get('/events', {
                params: {
                    published: true
                },
            });
            setEvents(res.data.results);
        } catch (err) {
            console.error('Error fetching events:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPublishedEvents();
    }, []);

    return (
        <div className="container mt-4">
            <h2>Available Events</h2>
            {loading ? (
                <p>Loading events...</p>
            ) : events.length === 0 ? (
                <p>No available events at this time.</p>
            ) : (
                <div className="event-cards-grid">
                    {events.map((event) => (
                        <Link
                            key={event.id}
                            to={`/events/${event.id}`}
                            className="transaction-card" state={{from: link_location}}
                        >
                            <div className="card-header">
                                <h5>{event.name}</h5>
                                <span>{new Date(event.startTime).toLocaleString()}</span>
                            </div>
                            <p>{event.description}</p>
                            <div className="card-footer">
                                <small>📍 {event.location}</small>
                                <small>🎯 {event.points} pts</small>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}