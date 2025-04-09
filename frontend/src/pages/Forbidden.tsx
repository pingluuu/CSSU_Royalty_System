import { useNavigate } from "react-router-dom"
const ForbiddenPage = () => {
    const navigate = useNavigate()
    return (
    <div className="container mt-4">
        THIS PAGE IS TO SHOW NOT ENOUGH AUTHORIZATED
        <button className="btn btn-primary m-2" onClick={() => navigate('/')}>Go Back To HomePage</button>
    </div>)
}

export default ForbiddenPage