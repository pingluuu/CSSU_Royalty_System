import { useEffect, useState } from "react"
import { useParams, useNavigate, useLocation} from "react-router-dom";
import api from "../../../services/api";
import { useAuth } from "../../../contexts/AuthContext";
import axios from "axios";

// ...


//Also includes event organizer for this view
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
    organizers: { id: number, utorid: string, name: string }[]
    guests: { id: number, utorid: string, name: string }[];
}

interface Organizer {
    id: number;
    utorid: string;
    name: string
}

interface EditableEventData {
    id?: number; // Added id property
    name?: string;
    description?: string;
    location?: string;
    startTime?: string;
    endTime?: string;
    capacity?: number | null;
    pointsRemain?: number; // If total points are editable
    pointsAwarded?: number; // Added pointsAwarded property
    published?: boolean;
    guests?: { id: number, utorid: string, name: string }[]; // Added guests property
    organizers?: { id: number, utorid: string, name: string }[]; // Added organizers property
}

export default function EventDetailPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [event, setEvent] = useState<Event | null>(null);
    const [error, setError] = useState<string | null>(null)
    const [isEditing, setIsEditing] = useState(true);
    const [eventDeleted, setEventDeleted] = useState(false)
    const [formData, setFormData] = useState<EditableEventData>({});
    const [message, setMessage] = useState("")
    const {id} = useParams()
    const {user} = useAuth()
    const location = useLocation();
    const backLink = location.state?.from?.pathname + location.state?.from?.search || '/all-events';

    // const [removingOrganizerId, setRemovingOrganizerId] = useState<number | null>(null);
    // const [organizerError, setOrganizerError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvent = async () => {
            if (!user) {
                return;
            }
            try {
                const res = await api.get(`/events/${id}`)
                const checkOrganizer = res.data.organizers.some((organizer: Organizer) => organizer.utorid === user.utorid);
                if (user.role !== "superuser" && user.role !== "manager" && !checkOrganizer) {
                    setError("Denied Permission")
                }
                console.log(res.data)
                setEvent(res.data)
                setFormData(res.data)
            }
            catch (error: any) {
                if (error.response.status === 404) {
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        console.log(name, value);
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    }
    const deleteEvent = async () => {
        try {
            await api.delete(`/events/${id}`)
            setEventDeleted(true)

        }
        catch (err) {
            const backendMessage = axios.isAxiosError(err) ? err.response?.data?.message : null;
            console.log(err, "ERROR")
            if (backendMessage) {
                console.log("execute here")
                setError(backendMessage)
            }

            else {
                setError("Unexpected Error Occured")
            }


        }
    }

    const submitEditField = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        try {
            e.preventDefault()
            const payload: EditableEventData = {}

            if (formData.startTime !== event?.startTime) {
                if (formData.startTime) {
                    payload.startTime = new Date(formData.startTime).toISOString();
                }
            }
            if (formData.endTime !== event?.endTime) {
                if (formData.endTime) {
                    payload.endTime = new Date(formData.endTime).toISOString();
                }
            }

            if (formData.pointsRemain !== event?.pointsRemain) {
                const intValue = parseInt(formData.pointsRemain?.toString() || "0", 10);
                if (!isNaN(intValue)) {
                    payload.capacity = intValue
                }
                console.log(intValue)
            }

            if (formData.capacity !== event?.capacity) {
                const intValue = parseInt(formData.capacity?.toString() || "0", 10);
                if (!isNaN(intValue)) {
                    payload.capacity = intValue
                }

            }

            if (formData.name !== event?.name) {
                payload.name = formData.name
            }

            if (formData.description !== event?.description) {
                payload.description = formData.description
            }

            if (user?.role === "manager") {
                if (formData.published !== event?.published) {
                    payload.published = formData.published
                }
            }

            if (formData.location !== event?.location) {
                payload.location = formData.location
            }
            console.log(payload)
            await api.patch(`/events/${id}`, payload)
            setMessage("Event successfully updated")
            setIsEditing(!isEditing)
            setError(null)
        }
        catch (err) {
            setMessage("")
            if (axios.isAxiosError(err)) {
                console.log('here')
                if (err?.status === 400) {
                    setError([
                        "Start or end time is in the past.",
                        "Capacity cannot be reduced below the number of confirmed guests.",
                        "Total points cannot be reduced below the remaining unallocated points.",
                        "Cannot update name, description, location, start time, or capacity after the event has started.",
                        "Cannot update end time after the event has ended."
                    ].join(" "));

                }

            }
            else { setError("unexpected error") }


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

    if (loading) {
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

    if (eventDeleted) {
        return (
            <div className="container mt-4">
                <div className="alert alert-success text-center">
                    <h1>Event Deleted</h1>
                </div>
                <button className="btn btn-secondary me-2" onClick={() => navigate('/')}>Go Back To HomePage</button>
            </div>
        )
    }
    if (!event) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger text-center">
                    <h1>{error ? "Error" : "Not Found"}</h1>
                    <p>{error || "Event data could not be loaded or the event does not exist."}</p>
                </div>
                <button className="btn btn-secondary me-2" onClick={() => navigate('/')}>Go Back To HomePage</button>
            </div>
        )
    }

    return (
        <div className="container mt-4">
            <button className="btn btn-secondary mb-3" onClick={() => navigate(backLink)}>
                &larr; Back to Events
            </button>
            <form className="m-2">
                <div className="row align-items-center mb-3">
                    <label className="col-md-3 form-label">
                        Event ID:
                    </label>
                    <div className="col-md-9">
                        <input
                            type="text"
                            name="id"
                            value={formData.id}
                            onChange={handleInputChange}
                            disabled
                            className="form-control"
                        />
                    </div>
                </div>
                <div className="row align-items-center mb-3">
                    <label className="col-md-3 form-label">
                        Name of Event:
                    </label>
                    <div className="col-md-9">
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            disabled={isEditing}
                            className="form-control"
                        />
                    </div>
                </div>
                <div className="row align-items-center mb-3">
                    <label className="col-md-3 form-label">
                        Description:
                    </label>
                    <div className="col-md-9">
                        <input
                            type="text"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            disabled={isEditing}
                            className="form-control"
                        />
                    </div>
                </div>
                <div className="row align-items-center mb-3">
                    <label className="col-md-3 form-label">
                        Location:
                    </label>
                    <div className="col-md-9">
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            disabled={isEditing}
                            className="form-control"
                        />
                    </div>
                </div>
                <div className="row align-items-center mb-3">
                    <label className="col-md-3 form-label">
                        Start Time:
                    </label>
                    <div className="col-md-9">
                        <input
                            type="datetime-local"
                            name="startTime"
                            value={formatDateTimeLocal(formData.startTime || "")}
                            onChange={handleInputChange}
                            disabled={isEditing}
                            className="form-control"
                        />
                    </div>
                </div>
                <div className="row align-items-center mb-3">
                    <label className="col-md-3 form-label">
                        End Time:
                    </label>
                    <div className="col-md-9">
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
                    <label className="col-md-3 form-label">
                        Capacity:
                    </label>
                    <div className="col-md-9">
                        <input
                            type="number"
                            name="capacity"
                            value={formData.capacity ?? ""}
                            onChange={handleInputChange}
                            disabled={isEditing}
                            className="form-control"
                        />
                    </div>
                </div>
                <div className="row align-items-center mb-3">
                    <label className="col-md-3 form-label">
                        Points Remain:
                    </label>
                    <div className="col-md-9">
                        <input
                            type="number"
                            name="pointsRemain"
                            value={formData.pointsRemain}
                            onChange={handleInputChange}
                            disabled={isEditing || user?.role !== "manager"}
                            className="form-control"
                        />
                    </div>
                </div>
                <div className="row align-items-center mb-3">
                    <label className="col-md-3 form-label">
                        Points Awarded:
                    </label>
                    <div className="col-md-9">
                        <input
                            type="text"
                            name="pointsReward"
                            value={formData.pointsAwarded}
                            onChange={handleInputChange}
                            disabled={true}
                            className="form-control"
                        />
                    </div>
                </div>

                <div className="row align-items-center mb-3">
                    <label htmlFor="published" className="col-md-3 form-label">
                        Published:
                    </label>
                    <div className="col-md-9">
                        <select
                            id="published"
                            name="published"
                            className="form-select"
                            value={String(formData.published)}
                            onChange={handleInputChange}
                            disabled={isEditing || user?.role !== "manager"}
                        >
                            <option value="true">True</option>
                            <option value="false">False</option>
                        </select>
                    </div>
                </div>
                <div className="row mb-3">
                    <label className="col-md-3 form-label">
                        Organizers ({formData.organizers?.length ?? 0}):
                    </label>
                    <div className="col-sm-7">
                        <button className="btn btn-primary"
                            onClick={() => navigate(`/manager/events/${id}/manage-organizers`)}>View Organizers</button>
                    </div>
                </div>
                <div className="row mb-3">
                    <label className="col-md-3 form-label">
                        Guests ({formData.guests?.length ?? 0}):
                    </label>
                    <div className="col-sm-7">
                        <button className="btn btn-primary btn-sm"
                            onClick={() => navigate(`/manager/events/${id}/manage-guests`)}>View Guests</button>
                    </div>
                </div>
            </form>
            <div className="d-flex flex-column flex-md-row gap-2 mt-4">
                <button className="btn btn-primary" onClick={editField}>Edit Fields</button>
                <button className="btn btn-secondary" onClick={submitEditField}>Save Changes</button>
                {(user?.role === "superuser" || user?.role === "manager") &&
                    <button className="btn btn-danger" onClick={deleteEvent}>Delete Event</button>}
                <button className="btn btn-primary" onClick={() => navigate(`/manager/events/${id}/award-points`)}>Award Points</button>
            </div>
            {message && <div className="mt-3 alert alert-success">{message}</div>}
            {error && <div className="mt-3 alert alert-danger">{error}</div>}
        </div>
    )
}