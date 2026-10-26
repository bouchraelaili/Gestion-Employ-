import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { exportService } from "../services/exportService";
import { useCallback, memo } from "react";

const pageMeta: Record<string, { title: string; sub: string }> = {
  "/dashboard": {
    title: "Dashboard",
    sub: "Résumé et activités du système RH",
  },
  "/employees": { title: "Employés", sub: "Liste complète des employés" },
  "/predict": {
    title: "Prédiction ML",
    sub: "Analyse de risque par Machine Learning",
  },
  "/users": {
    title: "Utilisateurs",
    sub: "Gestion des comptes administrateurs",
  },
};

interface TopbarProps {
  onMenuClick?: () => void;
  isMobile?: boolean;
}

const MenuIcon = memo(() => (
  <svg viewBox="0 0 24 24" width={18} height={18} fill="#1a1a2e">
    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
  </svg>
));

const DownloadIcon = memo(() => (
  <svg viewBox="0 0 24 24" width={13} height={13} fill="#4a4e6a">
    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
  </svg>
));

const AddIcon = memo(() => (
  <svg viewBox="0 0 24 24" width={13} height={13} fill="white">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
  </svg>
));

const BellIcon = memo(() => (
  <svg viewBox="0 0 24 24" width={16} height={16} fill="#4a4e6a">
    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
  </svg>
));

export default function Topbar({ onMenuClick, isMobile }: TopbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleExport = useCallback(async (type: "excel" | "pdf") => {
    try {
      if (type === "excel") await exportService.downloadExcel();
      else await exportService.downloadPdf();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'export");
    }
  }, []);

  const handleAddEmployee = useCallback(() => {
    navigate("/employees/new");
  }, [navigate]);

  const handleMenuClick = useCallback(() => {
    onMenuClick?.();
  }, [onMenuClick]);

  const { title, sub } = (() => {
    const currentKey =
      Object.keys(pageMeta).find((k) => location.pathname.startsWith(k)) ||
      "/dashboard";
    const isDetailPage = /\/employees\/\d+$/.test(location.pathname);
    const isFormPage =
      location.pathname.includes("/edit") || location.pathname.endsWith("/new");

    let title = pageMeta[currentKey]?.title || "RH Manager";
    let sub = pageMeta[currentKey]?.sub || "";

    if (isDetailPage) {
      title = "Fiche employé";
      sub = "Détail complet de l'employé";
    }
    if (isFormPage) {
      title = location.pathname.endsWith("/new")
        ? "Ajouter un employé"
        : "Modifier l'employé";
      sub = "Formulaire de saisie";
    }
    return { title, sub };
  })();

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : "RH";
  const isEmployeesPage = location.pathname === "/employees";

  return (
    <div
      style={{
        background: "white",
        borderBottom: "1px solid #e8eaf0",
        padding: "0 22px",
        height: 56,
        display: "flex",
        alignItems: "center",
        gap: 12,
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Hamburger — mobile only */}
      {isMobile && (
        <button
          onClick={handleMenuClick}
          aria-label="Ouvrir le menu"
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "rgba(26,26,46,.07)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <MenuIcon />
        </button>
      )}

      {/* Title */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 15,
            fontWeight: 500,
            color: "#1a1a2e",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </div>
        {!isMobile && (
          <div style={{ fontSize: 11, color: "#8b8fa8", marginTop: 1 }}>
            {sub}
          </div>
        )}
      </div>

      {/* Actions */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: isMobile ? 6 : 10,
        }}
      >
        {/* Export buttons — desktop only */}
        {isEmployeesPage && !isMobile && (
          <>
            <ExportButton type="excel" onExport={handleExport} />
            <ExportButton type="pdf" onExport={handleExport} />
          </>
        )}

        {/* Add button */}
        {isEmployeesPage && (
          <button
            onClick={handleAddEmployee}
            style={{
              display: "flex",
              alignItems: "center",
              gap: isMobile ? 0 : 6,
              padding: isMobile ? "7px 10px" : "7px 16px",
              fontSize: 12,
              fontWeight: 500,
              borderRadius: 8,
              border: "none",
              background: "#e84393",
              color: "white",
              cursor: "pointer",
            }}
          >
            <AddIcon />
            {!isMobile && "Ajouter"}
          </button>
        )}

        {/* Notification bell */}
        <button
          aria-label="Notifications"
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            border: "1px solid #e0e3ec",
            background: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            position: "relative",
            flexShrink: 0,
          }}
        >
          <BellIcon />
          <span
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              width: 7,
              height: 7,
              background: "#e84393",
              borderRadius: "50%",
              border: "1.5px solid white",
            }}
          />
        </button>

        {/* User avatar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: isMobile ? "5px" : "5px 10px",
            border: "1px solid #e0e3ec",
            borderRadius: 10,
            cursor: "pointer",
            background: "white",
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "#e84393",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              fontWeight: 500,
              color: "white",
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          {!isMobile && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, color: "#1a1a2e" }}>
                {user?.email?.split("@")[0] || "Admin"}
              </div>
              <div style={{ fontSize: 10, color: "#8b8fa8" }}>
                {user?.role === "admin" ? "Administrateur" : "RH"}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ExportButtonProps {
  type: "excel" | "pdf";
  onExport: (type: "excel" | "pdf") => void;
}

const ExportButton = memo(function ExportButton({
  type,
  onExport,
}: ExportButtonProps) {
  const handleClick = useCallback(() => {
    onExport(type);
  }, [onExport, type]);

  return (
    <button
      onClick={handleClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "7px 12px",
        fontSize: 12,
        borderRadius: 8,
        border: "1px solid #e0e3ec",
        background: "white",
        color: "#4a4e6a",
        cursor: "pointer",
      }}
    >
      <DownloadIcon />
      {type === "excel" ? "Excel" : "PDF"}
    </button>
  );
});
