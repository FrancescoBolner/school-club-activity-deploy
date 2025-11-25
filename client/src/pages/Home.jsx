// Page showing all clubs and incoming events

import { React, useEffect, useState } from "react"
import axios from "axios"
import { Link, useNavigate } from "react-router-dom"
import BrowseClubs from "./BrowseClub.jsx";

const Home = () => {
    // State to hold clubs and events data
    const [clubs, setClubs] = useState([])
    const [events, setEvents] = useState([])
    const [user, setUser] = useState(null)

    // Navigation hook to redirect
    const navigate = useNavigate()
    
    // Ensure axios sends cookies with requests
    axios.defaults.withCredentials = true;

    // Check user session on component mount
    useEffect(() => {
        axios.get("http://localhost:3000/session")
        .then((res) => {
            if (res.data.valid) {
                setUser(res.data)
            } else {
                navigate("/LogIn")
            }
        })
        .catch((err) => {
            console.error(err)
        })
    }, [])

    // Fetch clubs data from backend
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get("http://localhost:3000/clubs")
                setClubs(res.data)
            } catch (err) {
                console.error(err)
            }
        }
        fetchData()
    }, [])

    // Fetch events data from backend
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get("http://localhost:3000/events")
                setEvents(res.data)
            } catch (err) {
                console.error(err)
            }
        }
        fetchData()
    }, [])

    const handleLogout = async () => {
        try {
            await axios.post("http://localhost:3000/logout")
            setUser(null)
            navigate("/LogIn")
        } catch (err) {
            console.error(err)
        }
    }

    if (!user) {
        return (
            <div>
                <p style={{ textAlign: "center", opacity: 0.6 }}>Loading…</p>
            </div>
        )
    }

    // Render clubs and events
    return (
        <div>
            <section className="dashboard-header">
                <div className="user-card">
                    <p className="eyebrow">Signed in as</p>
                    <h1>{user.username}</h1>
                    <p className="user-card__subtitle">
                        {user.club ? `Active member of ${user.club}` : 'Not enrolled in a club yet'}
                    </p>
                    <div className="user-card__actions">
                        <button onClick={handleLogout}>Log out</button>
                        <Link className="btn secondary" to={user.club ? `/ClubPage/${user.club}` : '/CreateClub'}>
                            {user.club ? 'View my club' : 'Create a club'}
                        </Link>
                    </div>
                </div>
                <div className="user-metrics">
                    <div className="metric">
                        <span className="metric-label">Club</span>
                        <span className="metric-value">{user.club}</span>
                    </div>
                    <div className="metric">
                        <span className="metric-label">Role</span>
                        <span className="metric-value">{user.role}</span>
                    </div>
                    <div className="metric">
                        <span className="metric-label">Upcoming events</span>
                        <span className="metric-value">{events.length}</span>
                    </div>
                </div>
            </section>
            <section>
                <h1>Club List</h1>
                <div className="clubs">
                    {<BrowseClubs clubs={clubs} />}
                </div>
                {!user.club && (
                    <div className="createClub">
                        <h4>No club interest you?</h4>
                        <button><Link to={"/CreateClub"}>Create Club</Link></button>
                    </div>
                )}
            </section>
            <section>
                <h1>Incoming Events</h1>
                <div className="events">
                    {events.map((event) => (
                        <div className="event" key={event.eventid}>
                        <div className="event-header">
                            <h2>{event.title}</h2>
                            <span className="event-date">
                                {((s,e)=>!e
                                    ? `${s.toLocaleDateString('en-GB')} ${s.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',hour12:false})}`
                                    : s.toDateString() === e.toDateString()
                                        ? `${s.toLocaleDateString('en-GB')} ${s.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',hour12:false})} - ${e.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',hour12:false})}`
                                        : `${s.toLocaleDateString('en-GB')} ${s.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',hour12:false})} - ${e.toLocaleDateString('en-GB')} ${e.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',hour12:false})}`
                                    )(new Date(event.startDate), event.endDate ? new Date(event.endDate) : null
                                )}
                            </span>
                        </div>
                        <p className="event-club">Hold by {event.clubName}</p>
                        <p className="event-description">{event.description}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}

export default Home
