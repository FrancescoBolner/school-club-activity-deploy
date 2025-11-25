// Page for creating a new club

import { React, useState, useEffect } from "react"
import axios from "axios"
import { Link, useNavigate } from "react-router-dom"

const CreateClub = () => {
    // State for club details
    const [clubs, setClubs] = useState({
        clubName: "",
        description: "",
        memberCount: 1,
        memberMax: null
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
            if (res.data.valid && !res.data.club && res.data.role === "STU") {
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
        setClubs((prev) => ({...prev, [e.target.name]: e.target.value, username: user.username}))
    }

    const handleClick = async (e) => {
        e.preventDefault() // Prevent default form submission behavior
        try {
            // Send POST request to backend to create club
            const res = await axios.post("http://localhost:3000/createClub", clubs)

            // If creation is successful, navigate back to home
            if (res.status === 201) navigate("../")
        } catch (err) {
            // Check if error comes from duplicate club
            if (err.response && err.response.status === 400) {
                alert("Club already exists!")
            } else {
                console.error(err)
            }
        }
    }

    // Render the create club form
    return (
        <div className="CreateClub">
            <h1>Create Club</h1>
            <form>
                <input type="text" placeholder="Club Name" onChange={handleChange} name="clubName" required/><br/>
                <textarea type="text" placeholder="Description" onChange={handleChange} name="description" required/><br/>
                <input type="number" placeholder="Max Members" onChange={handleChange} name="memberMax" required/><br/>
                <button type="submit" onClick={handleClick}>Create</button>
            </form>
            <button><Link to={"../"}>Back</Link></button>
        </div>
    )
}

export default CreateClub
