import { useState, useEffect } from "react";
import { fetchWithAuth } from "../../utils/api";

export default function UserLinksModal({ user, onClose }) {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLinks = async () => {
      try {
        const data = await fetchWithAuth(`/admin/users/${user.id}/links`);
        setLinks(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadLinks();
  }, [user.id]);

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-large">
        <h2>Links by {user.username || user.email}</h2>
        
        {loading ? (
          <p>Loading links...</p>
        ) : links.length === 0 ? (
          <p>This user has no links.</p>
        ) : (
          <div className="links-table-container">
            <table className="links-table">
              <thead>
                <tr>
                  <th>Original URL</th>
                  <th>Short Code</th>
                  <th>Clicks</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {links.map(link => (
                  <tr key={link.id}>
                    <td className="truncate-text" title={link.original_url}>{link.original_url}</td>
                    <td>{link.short_code}</td>
                    <td>{link.clicks}</td>
                    <td>{new Date(link.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="modal-actions">
          <button onClick={onClose} className="btn-cancel">Close</button>
        </div>
      </div>
    </div>
  );
}
