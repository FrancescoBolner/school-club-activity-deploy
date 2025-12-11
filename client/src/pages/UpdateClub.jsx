// Page for updating a club

import { React, useEffect, useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from "../api"
import { getSession } from "../utils/auth"

const UpdateClub = () => {
    const clubName = useLocation().pathname.split("/")[2]
    const session = getSession()
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const [clubs, setClubs] = useState({
        clubName: clubName,
        description: "",
        memberMax: "",
        bannerImage: "",
        bannerColor: "#38bdf8"
    })

    const isLeader = session?.role === 'CL' && session?.club === clubName

    // Fetch existing club data
    const { data: clubData, isLoading } = useQuery({
        queryKey: ['club', clubName],
        queryFn: () => api.get("/clubs/" + clubName).then(res => res.data?.[0]),
        enabled: !!clubName && isLeader
    })

    // Populate form when data is loaded
    useEffect(() => {
        if (clubData) {
            setClubs({
                clubName: clubData.clubName,
                description: clubData.description || "",
                memberMax: clubData.memberMax || "",
                bannerImage: clubData.bannerImage || "",
                bannerColor: clubData.bannerColor || "#38bdf8"
            })
        }
    }, [clubData])

    const updateClubMutation = useMutation({
        mutationFn: (data) => api.post("/updateClub/" + clubName, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['club', clubName])
            navigate("../ClubPage/" + clubName)
        },
        onError: (err) => {
            if (err.response && err.response.status === 400) {
                alert("Max members cannot be lower than current members.")
            } else {
                console.error(err)
                alert(err.response?.data?.message || "Unable to update club")
            }
        }
    })

    const handleChange = (e) => {
        setClubs((prev) => ({...prev, [e.target.name]: e.target.value}))
    }

    const handleClick = (e) => {
        e.preventDefault()
        if (!isLeader) return alert("Only club admins can update club info.")
        updateClubMutation.mutate(clubs)
    }

    if (isLoading) return <div className="CreateClub"><p>Loading club info...</p></div>

    return (
        <div className="CreateClub">
            <h1>Update Club {clubName}</h1>
            {isLeader ? (
                <form onSubmit={handleClick}>
                    <textarea 
                        placeholder="Description" 
                        onChange={handleChange} 
                        name="description" 
                        value={clubs.description}
                        required
                    /><br/>
                    <input 
                        type="number" 
                        placeholder="Max Members" 
                        onChange={handleChange} 
                        name="memberMax" 
                        value={clubs.memberMax}
                        required
                    /><br/>
                    <input 
                        type="url" 
                        placeholder="Banner Image URL (leave empty to use color)" 
                        onChange={handleChange} 
                        name="bannerImage" 
                        value={clubs.bannerImage}
                    /><br/>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.85rem" }}>
                        Banner Color:
                        <input 
                            type="color" 
                            onChange={handleChange} 
                            name="bannerColor" 
                            value={clubs.bannerColor} 
                            style={{ width: "60px", height: "40px", cursor: "pointer" }}
                        />
                    </label>
                    <button type="submit" disabled={updateClubMutation.isPending}>
                        {updateClubMutation.isPending ? "Updating..." : "Update"}
                    </button>
                </form>
            ) : (
                <p style={{ opacity: 0.7 }}>Only the club leader can edit the club information.</p>
            )}
            <button><Link to={"../ClubPage/" + clubName}>Back</Link></button>
        </div>
    )
}

export default UpdateClub
