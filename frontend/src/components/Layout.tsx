import { Outlet } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const handleResize = useCallback(() => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    if (!mobile) setSidebarOpen(false);
  }, []);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobile, sidebarOpen]);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f0f2f8" }}>
      {/* Overlay mobile */}
      {isMobile && sidebarOpen && (
        <div
          onClick={closeSidebar}
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.45)",
            zIndex: 99,
          }}
        />
      )}

      {/* Sidebar */}
      <Sidebar open={sidebarOpen} isMobile={isMobile} onClose={closeSidebar} />

      {/* Contenu principal */}
      <div
        style={{
          flex: 1,
          marginLeft: isMobile ? 0 : 220,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          transition: "margin-left 0.25s ease",
        }}
      >
        <Topbar onMenuClick={() => setSidebarOpen(true)} isMobile={isMobile} />

        <main
          style={{ flex: 1, padding: isMobile ? 12 : 20 }}
          className="page-enter"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
