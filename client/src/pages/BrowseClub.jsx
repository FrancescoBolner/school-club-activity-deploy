import { React, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DOMPurify from 'dompurify';
import api from "../api";
import { getSession } from "../utils/auth";

// Progress bar component
const ProgressBar = ({ percentage }) => {
  return (
    <div className="progress-bar-container">
        <div className="progress-container">
            <div className="progress-bar" style={{ width: `${percentage}%` }}></div>
        </div>
        {percentage.toFixed(0)}%
    </div>
  );
};

export default function BrowseClubs() {
  const session = getSession();
  const [clubs, setClubs] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [status, setStatus] = useState("all"); // full, notFull, all
  const [orderBy, setOrderBy] = useState("membersAsc"); // nameAsc, nameDesc, membersDesc
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const mappedOrder = () => {
    switch (orderBy) {
      case "nameAsc":
        return { orderBy: "clubName", order: "asc" };
      case "nameDesc":
        return { orderBy: "clubName", order: "desc" };
      case "membersDesc":
        return { orderBy: "memberCount", order: "desc" };
      case "membersAsc":
      default:
        return { orderBy: "memberCount", order: "asc" };
    }
  };

  const loadClubs = async () => {
    setLoading(true);
    setError("");
    const { orderBy: ob, order } = mappedOrder();
    try {
      const res = await api.get("/clubs", {
        params: {
          q: search,
          status,
          orderBy: ob,
          order,
          page: currentPage,
          limit
        }
      });
      const payload = res.data.data ? res.data.data : res.data;
      setClubs(payload);
      setMeta({
        page: res.data.page || 1,
        pages: res.data.pages || Math.max(1, Math.ceil(payload.length / limit)),
        total: res.data.total || payload.length
      });
    } catch (err) {
      console.error(err);
      setError("Failed to load clubs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search, status, orderBy, limit]);

  useEffect(() => {
    loadClubs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, orderBy, currentPage, limit]);

  return (
    <div className="browse-page">
      {/* Top bar */}
      <div className="top-bar">
        <input
          type="text"
          placeholder="Search clubs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={() => setFilterOpen(!filterOpen)}>≡</button>
      </div>

      {error && <div className="alert error">{error}</div>}

      {/* Filter panel */}
      {filterOpen && (
        <div className="filter-panel">
          <label>
            Status:
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">Any</option>
              <option value="full">Full</option>
              <option value="notFull">Not full</option>
            </select>
          </label>

          <label>
            Order by:
            <select value={orderBy} onChange={(e) => setOrderBy(e.target.value)}>
              <option value="membersAsc">Members ↑</option>
              <option value="membersDesc">Members ↓</option>
              <option value="nameAsc">Name ↑</option>
              <option value="nameDesc">Name ↓</option>
            </select>
          </label>
          <label>
            Per page:
            <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
              <option value={4}>4</option>
              <option value={8}>8</option>
              <option value={12}>12</option>
              <option value={16}>16</option>
            </select>
          </label>
        </div>
      )}

      {loading && <p style={{ textAlign: "center", opacity: 0.6 }}>Loading...</p>}

      {/* Clubs grid */}
      <div className="clubs-grid">
        {clubs.map((club) => {
          const isMyClub = session?.club === club.clubName;
          const alreadyInClub = session?.club && !isMyClub; // Has club (including pending)
          const bannerStyle = club.bannerImage 
            ? { backgroundImage: `url(${club.bannerImage})` }
            : { backgroundColor: club.bannerColor || '#38bdf8' };
          return (
            <div className="club card" key={club.clubName}>
              <div className="club-banner" style={bannerStyle}></div>
              <div className="club-content">
                <h2>{club.clubName}</h2>
                <p dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(club.description) }}></p>
                <p>Members: {club.memberCount} / {club.memberMax}</p>
                <ProgressBar percentage={(club.memberCount / club.memberMax) * 100} />
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <Link className="btn" to={`/ClubPage/${club.clubName}`}>View Club</Link>
                  {!isMyClub && !alreadyInClub && club.memberCount < club.memberMax && (
                    <button className="btn" onClick={async () => {
                      try {
                        await api.put(`/joinClubs/${club.clubName}`);
                        alert('Join request submitted! Please wait for approval.');
                        window.location.reload();
                      } catch (err) {
                        alert(err.response?.data?.message || 'Failed to join club');
                      }
                    }}>Join</button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="pagination">
        {(() => {
          const current = currentPage;
          const total = meta.pages;
          const pages = [];
          
          if (total <= 5) {
            for (let i = 1; i <= total; i++) pages.push(i);
          } else {
            pages.push(1);
            if (current > 3) pages.push('...');
            for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
              if (!pages.includes(i)) pages.push(i);
            }
            if (current < total - 2) pages.push('...');
            if (!pages.includes(total)) pages.push(total);
          }
          
          return pages.map((page, idx) => 
            page === '...' ? (
              <span key={`ellipsis-${idx}`} style={{ padding: '0 0.5rem' }}>...</span>
            ) : (
              <button
                key={page}
                className={current === page ? "active" : ""}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            )
          );
        })()}
        <span className="pagination-meta">{meta.total} results</span>
      </div>
    </div>
  );
}
