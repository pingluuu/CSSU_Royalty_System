import api from "../../../services/api"
import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import axios from 'axios';
interface Guest {
    id: number;
    utorid: string;
    name: string;
}
export default function ManageEventGuestPage(){
    const [utorid, setUtorId] = useState("")
    const [invalidEvent, setInvalidEvent] = useState(false);
    const {id} = useParams()
    const [error, setError] = useState<string|null>(null)
    const [loading, setLoading] = useState(true);
    const [invalidUser, setInvalidUser] = useState(false)
    const [eventName, setEventName] = useState<string>(''); 
    const [guests, setGuests] = useState<Guest []>([])
    const [refreshKey, setRefreshKey] = useState<number>(0);
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUtorId(event.target.value)
    }
    
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        try {
            await api.post(`/events/${id}/guests`, {utorid: utorid})
            setRefreshKey((prev) => prev + 1)
            alert(`Added ${utorid} to event ${id}`)
        }
        catch (error){
            if (axios.isAxiosError(error)){
                if (error?.status === 404){
                    setError("event not visible to organizer")
                    setInvalidEvent(true)
                }

                else if (error?.status === 410){
                    setError("Event is full or has ended")
                }

                else if (error?.status === 400){
                    setError("User is already registered")
                }

                else {
                    setError("Try again")
                }
            }
            setInvalidUser(true)
        }
    }

    useEffect(() => {
        console.log(refreshKey, "REFRESH KEY")
        setLoading(true)
        setInvalidEvent(false)
        setError(null)
        const checkValidEvent = async () => {
            try {
                const res = await api.get(`/events/${id}`)
                setGuests(res.data.guests)
                setEventName(res.data.name)
            }
            catch (error){
                if (axios.isAxiosError(error)){
                    if (error?.status === 404){
                        setError("Event not found")
                        setInvalidEvent(true)
                    }
                    else {
                        setError("something went wrong")
                        setInvalidEvent(true)
                    }
                }
            }
            finally {
                setLoading(false)
            }
        }
        checkValidEvent()
    }, [id, refreshKey])
    const handleRemoveGuest = async(userId: number) => {
        try {
            await api.delete(`/events/${id}/guests/${userId}`)
            setRefreshKey((prev) => prev + 1)
        }

        catch (err){
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

    if (invalidEvent){
        return (
            <div className="container mt-4">
                <div className="alert alert-danger text-center">
                    <h1>{error}</h1>
                </div>
            </div>
        )
    }

    if (invalidUser){
        return (
            <div className="container mt-4">
                <div className="alert alert-danger text-center">
                    <h1>{error}</h1>
                </div>
            </div>
        )
    }
    return (
        <div className="container mt-4"> 
        
        <div>
                <h3 className="mb-3">Event Name: {eventName}</h3>
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
                    <button type="submit" className="btn btn-success">Add Guest</button>
                </form>
            </div>
            <div className="card shadow-sm p-4 mt-3">
                <h5 className="mb-3">Current Organizers ({guests.length})</h5>
                {guests.length > 0 ? (
                    <ul className="list-group">
                        {guests.map((g) => (
                            <li key={g.id} className="list-group-item d-flex justify-content-between align-items-center">
                                <span>
                                    {g.name} ({g.utorid})
                                </span>
                                <button
                                    type="button"
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={() => handleRemoveGuest(g.id)}
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
            
        </div>
    )
}