import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCallback, memo, type JSX } from "react";

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: JSX.Element;
  adminOnly?: boolean;
  badge?: number;
}

interface SidebarProps {
  open?: boolean;
  isMobile?: boolean;
  onClose?: () => void;
}

const DashboardIcon = memo(() => (
  <svg viewBox="0 0 24 24" width={15} height={15}>
    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
  </svg>
));

const EmployeesIcon = memo(() => (
  <svg viewBox="0 0 24 24" width={15} height={15}>
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
  </svg>
));

const PredictIcon = memo(() => (
  <svg viewBox="0 0 24 24" width={15} height={15}>
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z" />
  </svg>
));

const UsersIcon = memo(() => (
  <svg viewBox="0 0 24 24" width={15} height={15}>
    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
  </svg>
));

const BrandIcon = memo(() => (
  <svg viewBox="0 0 24 24" width={18} height={18} fill="white">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
));

const CloseIcon = memo(() => (
  <svg viewBox="0 0 24 24" width={14} height={14} fill="rgba(255,255,255,.6)">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
));

const LogoutIcon = memo(() => (
  <svg viewBox="0 0 24 24" width={14} height={14} fill="rgba(255,255,255,.5)">
    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
  </svg>
));

export default function Sidebar({
  open = false,
  isMobile = false,
  onClose,
}: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();

  const isActive = useCallback(
    (path: string) =>
      path === "/"
        ? location.pathname === "/" || location.pathname === "/dashboard"
        : location.pathname.startsWith(path),
    [location.pathname],
  );

  const navItems: NavItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      path: "/dashboard",
      icon: <DashboardIcon />,
    },
    {
      id: "employees",
      label: "Employés",
      path: "/employees",
      icon: <EmployeesIcon />,
    },
    {
      id: "predict",
      label: "Prédiction ML",
      path: "/predict",
      icon: <PredictIcon />,
    },
    {
      id: "users",
      label: "Utilisateurs",
      path: "/users",
      adminOnly: true,
      icon: <UsersIcon />,
    },
  ];

  const visibleItems = navItems.filter((item) => !item.adminOnly || isAdmin);
  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : "RH";

  const handleNavigate = useCallback(
    (path: string) => {
      navigate(path);
      if (isMobile && onClose) onClose();
    },
    [navigate, isMobile, onClose],
  );

  const handleLogoutEnter = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.style.background = "rgba(232,67,147,.3)";
    },
    [],
  );

  const handleLogoutLeave = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.style.background = "rgba(255,255,255,.08)";
    },
    [],
  );

  const shouldShow = isMobile ? open : true;

  if (isMobile && !open) return null;

  return (
    <div
      style={{
        width: 220,
        minWidth: 220,
        background: "#1a1a2e",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: isMobile ? "fixed" : "fixed",
        left: 0,
        top: 0,
        zIndex: 100,
        transform: shouldShow ? "translateX(0)" : "translateX(-100%)",
        transition: isMobile
          ? "transform 0.25s cubic-bezier(.4,0,.2,1)"
          : "none",
        boxShadow: isMobile && open ? "4px 0 24px rgba(0,0,0,.35)" : "none",
      }}
    >
      {/* Brand */}
      <div
        style={{
          padding: "22px 18px 18px",
          borderBottom: "1px solid rgba(255,255,255,.07)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            background: "#e84393",
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <BrandIcon />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 500, color: "white" }}>
            RH Manager
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)" }}>
            Gestion du personnel
          </div>
        </div>

        {/* Close button — mobile only */}
        {isMobile && (
          <button
            onClick={onClose}
            aria-label="Fermer le menu"
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "rgba(255,255,255,.08)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <CloseIcon />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "14px 10px", overflowY: "auto" }}>
        <div
          style={{
            fontSize: 10,
            color: "rgba(255,255,255,.3)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            padding: "10px 10px 5px",
          }}
        >
          Principal
        </div>

        {visibleItems.map((item) => {
          const active = isActive(item.path);
          return (
            <NavItemButton
              key={item.id}
              item={item}
              active={active}
              onNavigate={handleNavigate}
            />
          );
        })}
      </nav>

      {/* User footer */}
      <div
        style={{
          padding: "14px 16px",
          borderTop: "1px solid rgba(255,255,255,.07)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: "#e84393",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 500,
            color: "white",
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: "white",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {user?.email || "Utilisateur"}
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)" }}>
            {user?.role === "admin" ? "Administrateur" : "Responsable RH"}
          </div>
        </div>
        <button
          onClick={logout}
          title="Déconnexion"
          aria-label="Déconnexion"
          onMouseEnter={handleLogoutEnter}
          onMouseLeave={handleLogoutLeave}
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: "rgba(255,255,255,.08)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <LogoutIcon />
        </button>
      </div>
    </div>
  );
}

interface NavItemButtonProps {
  item: NavItem;
  active: boolean;
  onNavigate: (path: string) => void;
}

const NavItemButton = memo(function NavItemButton({
  item,
  active,
  onNavigate,
}: NavItemButtonProps) {
  const handleEnter = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!active) {
        e.currentTarget.style.background = "rgba(255,255,255,.06)";
        e.currentTarget.style.color = "white";
      }
    },
    [active],
  );

  const handleLeave = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!active) {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "rgba(255,255,255,.55)";
      }
    },
    [active],
  );

  const handleClick = useCallback(() => {
    onNavigate(item.path);
  }, [onNavigate, item.path]);

  return (
    <button
      onClick={handleClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "9px 12px",
        borderRadius: 10,
        fontSize: 13,
        width: "100%",
        textAlign: "left",
        border: "none",
        cursor: "pointer",
        background: active ? "#e84393" : "transparent",
        color: active ? "white" : "rgba(255,255,255,.55)",
        transition: "all 0.15s",
        marginBottom: 2,
      }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <span
        style={{
          fill: active ? "white" : "rgba(255,255,255,.4)",
          display: "flex",
          flexShrink: 0,
        }}
      >
        {item.icon}
      </span>
      <span style={{ flex: 1 }}>{item.label}</span>
      {item.badge != null && (
        <span
          style={{
            background: active ? "rgba(255,255,255,.25)" : "#e84393",
            color: "white",
            fontSize: 10,
            padding: "1px 7px",
            borderRadius: 20,
          }}
        >
          {item.badge}
        </span>
      )}
    </button>
  );
});
