import { useState, useEffect } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import DashboardNavbar from "./DashboardNavbar";
import "./DashboardLayout.css";

function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth <= 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className={`dashboard-layout ${isMobile ? "mobile" : "desktop"} ${isSidebarOpen ? "sidebar-open" : "sidebar-collapsed"}`}>
      
      {/* 🔥 MOBILE OVERLAY */}
      {isMobile && isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      <Sidebar isOpen={isSidebarOpen} isMobile={isMobile} toggleSidebar={toggleSidebar} onClose={() => setIsSidebarOpen(false)} />
      <main className="dashboard-main-content">
        <DashboardNavbar toggleSidebar={toggleSidebar} />
        <div className="dashboard-content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;
