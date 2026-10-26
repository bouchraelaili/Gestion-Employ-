import { useState, useEffect, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

interface User {
  id: number;
  email: string;
  role: "admin" | "rh";
  created_at: string;
}

const AddIcon = memo(() => (
  <svg viewBox="0 0 24 24" width={13} height={13} fill="white">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
  </svg>
));

const EditIcon = memo(() => (
  <svg viewBox="0 0 24 24" width={11} height={11} fill="#4a4e6a">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
  </svg>
));

const DeleteIcon = memo(() => (
  <svg viewBox="0 0 24 24" width={11} height={11} fill="#991b1b">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
  </svg>
));

const BackIcon = memo(() => (
  <svg viewBox="0 0 24 24" width={13} height={13} fill="#4a4e6a">
    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
  </svg>
));

export default function UsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    api
      .get("/users")
      .then((r) => setUsers(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = useCallback(async (id: number) => {
    if (!confirm("Supprimer ce compte ?")) return;
    setDeletingId(id);
    try {
      await api.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {
      alert("Erreur lors de la suppression");
    } finally {
      setDeletingId(null);
    }
  }, []);

  const avatarColors = ["#e84393", "#0f6e56", "#1a1a2e", "#d97706", "#4a4e6a"];
  const getColor = (i: number) => avatarColors[i % avatarColors.length];
  const getInitials = (email: string) => email.slice(0, 2).toUpperCase();
  const formatDate = (d: string) => new Date(d).toLocaleDateString("fr-FR");

  const handleNavigateNew = useCallback(
    () => navigate("/users/new"),
    [navigate],
  );
  const handleNavigateEdit = useCallback(
    (id: number) => navigate(`/users/${id}/edit`),
    [navigate],
  );
  const handleNavigateDashboard = useCallback(
    () => navigate("/dashboard"),
    [navigate],
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* ✅ Header responsive */}
      <div
        style={{
          background: "linear-gradient(135deg,#1a1a2e 0%,#16213e 100%)",
          borderRadius: 14,
          padding: isMobile ? "16px 18px" : "20px 24px",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "stretch" : "center",
          justifyContent: "space-between",
          gap: isMobile ? 12 : 0,
        }}
      >
        <div>
          <div
            style={{
              fontSize: isMobile ? 15 : 16,
              fontWeight: 500,
              color: "white",
              marginBottom: 4,
            }}
          >
            Gestion des utilisateurs
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.55)" }}>
            {users.length} compte{users.length > 1 ? "s" : ""} au total
          </div>
        </div>
        <button
          onClick={handleNavigateNew}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: isMobile ? "10px 14px" : "7px 14px",
            fontSize: 12,
            borderRadius: 8,
            border: "1px solid rgba(232,67,147,.4)",
            background: "#e84393",
            color: "white",
            cursor: "pointer",
            width: isMobile ? "100%" : "auto",
            flexShrink: 0,
          }}
        >
          <AddIcon />
          Nouvel utilisateur
        </button>
      </div>

      {/* ✅ Table / Cards responsive */}
      <div
        style={{
          background: "white",
          borderRadius: 14,
          overflow: "hidden",
          border: "1px solid #e8eaf0",
        }}
      >
        <div
          style={{
            padding: "14px 18px",
            borderBottom: "1px solid #f0f2f8",
            display: "flex",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 500, color: "#1a1a2e" }}>
            Comptes utilisateurs
            <span
              style={{
                marginLeft: 8,
                background: "#f0f2f8",
                color: "#4a4e6a",
                fontSize: 10,
                padding: "2px 8px",
                borderRadius: 20,
              }}
            >
              {users.length}
            </span>
          </span>
        </div>

        {loading ? (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              color: "#8b8fa8",
              fontSize: 13,
            }}
          >
            Chargement...
          </div>
        ) : users.length === 0 ? (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              color: "#8b8fa8",
              fontSize: 13,
            }}
          >
            Aucun utilisateur trouvé
          </div>
        ) : isMobile ? (
          <div style={{ padding: 12 }}>
            {users.map((u, i) => (
              <UserCard
                key={u.id}
                user={u}
                index={i}
                deletingId={deletingId}
                onEdit={() => handleNavigateEdit(u.id)}
                onDelete={() => handleDelete(u.id)}
                getColor={getColor}
                getInitials={getInitials}
                formatDate={formatDate}
              />
            ))}
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Utilisateur", "Rôle", "Date de création", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 18px",
                        textAlign: "left",
                        fontSize: 11,
                        fontWeight: 500,
                        color: "#8b8fa8",
                        background: "#f8f9fc",
                        borderBottom: "1px solid #f0f2f8",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <TableRow
                  key={u.id}
                  user={u}
                  index={i}
                  deletingId={deletingId}
                  onEdit={() => handleNavigateEdit(u.id)}
                  onDelete={() => handleDelete(u.id)}
                  getColor={getColor}
                  getInitials={getInitials}
                  formatDate={formatDate}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div>
        <button
          onClick={handleNavigateDashboard}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: isMobile ? "center" : "flex-start",
            gap: 6,
            padding: "7px 14px",
            fontSize: 12,
            borderRadius: 8,
            border: "1px solid #e0e3ec",
            background: "white",
            color: "#4a4e6a",
            cursor: "pointer",
            width: isMobile ? "100%" : "auto",
          }}
        >
          <BackIcon />
          Retour au dashboard
        </button>
      </div>
    </div>
  );
}

