import api from "../../../services/api"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from 'axios';
import { useAuth } from "../../../contexts/AuthContext";

interface Guest {
    id: number;
    utorid: string;
    name: string;
}
export default function ManageEventGuestPage() {
    const [utorid, setUtorId] = useState("")
    const { id } = useParams()
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true);
    const [eventName, setEventName] = useState<string>('');
    const [guests, setGuests] = useState<Guest[]>([])
    const [refreshKey, setRefreshKey] = useState<number>(0);
    const [message, setMessage] = useState("")
    const { user } = useAuth()
    const navigate = useNavigate();
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUtorId(event.target.value)
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        try {
            console.log(utorid)
            await api.post(`/events/${id}/guests`, { utorid: utorid })
            setRefreshKey((prev) => prev + 1)
            setMessage(`User has successfully been added to the event`)
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                if (error?.status === 404) {
                    setError("event not visible to organizer or not valid user")
                    // setInvalidEvent(true)
                }

                else if (error?.status === 410) {
                    setError("Event is full or has ended")
                }

                else if (error?.status === 400) {
                    setError("User is already registered")
                }

                else {
                    setError("Try again")
                }
            }
        }
    }

    useEffect(() => {
        setLoading(true)
        setError(null)
        const checkValidEvent = async () => {
            if (!user) {
                return;
            }
            try {
                const res = await api.get(`/events/${id}`)
                const checkOrganizer = res.data.organizers.some((organizer: Guest) => organizer.utorid === user.utorid);
                if (user.role !== "superuser" && user.role !== "manager" && !checkOrganizer) {
                    setError("Denied Permission")
                }
                setGuests(res.data.guests)
                setEventName(res.data.name)
            }
            catch (error) {
                if (axios.isAxiosError(error)) {
                    if (error?.status === 404) {
                        setError("Event not found")
                    }
                    else {
                        setError("something went wrong")
                    }
                }
            }
            finally {
                setLoading(false)
            }
        }
        checkValidEvent()
    }, [id, refreshKey])
    const handleRemoveGuest = async (userId: number) => {
        try {
            await api.delete(`/events/${id}/guests/${userId}`)
            setRefreshKey((prev) => prev + 1)
        }

        catch (err) {
            console.log(err)
        }
    }

    if (loading) {
        return (
            <div className="container mt-4">
                <div className="">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
                <p className="text-center mt-2">Checking event validity...</p>
            </div>
        );
    }
    // if (error){
    //     return (
    //         <div className="container mt-4">
    //             <div className="alert alert-danger text-center">
    //                 <h1>{error}</h1>
    //                 <button className="btn btn-primary m-2" onClick={() => setError(null)}>Go Back To Event</button>
    //             </div>
    //         </div>
    //     )
    // }
    // if (invalidEvent){
    //     return (
    //         <div className="container mt-4">
    //             <div className="alert alert-danger text-center">
    //                 <h1>{error}</h1>
    //                 <button className="btn btn-primary m-2" onClick={() => setInvalidEvent(null)}>Go Back To Event</button>
    //             </div>
    //         </div>
    //     )
    // }

    // if (invalidUser){
    //     return (
    //         <div className="container mt-4">
    //             <div className="alert alert-danger text-center">
    //                 <h1>{error}</h1>
    //             </div>
    //         </div>
    //     )
    // }
    return (
        <div className="container mt-4">
            <div>
                <h3 className="">Event Name: {eventName}</h3>
                <button className="btn btn-secondary mb-3" onClick={() => navigate(`/manager/events/${id}`)}>Go Back To Event</button>
            </div>
            <div className="card shadow p-4">
                <h4 className="mb-3">Enter UTORid of Guest</h4>
                <form onSubmit={handleSubmit}>
                    <input type="text"
                        className="form-control"
                        placeholder="Enter here"
                        onChange={handleInputChange}
                        required
                    />
                    <button type="submit" className="btn btn-primary">Add Guest</button>
                </form>
            </div>
            <div className="card shadow-sm p-4 mt-3">
                <h5 className="mb-3">Current Guests ({guests.length})</h5>
                {guests.length > 0 ? (
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        <ul className="list-group">
                            {guests.map((g) => (
                                <li key={g.id}
                                    className="list-group-item d-flex flex-column flex-sm-row justify-content-sm-between">
                                    <span>
                                        {g.name} ({g.utorid})
                                    </span>
                                    {(user && (user.role === "manager" || user.role === "superuser")) && <button
                                        type="button"
                                        className="btn btn-outline-danger btn-sm"
                                        onClick={() => handleRemoveGuest(g.id)}
                                    >
                                        Remove
                                    </button>}
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <p className="text-muted">No organizers currently assigned to this event.</p>
                )}
            </div>
            {message && <div className="mt-3 alert alert-success">{message}</div>}
            {error && <div className="mt-3 alert alert-danger">{error}</div>}

        </div>
    )
}