import api from "../../../services/api"
import { useState, useEffect} from "react"
import { useParams } from "react-router-dom"
import axios from 'axios';

interface Organizer {
    id: number;
    utorid: string;
    name: string;
}
export default function ManageEventOrganizer(){
    const [error, setError] = useState<string|null>(null)
    const [utorid, setUtorId] = useState("")
    const [loading, setLoading] = useState(true);
    const [invalidEvent, setInvalidEvent] = useState(false);

    const [eventName, setEventName] = useState<string>(''); 
    const [organizers, setOrganizers] = useState<Organizer []>([])

    const [addingUtorId, setAddingUtorId] = useState<string| null> (null);
    const [removingId, setRemovingId] = useState<number | null>(null); 
    

    const {id} = useParams()

    useEffect(() => {
        setLoading(true)
        setInvalidEvent(false)
        setError(null)
        const checkValidEvent = async () => {
            try {
                const res = await api.get(`/events/${id}`)
                setOrganizers(res.data.organizers)
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
    }, [id, removingId, addingUtorId])

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

    if (error) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger text-center">
                    <h1>{error}</h1>
                </div>
            </div>
        )
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
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        try {
            await api.post(`/events/${id}/organizers`, {utorid: utorid})
            setAddingUtorId(utorid)
            alert(`${utorid} added as a list to organizer`)
        }

        catch (err) {
            if (axios.isAxiosError(err)){
                if (err?.status === 400){
                    alert("This user is already a guest")
                }
                else if(err?.status===404){
                    alert("This user does not exist")

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
        console.log(userId)
        try {
            await api.delete(`/events/${id}/organizers/${userId}`)
            setRemovingId(userId)
        }

        catch (err){
            console.log(err)
        }
    }

    return (
        <div className="container mt-4"> 
            <div>
                <h3 className="mb-3">Event Name: {eventName}</h3>
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
                    <button type="submit" className="btn btn-success">Add Organizer</button>
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
        </div>
    )
}