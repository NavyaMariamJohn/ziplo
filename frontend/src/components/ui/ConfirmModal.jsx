/**
 * @file ConfirmModal.jsx
 * @description Reusable UI component: ConfirmModal. Provides generic UI functionality across the app.
 */

import "./ConfirmModal.css";
import Button from "./Button";

function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone",
  confirmText = "Delete",
  cancelText = "Cancel",
  loading = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()} // prevents closing when clicking inside
      >

        <h3 className="modal-title">{title}</h3>
        <p className="modal-message">{message}</p>

        <div className="modal-actions">

          <Button variant="secondary" onClick={onClose}>
            {cancelText}
          </Button>

          <Button
            variant="danger"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Deleting..." : confirmText}
          </Button>

        </div>

      </div>
    </div>
  );
}

export default ConfirmModal;