import { useNavigate } from "react-router-dom"
const ForbiddenPage = () => {
    const navigate = useNavigate()
    return (
    <div>
        ⚠️ Unauthorized Access. You do not have permission to access this page.
        <button className="btn btn-primary m-2" onClick={() => navigate('/')}>Go Back To Event</button>
    </div>)
}

export default ForbiddenPage