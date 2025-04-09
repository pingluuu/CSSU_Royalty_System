import { useState } from "react"
import api from "../../../services/api";
import { useNavigate } from 'react-router-dom';
interface FormData {
    name: string;
    description: string;
    location: string;
    startTime: string;
    endTime: string
    capacity: number | null;
    points: number
}
const ManagerCreateNewEvent = () => {
    const [message, setMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<FormData>(
        {
            name: '',
            description: '',
            location: '',
            startTime: '',
            endTime: '',
            capacity: null,
            points: 1
        });

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        if (name === 'capacity') {

            setFormData((prevData) => ({
                ...prevData,
                capacity: value === '' ? null : Number(value)
            }));
        } else {
            setFormData((prevData) => ({
                ...prevData,
                [name]: value
            }));
        }
    }
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        try {
            console.log(typeof (formData.capacity))

            const payload = {
                ...formData,
                startTime: new Date(formData.startTime).toISOString(),
                endTime: new Date(formData.endTime).toISOString(),
                capacity: typeof (formData.capacity) === "number" ? formData.capacity : null,
                points: Number(formData.points)
            }
            await api.post('/events', payload)
            setMessage("Your Event Has Successfully Been Created")
            setError(null)

            const navigate = useNavigate();
            navigate('/all-events');
        }
        catch (err) {
            if (err instanceof Error && (err as any).response) {
                const backendMessage = (err as any).response?.data?.message;
                const status = (err as any).response?.status;

                if (backendMessage) {
                    setError(backendMessage);
                } else if (status === 400) {
                    setError("Event could not be created");
                } else {
                    setError("Unexpected Error Occurred");
                }
            } else {
                setError("Unexpected Error Occurred");
            }

        }

    }
    return (
        <div className="container mt-4">
            <form onSubmit={handleSubmit} className="row g-3">
                <div>
                    <label className="form-label">
                        Name of Event
                    </label>
                    <input
                        type="text" name="name" value={formData.name}
                        onChange={handleChange}
                        className="form-control"
                        required
                    />
                </div>
                <div>
                    <label>
                        Description
                    </label>
                    <input
                        type="text" name="description" value={formData.description}
                        onChange={handleChange}
                        className="form-control"
                        required
                    />
                </div>
                <div>
                    <label className="form-label">
                        Location
                    </label>
                    <input
                        type="text" name="location" value={formData.location}
                        onChange={handleChange}
                        className="form-control"
                        required
                    />
                </div>
                <div className="col md-6">
                    <label className="form-label">
                        Start Time
                    </label>
                    <input
                        type="datetime-local" name="startTime" value={formData.startTime}
                        onChange={handleChange}
                        required
                        className="form-control"
                    />
                </div>
                <div className="col md-6">
                    <label className="form-label">
                        End Time
                    </label>
                    <input
                        type="datetime-local" name="endTime" value={formData.endTime}
                        onChange={handleChange}
                        className="form-control"
                        required
                    />
                </div>
                <div>
                    <label className="form-label">
                        Capacity (optional)
                    </label>
                    <input
                        type="number" name="capacity" value={formData.capacity === null ? '' : formData.capacity}
                        className="form-control"
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="form-label">
                        Points
                    </label>
                    <input
                        type="number" name="points" value={formData.points}
                        onChange={handleChange}
                        className="form-control"
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary"> Submit</button>
            </form>

            {message && <div className="mt-3 alert alert-success">{message}</div>}
            {error && <div className="mt-3 alert alert-danger">{error}</div>}
        </div>

    )
}

export default ManagerCreateNewEvent