/**
 * @file ManageLinksTable.jsx
 * @description Dashboard component for manage links table. Used within the user or admin dashboard.
 */

import "./LinksTable.css";
import toast from "react-hot-toast";
import API, { fetchWithAuth } from "../../utils/api";

function ManageLinksTable({ urls, loading, refreshUrls }) {

  const handleCopy = (shortCode) => {
    const fullUrl = `${API}/${shortCode}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success("Copied!");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this link?")) return;

    try {
      await fetchWithAuth(`/delete-url/${id}`, {
        method: "DELETE",
      });

      toast.success("Deleted successfully");
      refreshUrls(); // 🔄 reload data
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Delete failed");
    }
  };

  return (
    <div className="links-table-container">

      <div className="table-header-row">
        <h3>My Links</h3>
      </div>

      <div className="table-wrapper">
        <table className="custom-table">

          <thead>
            <tr>
              <th>SHORT URL</th>
              <th>ORIGINAL URL</th>
              <th>CLICKS</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>

          <tbody>

            {loading ? (
              <tr>
                <td colSpan="5" className="table-message">
                  Loading links...
                </td>
              </tr>

            ) : urls.length === 0 ? (
              <tr>
                <td colSpan="5" className="table-message">
                  No links yet 🚀
                </td>
              </tr>

            ) : (
              urls.map((item) => (
                <tr key={item.id}>

                  {/* SHORT */}
                  <td>
                    <a
                      href={`${API}/${item.short_code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="short-link"
                    >
                      ziplo.in/{item.short_code}
                    </a>
                  </td>

                  {/* ORIGINAL */}
                  <td className="cell-original">
                    {item.original_url}
                  </td>

                  {/* CLICKS */}
                  <td>
                    <span className="clicks-badge">
                      <span className="dot"></span>
                      {item.click_count}
                    </span>
                  </td>

                  {/* STATUS */}
                  <td>
                    <span className="status-badge active">
                      Active
                    </span>
                  </td>

                  {/* ACTIONS */}
                  <td className="cell-actions">

                    <button
                      onClick={() => handleCopy(item.short_code)}
                      className="copy-btn"
                    >
                      Copy
                    </button>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>

                  </td>

                </tr>
              ))
            )}

          </tbody>

        </table>
      </div>
    </div>
  );
}

export default ManageLinksTable;