import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LinkCard.css";
import toast from "react-hot-toast";
import API, { fetchWithAuth } from "../../utils/api";
import ConfirmModal from "../ui/ConfirmModal";

function LinkCard({ link, refreshUrls }) {
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔗 COPY
  const handleCopy = () => {
    const url = `http://localhost:5000/api/${link.short_code}`;
    navigator.clipboard.writeText(url);
    toast.success("Copied!");
  };

  // 🗑 DELETE
  const handleDelete = async () => {
    const token = localStorage.getItem("token");

    try {
      setLoading(true);

      const res = await fetchWithAuth(`/delete-url/${link.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Deleted successfully");
        refreshUrls();
      } else {
        toast.error(data.error || "Delete failed");
      }

    } catch (err) {
      console.error(err);
      toast.error("Server error");
    } finally {
      setLoading(false);
      setIsModalOpen(false);
    }
  };

  // 🔄 STATUS UPDATE
  const handleStatusChange = async (newStatus) => {
    const token = localStorage.getItem("token");

    if (newStatus === "disabled") {
      const confirm = window.confirm("Are you sure you want to disable this link?");
      if (!confirm) return;
    }

    try {
      const res = await fetchWithAuth(`/links/${link.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`Link ${newStatus}`);
        refreshUrls();
      } else {
        toast.error(data.error || "Failed to update status");
      }

    } catch (err) {
      console.error(err);
      toast.error("Server error");
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