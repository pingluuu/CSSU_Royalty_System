import api from "../../../services/api"
import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import axios from 'axios';

export default function AddEventGuestPage(){
    const [utorid, setUtorId] = useState("")
    const [invalidEvent, setInvalidEvent] = useState(false);
    const {id} = useParams()
    const [error, setError] = useState<string|null>(null)
    const [loading, setLoading] = useState(true);
    const [invalidUser, setInvalidUser] = useState(false)
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUtorId(event.target.value)
    }
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        try {
            await api.post(`/events/${id}/guests`, {utorid: utorid})
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
        setLoading(true)
        setInvalidEvent(false)
        setError(null)
        const checkValidEvent = async () => {
            try {
                await api.get(`/events/${id}`)
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
    }, [id])

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
            
        </div>
    )
}