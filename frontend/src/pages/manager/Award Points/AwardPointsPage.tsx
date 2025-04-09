import api from "../../../services/api"
import { useState, useEffect } from "react"
import { useNavigate , useParams} from "react-router-dom"
import { useAuth } from "../../../contexts/AuthContext"
import axios from 'axios';
interface Organizer {
    id: number;
    utorid: string;
    name: string
}


interface FormData {
    type: string;
    utorid: string;
    amount: number | null;
}

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

export default function AwardPointsPage(){
    const navigate = useNavigate()
    const {id} = useParams()
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null)
    const [permissionEventErr, setPermissionEventErr] = useState<string | null>(null)
    const [event, setEvent] = useState<Event|null>(null);
    const [message, setMessage] = useState("")
    const [targetType, setTargetType] = useState('all');
    const {user} = useAuth()
    const [refresh, setRefresh] = useState(0)
    const [formData, setFormData] = useState <FormData>(
        {
            type: 'event',
            utorid: "",
            amount: null
        });

    useEffect(() => {
        if (!user){
            return;
        }
        const fetchEvent = async () => {
            try {
                const res = await api.get(`/events/${id}`)
                setEvent(res.data)
                
                const checkOrganizer = res.data.organizers.some((organizer: Organizer)=> organizer.utorid === user.utorid);
                if (user.role !== "superuser" && user.role !== "manager" && !checkOrganizer){
                    setPermissionEventErr("Denied Permission")
                }
                
            }
            catch (error: any){
                if (error.response.status === 404){
                    setPermissionEventErr("Event not found")
                }
            }
            finally {
                setLoading(false)
            }
        }
        fetchEvent()
    }, [id, refresh])

    const handleTargetChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedValue = event.target.value;
        setTargetType(selectedValue);
        
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = event.target;
        
        if (name === "amount") {
            const numValue = value === "" ? null : Number(value);
            setFormData((prev) => ({
                ...prev,
                amount: isNaN(numValue as any) ? prev.amount : numValue,
            }));
        } else if (name === "utorid") {
            setFormData((prev) => ({
                ...prev,
                utorid: value,
            }));
        }
    }
    const handleSubmit = async () => {
        try {
            console.log(formData)
            if (event?.guests.length === 0){
                setError("No guests in this event to add points to")
                setMessage("")
                return;
            }
            await api.post(`/events/${id}/transactions`, formData)
            setMessage("Points successfully awarded")
            setFormData(prev => ({
                ...prev,
                utorid: "",
                amount: null
            }));
            setError(null)
            setRefresh((refresh) => refresh + 1)
            
        }
        catch (err){
            console.log("err", err)
            if (axios.isAxiosError(err)){
                if (err?.status === 400){
                    setError("User not in guest list, must be positive points and have enough points")
                }
            setMessage("")
        }
    }}

    if (permissionEventErr) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger text-center">
                    <h1>{permissionEventErr}</h1>
                </div>
                <button className="btn btn-secondary me-2" onClick={() => navigate('/')}>Go Back To HomePage</button>
            </div>
        )
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
    return (
        <div className="container mt-4">
            <h2> Award points to users for event {event?.name}</h2>
            <div className = "">
                <div className="radio-option">
                    <input
                        type="radio"
                        id="targetAll"
                        name="awardTarget" 
                        value="all"       
                        checked={targetType === 'all'}   
                        onChange={handleTargetChange}    
                    />
                    <label htmlFor="targetAll">All Guests ({event?.guests.length})</label>
                </div>
                <div className="radio-option">
                    <input
                        type="radio"
                        id="targetSingle"
                        name="awardTarget"
                        value="single"    
                        checked={targetType === 'single'} 
                        onChange={handleTargetChange}     
                    />
                    <label htmlFor="targetSingle">Single Guest</label>
                </div>

            </div>
            <form className="mt-3">
                {targetType === "single" && 
                    <div>
                        <label className="form-label">
                        Utorid:
                        </label>
                        <input type="text"
                        name="utorid"
                        className="form-control" 
                        placeholder="Enter UtorIdhere" 
                        onChange={handleInputChange}
                        value={formData.utorid}
                        required
                        />
                    </div>
                }
                    <div>
                        <label className="form-label">
                        Amount of Points (Remaining Points {event?.pointsRemain})
                        </label>
                        <input type="number"
                        name="amount"
                        className="form-control" 
                        placeholder="Enter Number of Points" 
                        onChange={handleInputChange}
                        value={formData.amount ?? ''}
                        required
                        />
                    </div>
            </form>
            <button className="btn btn-secondary me-2" onClick={() => navigate(`/manager/events/${id}`)}>Go Back To Event</button>
            <button className="btn btn-primary" onClick={handleSubmit}>Add Points</button>
            {message && <div className="mt-3 alert alert-success">{message}</div>}
            {error && <div className="mt-3 alert alert-danger">{error}</div>}
        </div>
    )
}