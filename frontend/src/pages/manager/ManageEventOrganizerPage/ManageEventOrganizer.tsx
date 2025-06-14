import api from "../../../services/api"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from 'axios';

interface Organizer {
    id: number;
    utorid: string;
    name: string;
}
export default function ManageEventOrganizer() {
    const [error, setError] = useState<string | null>(null)
    const [utorid, setUtorId] = useState("")
    const [loading, setLoading] = useState(true);
    const [invalidEvent, setInvalidEvent] = useState<string>("");
    const [message, setMessage] = useState("")

    const [eventName, setEventName] = useState<string>('');
    const [organizers, setOrganizers] = useState<Organizer[]>([])
    const [refreshKey, setRefreshKey] = useState<number>(0);


    const { id } = useParams()
    const navigate = useNavigate();
    useEffect(() => {
        setLoading(true)
        setInvalidEvent("")
        setError(null)
        const checkValidEvent = async () => {
            try {
                const res = await api.get(`/events/${id}`)
                setOrganizers(res.data.organizers)
                setEventName(res.data.name)
            }
            catch (error) {
                if (axios.isAxiosError(error)) {
                    if (error?.status === 404) {
                        setInvalidEvent("Event Not Found")
                    }
                    else {
                        setInvalidEvent("Unexpected Error")
                    }
                }
            }
            finally {
                setLoading(false)
            }
        }
        checkValidEvent()
    }, [id, refreshKey])

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

    // if (error) {
    //     return (
    //         <div className="container mt-4">
    //             <div className="alert alert-danger text-center">
    //                 <h1>{error}</h1>
    //             </div>
    //         </div>
    //     )
    // }

    if (invalidEvent) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger text-center">
                    <h1>{invalidEvent}</h1>
                    <button className="btn btn-primary m-2" onClick={() => navigate('/')}>Go Back To HomePage</button>
                </div>
            </div>
        )
    }
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        try {
            await api.post(`/events/${id}/organizers`, { utorid: utorid })
            setRefreshKey((prev) => prev + 1)
            setMessage(`${utorid} added as a list organizer`)
        }

        catch (err) {
            if (axios.isAxiosError(err)) {
                if (err?.status === 400) {
                    setError("This user already added as a guest")
                }
                else if (err?.status === 404) {
                    setError("This user does not exist")

                }
                else {
                    setError("Event has ended")
                    return;
                }
            }
        }
    }
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUtorId(event.target.value)
    }

    const handleRemoveOrganizer = async (userId: number) => {
        try {
            console.log("testset")
            await api.delete(`/events/${id}/organizers/${userId}`)
            setMessage("Organizer successfully deleted")
            setRefreshKey((prev) => prev + 1)
        }

        catch (err) {
            console.log(err)
            setError("Error with deleting organizer")
        }
    }

    return (
        <div className="container mt-4">
            <div>
                <h3 className="mb-3">Event Name: {eventName}</h3>
                <button className="btn btn-secondary mb-3" onClick={() => navigate(`/manager/events/${id}`)}>Go Back To Event</button>
            </div>
            <div className="card shadow p-4">
                <h4 className="mb-3">Enter UTORid of Organizer</h4>
                <form onSubmit={handleSubmit}>
                    <input type="text"
                        className="form-control"
                        placeholder="Enter here"
                        onChange={handleInputChange}
                        required
                    />

                    <button type="submit" className="btn btn-primary mt-2">Add Organizer</button>

                </form>
            </div>
            <div className="card shadow-sm p-4 mt-3">
                <h5 className="mb-3">Current Organizers ({organizers.length})</h5>
                {organizers.length > 0 ? (
                    <ul className="list-group">
                        {organizers.map((org) => (
                            <li key={org.id} className="list-group-item d-flex justify-content-between align-items-center">
                                <span>
                                    {org.name} ({org.utorid})
                                </span>
                                <button
                                    type="button"
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={() => handleRemoveOrganizer(org.id)}
                                >
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-muted">No organizers currently assigned to this event.</p>
                )}
            </div>
            {message && (
                <div
                    className="mt-3 p-3 rounded"
                    style={{
                        backgroundColor: '#e7f1ff',
                        color: '#0d6efd',
                        border: '1px solid #0d6efd',
                    }}
                >
                    {message}
                </div>
            )}
            {error && (
                <div
                    className="mt-3 p-3 rounded"
                    style={{
                        backgroundColor: '#ffe7e7',
                        color: '#dc3545',
                        border: '1px solid #dc3545',
                    }}
                >
                    {error}
                </div>
            )}
        </div>
    )
}