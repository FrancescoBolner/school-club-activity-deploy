// Page for creating a new club

import { React, useState, useEffect } from "react"
import axios from "axios"
import { Link, useNavigate, useLocation } from "react-router-dom"

const CreateEvent = () => {
    // Get club name from URL
    const location = useLocation()
    const clubName = location.pathname.split("/")[2]

    // State for club details
    const [event, setEvent] = useState({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        clubName: clubName
    })
    const [user, setUser] = useState(null)

    // Navigation hook to return to home page after creation
    const navigate = useNavigate()

    // Ensure axios sends cookies with requests
    axios.defaults.withCredentials = true;

    // Check user session on component mount
    useEffect(() => {
        axios.get("http://localhost:3000/session")
        .then((res) => {
            if (res.data.valid && res.data.club === clubName && (res.data.role === "CL" || res.data.role === "VP")) {
                setUser(res.data)
            } else {
                navigate("/")
            }
        })
        .catch((err) => {
            console.error(err)
        })
    }, [])

    // Handle input changes and update state
    const handleChange = (e) => {
        setEvent((prev) => ({...prev, [e.target.name]: e.target.value}))
    }

    // Handle form submission to create a new club
    const handleClick = async (e) => {
        e.preventDefault() // Prevent default form submission behavior
        try {
            // Send POST request to backend to create club
            await axios.post("http://localhost:3000/createEvent", event)
            navigate("../../ClubPage/" + clubName) // Navigate back to club page
        } catch (err) {
            // Log any errors
            console.error(err)
        }
    }

    // Render the create club form
    return (
        <div className="CreateClub">
            <h1>Event under {clubName}</h1>
            <form>
                <input type="text" placeholder="title" onChange={handleChange} name="title" required/><br/>
                <textarea type="text" placeholder="description" onChange={handleChange} name="description" required/><br/>
                <input type="datetime-local" onChange={handleChange} name="startDate" required/><br/>
                <input type="datetime-local" onChange={handleChange} name="endDate" required/><br/>
                <button type="submit" onClick={handleClick}>Create</button>
            </form>
            <button><Link to={"../../ClubPage/" + clubName}>Back</Link></button>
        </div>
    )
}

export default CreateEvent