interface UserCardProps {
  user: User;
  index: number;
  deletingId: number | null;
  onEdit: () => void;
  onDelete: () => void;
  getColor: (i: number) => string;
  getInitials: (email: string) => string;
  formatDate: (d: string) => string;
}

const UserCard = memo(function UserCard({
  user,
  index,
  deletingId,
  onEdit,
  onDelete,
  getColor,
  getInitials,
  formatDate,
}: UserCardProps) {
  const [hoveredEdit, setHoveredEdit] = useState(false);
  const [hoveredDelete, setHoveredDelete] = useState(false);

  return (
    <div
      style={{
        padding: 14,
        borderRadius: 12,
        border: "1px solid #e8eaf0",
        marginBottom: 10,
        background: "white",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: getColor(index),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 600,
            color: "white",
            flexShrink: 0,
          }}
        >
          {getInitials(user.email)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 500, fontSize: 14, color: "#1a1a2e" }}>
            {user.email}
          </div>
          <div style={{ fontSize: 12, color: "#8b8fa8" }}>
            {formatDate(user.created_at)}
          </div>
        </div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "3px 10px",
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 500,
            background: user.role === "admin" ? "#fce4f0" : "#e0f7f0",
            color: user.role === "admin" ? "#c73380" : "#0f6e56",
            flexShrink: 0,
          }}
        >
          {user.role === "admin" ? "🔑 Admin" : "👤 RH"}
        </span>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={onEdit}
          onMouseEnter={() => setHoveredEdit(true)}
          onMouseLeave={() => setHoveredEdit(false)}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
            fontSize: 12,
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #e0e3ec",
            background: hoveredEdit ? "#f0f2f8" : "white",
            color: "#4a4e6a",
            cursor: "pointer",
            transition: "background 0.15s",
          }}
        >
          <EditIcon />
          Modifier
        </button>
        <button
          onClick={onDelete}
          disabled={deletingId === user.id}
          onMouseEnter={() => setHoveredDelete(true)}
          onMouseLeave={() => setHoveredDelete(false)}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
            fontSize: 12,
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #fca5a5",
            background:
              hoveredDelete && deletingId !== user.id ? "#fee2e2" : "white",
            color: "#991b1b",
            cursor: deletingId === user.id ? "not-allowed" : "pointer",
            opacity: deletingId === user.id ? 0.6 : 1,
            transition: "background 0.15s",
          }}
        >
          <DeleteIcon />
          {deletingId === user.id ? "Suppression..." : "Supprimer"}
        </button>
      </div>
    </div>
  );
});

interface TableRowProps {
  user: User;
  index: number;
  deletingId: number | null;
  onEdit: () => void;
  onDelete: () => void;
  getColor: (i: number) => string;
  getInitials: (email: string) => string;
  formatDate: (d: string) => string;
}

const TableRow = memo(function TableRow({
  user,
  index,
  deletingId,
  onEdit,
  onDelete,
  getColor,
  getInitials,
  formatDate,
}: TableRowProps) {
  const [hovered, setHovered] = useState(false);
  const [hoveredEdit, setHoveredEdit] = useState(false);
  const [hoveredDelete, setHoveredDelete] = useState(false);

  return (
    <tr
      style={{
        borderBottom: "1px solid #f5f6fa",
        background: hovered ? "#fafbff" : "white",
        transition: "background .1s",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <td style={{ padding: "12px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: getColor(index),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 600,
              color: "white",
              flexShrink: 0,
            }}
          >
            {getInitials(user.email)}
          </div>
          <span
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "#1a1a2e",
            }}
          >
            {user.email}
          </span>
        </div>
      </td>
      <td style={{ padding: "12px 18px" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "3px 10px",
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 500,
            background: user.role === "admin" ? "#fce4f0" : "#e0f7f0",
            color: user.role === "admin" ? "#c73380" : "#0f6e56",
          }}
        >
          {user.role === "admin" ? "🔑 Admin" : "👤 RH"}
        </span>
      </td>
      <td
        style={{
          padding: "12px 18px",
          fontSize: 12,
          color: "#8b8fa8",
        }}
      >
        {formatDate(user.created_at)}
      </td>
      <td style={{ padding: "12px 18px" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={onEdit}
            onMouseEnter={() => setHoveredEdit(true)}
            onMouseLeave={() => setHoveredEdit(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 11,
              padding: "5px 12px",
              borderRadius: 8,
              border: "1px solid #e0e3ec",
              background: hoveredEdit ? "#f0f2f8" : "white",
              color: "#4a4e6a",
              cursor: "pointer",
              transition: "background 0.15s",
            }}
          >
            <EditIcon />
            Modifier
          </button>
          <button
            onClick={onDelete}
            disabled={deletingId === user.id}
            onMouseEnter={() => setHoveredDelete(true)}
            onMouseLeave={() => setHoveredDelete(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 11,
              padding: "5px 12px",
              borderRadius: 8,
              border: "1px solid #fca5a5",
              background:
                hoveredDelete && deletingId !== user.id ? "#fee2e2" : "white",
              color: "#991b1b",
              cursor: deletingId === user.id ? "not-allowed" : "pointer",
              opacity: deletingId === user.id ? 0.6 : 1,
              transition: "background 0.15s",
            }}
          >
            <DeleteIcon />
            {deletingId === user.id ? "Suppression..." : "Supprimer"}
          </button>
        </div>
      </td>
    </tr>
  );
});
