/**
 * @file Button.jsx
 * @description Reusable UI component: Button. Provides generic UI functionality across the app.
 */

import "./Button.css";

function Button({ children, variant = "primary", onClick, disabled }) {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default Button;