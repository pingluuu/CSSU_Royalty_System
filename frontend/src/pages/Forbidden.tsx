import { useNavigate } from "react-router-dom"
const ForbiddenPage = () => {
    const navigate = useNavigate()
    return (
    <div>
        THIS PAGE IS TO SHOW NOT ENOUGH AUTHORIZATED
        <button className="btn btn-primary m-2" onClick={() => navigate('/')}>Go Back To Event</button>
    </div>)
}

export default ForbiddenPage