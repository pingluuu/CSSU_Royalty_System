import { useEffect, useState } from "react"
import { useParams } from "react-router-dom";
import api from "../../../services/api";

interface Event {
    id: number;
    name: string; 
    description?: string; 
    location: string; 
    startTime: string; 
    endTime: string; 
    capacity: number | null; 
    pointsRemain: number; 
    pointsAwarded: number; 
    published: boolean; 
    organizers: {id: number, utorid: string, name: string}[]
    guests: { id: number, utorid: string, name: string }[];
}
export default function EventDetailPage(){
    const [loading, setLoading] = useState(true);
    const [event, setEvent] = useState<Event | null>(null);
    const [error, setError] = useState<string|null>(null)
    const [isEditing, setIsEditing] = useState(true);
    const [eventDeleted, setEventDeleted] = useState(false)
    const {id} = useParams()

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await api.get(`/events/${id}`)
                console.log(res.data)
                setEvent(res.data)
            }

            catch (error: any){
                if (error.response.status === 404){
                    setError("Event not found or not accessible")
                }

                setEvent(null)
            }
            finally {
                setLoading(false)
            }
            
        }
        fetchEvent()

    }, [id])

    const editField = () => {
        setIsEditing(!isEditing)        
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target
        console.log(name, value)
        setEvent((prev) => ({
            ...prev!, 
            [name]: value
        }))
    }
    const deleteEvent = async () => {
        try {
            await api.delete(`/events/${id}`)
            setEventDeleted(true)

        }
        catch (error){
            console.log("Delete event error", error)
            setError("Event has been published")
        }
    }

    const submitEditField = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        try {
            e.preventDefault()
            const payload = {
                ...event
            }
            
            payload.startTime = new Date(event.startTime).toISOString()
            payload.endTime =  new Date(event.endTime).toISOString()
            payload.points = Number(payload.pointsRemain)
            payload.capacity = payload.capacity ? Number(payload.capacity) : null
            console.log(typeof(payload.published), payload.published)
            payload.published = payload.published === "true" ? true : false
            if (!payload.published){
                alert("Published must be true")
                return;
            }
            delete payload.id
            delete payload.guests
            delete payload.organizers
            delete payload.pointsAwarded
            delete payload.pointsRemain
            
            await api.patch(`/events/${id}`, payload)
            alert('Event updated')
            setIsEditing(!isEditing)
        }
        catch (err){
            console.log("error", err)
            alert("Published must be set to true")
        }
        
    }

    const formatDateTimeLocal = (isoString: string) => {
        const date = new Date(isoString)
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    if (loading){
        return (
            <div className="container mt-4">
                <div className="">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (eventDeleted){
        return (
            <div className="container mt-4">
                <div className="alert alert-success text-center">
                    <h1>Event Deleted</h1>
                </div>
            </div>
        )
    }
    if (error || !event){
        return (
            <div className="container mt-4">
                <div className="alert alert-danger text-center">
                <h1>{error ? "Error" : "Not Found"}</h1>
                <p>{error || "Event data could not be loaded or the event does not exist."}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="container mt-4">
            <form className="m-2">
                <div className="row align-items-center mb-3">
                    <label className="col-sm-3 form-label me-2">
                        Event ID:
                    </label>
                    <div className="col-sm-7">
                        <input
                        type="text"
                        name="id"
                        value={event.id}
                        onChange={handleInputChange}
                        disabled
                        className="form-control"
                        />
                    </div>
                </div>
                <div className="row align-items-center mb-3">
                    <label className="col-sm-3 form-label me-2">
                        Name of Event:
                    </label>
                    <div className="col-sm-7">
                        <input
                        type="text"
                        name="name"
                        value={event.name}
                        onChange={handleInputChange}
                        disabled={isEditing}
                        className="form-control"
                        />
                    </div>
                </div>
                <div className="row align-items-center mb-3">
                    <label className="col-sm-3 form-label me-2">
                        Description:
                    </label>
                    <div className="col-sm-7">
                        <input
                        type="text"
                        name="description"
                        value={event.description}
                        onChange={handleInputChange}
                        disabled={isEditing}
                        className="form-control"
                        />
                    </div>
                </div>
                <div className="row align-items-center mb-3">
                    <label className="col-sm-3 form-label me-2">
                        Location: 
                    </label>
                    <div className="col-sm-7">
                        <input
                        type="text"
                        name="location"
                        value={event.location}
                        onChange={handleInputChange}
                        disabled={isEditing}
                        className="form-control"
                        />
                    </div>
                </div>
                <div className="row align-items-center mb-3">
                    <label className="col-sm-3 form-label me-2">
                        Start Time:
                    </label>
                    <div className="col-sm-7">
                        <input
                        type="datetime-local"
                        name="startTime"
                        value={formatDateTimeLocal(event.startTime)}
                        onChange={handleInputChange}
                        disabled={isEditing}
                        className="form-control"
                        />
                    </div>
                </div>
                <div className="row align-items-center mb-3">
                    <label className="col-sm-3 form-label me-2">
                        End Time:
                    </label>
                    <div className="col-sm-7">
                        <input
                        type="datetime-local"
                        name="endTime"
                        value={formatDateTimeLocal(event.endTime)}
                        onChange={handleInputChange}
                        disabled={isEditing}
                        className="form-control"
                        />
                    </div>
                </div>
                <div className="row align-items-center mb-3">
                    <label className="col-sm-3 form-label me-2">
                        Capacity:
                    </label>
                    <div className="col-sm-7">
                        <input
                        type="text"
                        name="capacity"
                        value={event.capacity}
                        onChange={handleInputChange}
                        disabled={isEditing}
                        className="form-control"
                        />
                    </div>
                </div>
                <div className="row align-items-center mb-3">
                    <label className="col-sm-3 form-label me-2">
                        Points Remain:
                    </label>
                    <div className="col-sm-7">
                        <input
                        type="text"
                        name="pointsRemain"
                        value={event.pointsRemain}
                        onChange={handleInputChange}
                        disabled={isEditing}
                        className="form-control"
                        />
                    </div>
                </div>
                <div className="row align-items-center mb-3">
                    <label className="col-sm-3 form-label me-2">
                        Points Reward:
                    </label>
                    <div className="col-sm-7">
                        <input
                        type="text"
                        name="pointsReward"
                        value={event.pointsAwarded}
                        onChange={handleInputChange}
                        disabled
                        className="form-control"
                        />
                    </div>
                </div>
                <div className="row align-items-center mb-3">
                    <label htmlFor="published" className="col-sm-3 col-form-label me-2">
                        Published:
                    </label>
                    <div className="col-sm-7">
                        <select
                            id="published"
                            name="published"
                            className="form-select" 
                            value={String(event.published)}
                            onChange={handleInputChange} 
                            disabled={isEditing}
                        >
                            <option value="true">True</option>
                            <option value="false">False</option>
                        </select>
                    </div>
                </div>
                <div className="row mb-3">
                    <label className="col-sm-3 col-form-label pt-sm-0"> {/* Adjust alignment/padding if needed */}
                        Organizers ({event.organizers.length}):
                    </label>
                    <div className="col-sm-7">
                        {event.organizers.length > 0 ? (
                            <div style={{ maxHeight: '50px', overflowY: 'auto', border: '1px solid #eee', padding: '0.5rem', borderRadius: '0.25rem' }}>
                                <ul className="list-unstyled mb-0 small">
                                    {event.organizers.map(org => (
                                        <li key={org.id} className="mb-1">
                                            {org.name} ({org.utorid})
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <span className="text-muted">No organizers listed.</span>
                        )}
                    </div>
                </div>
                <div className="row mb-3">
                    <label className="col-sm-3 col-form-label pt-sm-0"> 
                        Guests ({event.guests.length}):
                    </label>
                    <div className="col-sm-7">
                        {event.guests.length > 0 ? (
                            <div style={{ maxHeight: '50px', overflowY: 'auto', border: '1px solid #eee', padding: '0.5rem', borderRadius: '0.25rem' }}>
                                <ul className="list-unstyled mb-0 small">
                                    {event.guests.map(guest => (
                                        <li key={guest.id} className="mb-1">
                                            {guest.name} ({guest.utorid})
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <span className="text-muted">No organizers listed.</span>
                        )}
                    </div>
                </div>
            </form>
            <div className="d-flex gap-2">
                <button className ="btn btn-success" onClick={editField}>Edit Fields</button>
                <button className = "btn btn-secondary" onClick={submitEditField}>Save Changes</button>
                <button className ="btn btn-danger"onClick={deleteEvent}>Delete Event</button>
            </div>
        </div>
    )
}