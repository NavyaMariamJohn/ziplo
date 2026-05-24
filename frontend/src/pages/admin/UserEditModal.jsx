import { useState } from "react";
import { fetchWithAuth } from "../../utils/api";

export default function UserEditModal({ user, onClose, refreshUsers }) {
  const [username, setUsername] = useState(user.username || "");
  const [role, setRole] = useState(user.role || "user");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetchWithAuth(`/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, role }),
      });
      refreshUsers();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Edit User Profile</h2>
        <p><strong>Email:</strong> {user.email}</p>
        
        <label>Username:</label>
        <input 
          type="text" 
          value={username} 
          onChange={e => setUsername(e.target.value)} 
          className="modal-input"
        />

        <label>Role:</label>
        <select 
          value={role} 
          onChange={e => setRole(e.target.value)}
          className="modal-input"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        <div className="modal-actions">
          <button onClick={onClose} className="btn-cancel">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-save">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
