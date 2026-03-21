/**
 * @file Sidebar.jsx
 * @description Global layout wrapper: Sidebar. Defines the overall layout structure for specific sections (like Dashboard or full app).
 */

import { Link } from "react-router-dom";
function Sidebar() {
    return (
        <div className="w-64 bg-white shadow-md p-6">

            <h2 className="text-2xl font-bold text-pink-500 mb-8">
                Ziplo
            </h2>
            <ul className="space-y-4">

                <li>
                    <Link to="/dashboard">Dashboard</Link>
                </li>

                <li>
                    <Link to="/dashboard">My Links</Link>
                </li>

                <li>
                    <Link to="/analytics">Analytics</Link>
                </li>

                <li>
                    Settings
                </li>

                <li>
                    Logout
                </li>

            </ul>

        </div>
    );
}
export default Sidebar;