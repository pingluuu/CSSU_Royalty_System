import { useEffect, useState } from 'react';
import api from '../../../services/api';
import { Link } from 'react-router-dom';
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

    const fetchPublishedEvents = async () => {
        setLoading(true);
        try {
            const res = await api.get('/events', {
                params: {
                    published: true
                },
            });
            setEvents(res.data.results); // Assuming API returns { count, results }
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
                <div className="list-group">
                    {events.map((event) => (
                        <Link
                            key={event.id}
                            to={`/events/${event.id}`}
                            className="list-group-item list-group-item-action"
                        >
                            <div className="d-flex w-100 justify-content-between">
                                <h5>{event.name}</h5>
                                <small>{new Date(event.startTime).toLocaleString()}</small>
                            </div>
                            <p className="mb-1">{event.description}</p>
                            <small>
                                Location: {event.location} | Points: {event.points}
                            </small>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
