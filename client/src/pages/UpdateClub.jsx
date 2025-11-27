// Page for creating a new club

import { React, useEffect, useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import api from "../api"
import { getSession } from "../utils/auth"

const UpdateClub = () => {
    // Get club name from URL
    const clubName = useLocation().pathname.split("/")[2]

    const session = getSession()

    // State for club details
    const [clubs, setClubs] = useState({
        clubName: clubName,
        description: "",
        memberMax: null,
        bannerImage: "",
        bannerColor: "#38bdf8"
    })
    const [canEdit, setCanEdit] = useState(true)

    const isLeader = session?.role === 'CL' && session?.club === clubName

    useEffect(() => {
        if (!isLeader) {
            setCanEdit(false)
        }
    }, [isLeader])

    // Navigation hook to return to home page after creation
    const navigate = useNavigate()

    // Handle input changes and update state
    const handleChange = (e) => {
        setClubs((prev) => ({...prev, [e.target.name]: e.target.value}))
    }

    // Handle form submission to create a new club
    const handleClick = async (e) => {
        e.preventDefault() // Prevent default form submission behavior
        try {
            if (!canEdit) {
                alert("Only club admins can update club info.")
                return
            }
            const res = await api.post("/updateClub/" + clubName, clubs)

            if (res.status === 201) navigate("../ClubPage/" + clubName) // Navigate back to home
        } catch (err) {
            if (err.response && err.response.status === 400) {
                alert("Max members cannot be lower than current members.")
            } else {
                console.error(err)
                alert(err.response?.data?.message || "Unable to update club")
            }
        }
    }

    // ---> UPDATE: change role STU to CL and club NULL to clubName <---

    // Render the create club form
    return (
        <div className="CreateClub">
            <h1>Update Club {clubName}</h1>
            {canEdit && isLeader ? (
                <form>
                    <textarea type="text" placeholder="Description" onChange={handleChange} name="description" required/><br/>
                    <input type="number" placeholder="Max Members" onChange={handleChange} name="memberMax" required/><br/>
                    <input type="url" placeholder="Banner Image URL (leave empty to use color)" onChange={handleChange} name="bannerImage"/><br/>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.85rem" }}>
                        Banner Color:
                        <input type="color" onChange={handleChange} name="bannerColor" value={clubs.bannerColor} style={{ width: "60px", height: "40px", cursor: "pointer" }}/>
                    </label>
                    <button type="submit" onClick={handleClick}>Update</button>
                </form>
            ) : (
                <p style={{ opacity: 0.7 }}>Only the club leader can edit the club information.</p>
            )}
            <button><Link to={"../ClubPage/" + clubName}>Back</Link></button>
        </div>
    )
}

export default UpdateClub
