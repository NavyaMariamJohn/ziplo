import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LinkCard.css";
import toast from "react-hot-toast";
import { fetchWithAuth, BASE_URL } from "../../utils/api";
import ConfirmModal from "../ui/ConfirmModal";

function LinkCard({ link, refreshUrls }) {
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔗 COPY
  const handleCopy = () => {
    const url = `${BASE_URL}/${link.short_code}`;
    navigator.clipboard.writeText(url);
    toast.success("Copied!");
  };

  // 🗑 DELETE
  const handleDelete = async () => {
    try {
      setLoading(true);

      await fetchWithAuth(`/delete-url/${link.id}`, {
        method: "DELETE",
      });

      toast.success("Deleted successfully");
      refreshUrls();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Delete failed");
    } finally {
      setLoading(false);
      setIsModalOpen(false);
    }
  };

  // 🔄 STATUS UPDATE
  const handleStatusChange = async (newStatus) => {
    if (newStatus === "disabled") {
      const confirm = window.confirm("Are you sure you want to disable this link?");
      if (!confirm) return;
    }

    try {
      await fetchWithAuth(`/links/${link.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });

      toast.success(`Link ${newStatus}`);
      refreshUrls();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to update status");
    }
  };

  // 📅 DATE
  const formattedDate = link.created_at
    ? new Date(link.created_at).toLocaleDateString()
    : "No Date";

  return (
    <div className="link-card">

      {/* 🔗 SHORT */}
      <div className="link-top">
        <span className="short-link">
          ziplo.in/{link.short_code}
        </span>

        <button onClick={handleCopy} className="icon-btn">
          📋
        </button>
      </div>

      {/* 🌐 ORIGINAL */}
      <p className="original-url" title={link.original_url}>
        {link.original_url}
      </p>

      {/* 🟢 STATUS */}
      <div className={`status-badge ${link.status}`}>
        {link.status}
      </div>

      {/* 📊 META */}
      <div className="link-meta">
        <span>👁 {link.click_count || 0} clicks</span>
        <span>📅 {formattedDate}</span>
      </div>

      {/* ⚡ ACTIONS */}
      <div className="link-actions">

        {/* STATUS CONTROL */}
        <select
          value={link.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="status-select"
        >
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="disabled">Disabled</option>
        </select>

        {/* QR (future) */}
        <button>QR</button>

        {/* 📊 STATS → NAVIGATION */}
        <button onClick={() => navigate(`/dashboard/link/${link.id}`)}>
          Stats
        </button>

        {/* 🗑 DELETE */}
        <button
          className="delete-btn"
          onClick={() => setIsModalOpen(true)}
        >
          Delete
        </button>

      </div>

      {/* 🔥 DELETE MODAL */}
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Link"
        message="This link will be permanently deleted."
        loading={loading}
      />

    </div>
  );
}

export default LinkCard;