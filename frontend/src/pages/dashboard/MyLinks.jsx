/**
 * @file MyLinks.jsx
 * @description Dashboard page: MyLinks. Standard user dashboard view for managing links and viewing analytics.
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layout/DashboardLayout";
import LinkCard from "../../components/dashboard/LinkCard";
import API, { fetchWithAuth } from "../../utils/api";
import toast from "react-hot-toast";
import "./MyLinks.css";

function MyLinks() {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate=useNavigate();

  const linksPerPage = 3;

  // 🔹 FETCH USER LINKS
  const fetchUrls = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetchWithAuth("/user-urls");

      const data = await res.json();
      setUrls(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load links");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 LOAD ON PAGE OPEN
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    fetchUrls();
  }, []);

  // 🔥 FILTER + SORT
  const filteredUrls = urls
    .filter((item) =>
      item.original_url.toLowerCase().includes(search.toLowerCase()) ||
      item.short_code.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(a.created_at || 0);
      const dateB = new Date(b.created_at || 0);

      return sort === "newest"
        ? dateB - dateA
        : dateA - dateB;
    });

  // 🔥 PAGINATION LOGIC
  const indexOfLast = currentPage * linksPerPage;
  const indexOfFirst = indexOfLast - linksPerPage;
  const currentLinks = filteredUrls.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(filteredUrls.length / linksPerPage);

  return (
    <DashboardLayout>
        <div className="dashboard-scrollable-area container flex-col gap-md">

          {/* 🔥 HEADER */}
          <div className="page-header">
            <div>
              <h1 className="page-title">My Links</h1>
              <p className="page-subtitle">
                Manage and track all your shortened URLs
              </p>
            </div>

            
          </div>

          {/* 🔍 TOOLBAR */}
          <div className="links-toolbar">
            <input
              type="text"
              placeholder="Search links..."
              className="search-input"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1); // 🔥 reset page on search
              }}
            />

            <select className="filter-select">
              <option>All</option>
              <option>Active</option>
            </select>

            <select
              className="filter-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>

          {/* 🔥 LINKS GRID */}
          <div className="links-grid">

            {loading ? (
              <p className="empty-message">Loading links...</p>

            ) : filteredUrls.length === 0 ? (
              <p className="empty-message">
                No matching links found 🔍
              </p>

            ) : (
              currentLinks.map((item) => (
                <LinkCard
                  key={item.id}
                  link={item}
                  refreshUrls={fetchUrls}
                />
              ))
            )}

          </div>

          {/* 🔥 PAGINATION UI */}
          {!loading && totalPages > 1 && (
            <div className="pagination">

  <button
    className="page-btn"
    onClick={() =>
      setCurrentPage((prev) => Math.max(prev - 1, 1))
    }
    disabled={currentPage === 1}
  >
    ← Prev
  </button>

  {[...Array(totalPages)].map((_, index) => (
    <button
      key={index}
      className={`page-btn ${currentPage === index + 1 ? "active-page" : ""}`}
      onClick={() => setCurrentPage(index + 1)}
    >
      {index + 1}
    </button>
  ))}

  <button
    className="page-btn"
    onClick={() =>
      setCurrentPage((prev) =>
        Math.min(prev + 1, totalPages)
      )
    }
    disabled={currentPage === totalPages}
  >
    Next →
  </button>

</div>
          )}

        </div>
    </DashboardLayout>
  );
}

export default MyLinks;