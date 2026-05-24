import { useState } from "react";
import "./LinksTable.css";
import toast from "react-hot-toast";
import { fetchWithAuth, ROOT_URL } from "../../utils/api";
import ConfirmModal from "../ui/ConfirmModal";
import { BsQrCode, BsDownload, BsTrash, BsCopy, BsCheck } from "react-icons/bs";

function LinksTable({ urls, loading, refreshUrls }) {
  const [copiedId, setCopiedId] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // 🔥 COPY
  const handleCopy = (shortCode, id) => {
    const fullUrl = `${ROOT_URL}/${shortCode}`;
    navigator.clipboard.writeText(fullUrl);

    setCopiedId(id);
    toast.success("Copied!");

    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // 🔥 DELETE
  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      setDeleting(true);

      await fetchWithAuth(`/delete-url/${selectedId}`, {
        method: "DELETE",
      });

      toast.success("Deleted successfully");
      refreshUrls();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Delete failed");
    } finally {
      setDeleting(false);
      setIsModalOpen(false);
      setSelectedId(null);
    }
  };

  // 🔥 STATUS UPDATE
  const handleStatusChange = async (id, newStatus) => {
    if (newStatus === "disabled") {
      const confirm = window.confirm("Are you sure you want to disable this link?");
      if (!confirm) return;
    }

    try {
      await fetchWithAuth(`/links/${id}/status`, {
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

  // 📷 GENERATE QR
  const handleQR = (shortCode) => {
    const url = `${ROOT_URL}/${shortCode}`;
    const qrUrl = `${ROOT_URL}/generate-qr?url=${encodeURIComponent(url)}`;

    window.open(qrUrl, "_blank");
  };

  // ⬇ DOWNLOAD QR
  const downloadQR = async (shortCode) => {
    try {
      const url = `${ROOT_URL}/${shortCode}`;
      const qrUrl = `${ROOT_URL}/generate-qr?url=${encodeURIComponent(url)}`;

      const response = await fetch(qrUrl);
      const blob = await response.blob();

      const downloadUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `qr-${shortCode}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(downloadUrl);

      toast.success("QR downloaded");
    } catch (err) {
      console.error(err);
      toast.error("Download failed");
    }
  };

  return (
    <div className="links-table-container">

      <div className="table-header-row">
        <h3>Recent Links</h3>
      </div>

      <div className="table-wrapper">
        <table className="custom-table">

          <thead>
            <tr>
              <th>SHORT URL</th>
              <th>ORIGINAL URL</th>
              <th>CLICKS</th>
              <th>STATUS</th>
              <th></th>
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
                  No links yet. Create your first link 🚀
                </td>
              </tr>

            ) : (
              urls.slice(0, 5).map((item) => (
                <tr key={item.id}>

                  {/* 🔗 SHORT */}
                  <td className="cell-short">
                    <a
                      href={`${ROOT_URL}/${item.short_code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="short-link"
                    >
                      ziplo.in/{item.short_code}
                    </a>
                  </td>

                  {/* 🌐 ORIGINAL */}
                  <td className="cell-original">
                    {item.original_url}
                  </td>

                  {/* 📊 CLICKS */}
                  <td>
                    <span className="clicks-badge">
                      <span className="dot"></span>
                      {item.click_count || 0}
                    </span>
                  </td>

                  {/* ✅ STATUS */}
                  <td>
                    <div className="status-container">

                      <span className={`status-badge ${item.status}`}>
                        {item.status}
                      </span>
                       
                    </div>
                  </td>

                  {/* ⚡ ACTIONS */}
                  <td className="cell-actions">

                    <button
                      onClick={() => handleCopy(item.short_code, item.id)}
                      className={`icon-btn ${copiedId === item.id ? "copied" : ""}`}
                    >
                      {copiedId === item.id ? <BsCheck size={18} /> : <BsCopy size={18} />}
                    </button>

                    <button
                      onClick={() => handleQR(item.short_code)}
                      className="icon-btn"
                      title="View QR Code"
                    >
                      <BsQrCode size={18} />
                    </button>
                    <button
                      onClick={() => downloadQR(item.short_code)}
                      className="icon-btn"
                      title="Download QR Code"
                    >
                      <BsDownload size={18} />
                    </button>

                    <button
                      onClick={() => handleDeleteClick(item.id)}
                      className="icon-btn delete"
                      title="Delete Link"
                    >
                      <BsTrash size={18} />
                    </button>

                  </td>

                </tr>
              ))
            )}

          </tbody>

        </table>
      </div>

      {/* 🔥 CONFIRM MODAL */}
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Link"
        message="This link will be permanently deleted."
        confirmText={deleting ? "Deleting..." : "Delete"}
      />

    </div>
  );
}

export default LinksTable;