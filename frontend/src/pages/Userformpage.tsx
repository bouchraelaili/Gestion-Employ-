import { useState, useEffect, useCallback, memo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

const SaveIcon = memo(() => (
  <svg viewBox="0 0 24 24" width={13} height={13} fill="white">
    <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" />
  </svg>
));

const SaveIconGray = memo(() => (
  <svg viewBox="0 0 24 24" width={13} height={13} fill="#8b8fa8">
    <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" />
  </svg>
));

export default function UserFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [form, setForm] = useState({ email: "", role: "rh", password: "" });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/users/${id}`)
      .then((r) =>
        setForm({ email: r.data.email, role: r.data.role, password: "" }),
      )
      .catch(() => navigate("/users"))
      .finally(() => setLoading(false));
  }, [id, isEdit, navigate]);

  const validate = useCallback(() => {
    const e: Record<string, string> = {};
    if (!form.email.includes("@")) e.email = "Email invalide";
    if (!isEdit && form.password.length < 6)
      e.password = "Minimum 6 caractères";
    if (isEdit && form.password && form.password.length < 6)
      e.password = "Minimum 6 caractères";
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [form.email, form.password, isEdit]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload: any = { email: form.email, role: form.role };
      if (form.password) payload.password = form.password;

      if (isEdit) {
        await api.put(`/users/${id}`, payload);
      } else {
        await api.post("/users", { ...payload, password: form.password });
      }
      navigate("/users");
    } catch (err: any) {
      alert(err.response?.data?.error || "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  }, [form, isEdit, id, navigate, validate]);

  const handleChange = useCallback((field: string, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
  }, []);

  const handleNavigateBack = useCallback(() => navigate("/users"), [navigate]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 300,
        }}
      >
        <div style={{ fontSize: 13, color: "#8b8fa8" }}>Chargement...</div>
      </div>
    );
  }

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
          gap: isMobile ? 8 : 0,
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
            {isEdit ? "Modifier le compte" : "Nouveau compte"}
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.55)" }}>
            {isEdit
              ? `Modification de l'utilisateur #${id}`
              : "Créer un nouvel accès utilisateur"}
          </div>
        </div>
      </div>

      {/* ✅ Form responsive */}
      <div
        style={{
          background: "white",
          border: "1px solid #e8eaf0",
          borderRadius: 14,
          padding: isMobile ? 14 : 20,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: "#8b8fa8",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: 16,
            paddingBottom: 10,
            borderBottom: "1px solid #f0f2f8",
          }}
        >
          Informations du compte
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: 14,
          }}
        >
          {/* Email */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: "#4a4e6a" }}>
              Email *
            </label>
            <input
              type="email"
              placeholder="user@rh.com"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              style={{
                fontSize: 13,
                border: `1px solid ${errors.email ? "#fca5a5" : "#e0e3ec"}`,
                borderRadius: 8,
                padding: "9px 12px",
                background: "#f8f9fc",
                color: "#1a1a2e",
                outline: "none",
                width: "100%",
                boxSizing: "border-box",
              }}
            />
            {errors.email && (
              <span style={{ fontSize: 11, color: "#991b1b" }}>
                {errors.email}
              </span>
            )}
          </div>

          {/* Rôle */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: "#4a4e6a" }}>
              Rôle *
            </label>
            <select
              value={form.role}
              onChange={(e) => handleChange("role", e.target.value)}
              style={{
                fontSize: 13,
                border: "1px solid #e0e3ec",
                borderRadius: 8,
                padding: "9px 12px",
                background: "#f8f9fc",
                color: "#1a1a2e",
                outline: "none",
                cursor: "pointer",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              <option value="rh">👤 RH</option>
              <option value="admin">🔑 Admin</option>
            </select>
          </div>

          {/* Password - pleine largeur sur mobile */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 5,
              gridColumn: isMobile ? "1 / -1" : "1 / -1",
            }}
          >
            <label style={{ fontSize: 12, fontWeight: 500, color: "#4a4e6a" }}>
              Mot de passe {isEdit ? "(laisser vide pour ne pas changer)" : "*"}
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              style={{
                fontSize: 13,
                border: `1px solid ${errors.password ? "#fca5a5" : "#e0e3ec"}`,
                borderRadius: 8,
                padding: "9px 12px",
                background: "#f8f9fc",
                color: "#1a1a2e",
                outline: "none",
                width: "100%",
                maxWidth: isMobile ? "100%" : "50%",
                boxSizing: "border-box",
              }}
            />
            {errors.password && (
              <span style={{ fontSize: 11, color: "#991b1b" }}>
                {errors.password}
              </span>
            )}
          </div>
        </div>

        {/* ✅ Buttons responsive */}
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: 10,
            marginTop: 20,
            paddingTop: 16,
            borderTop: "1px solid #f0f2f8",
          }}
        >
          <button
            onClick={handleSubmit}
            disabled={saving}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: isMobile ? "12px 20px" : "9px 20px",
              fontSize: 12,
              fontWeight: 500,
              borderRadius: 8,
              border: "none",
              background: saving ? "#f0f2f8" : "#e84393",
              color: saving ? "#8b8fa8" : "white",
              cursor: saving ? "not-allowed" : "pointer",
              width: isMobile ? "100%" : "auto",
              transition: "all 0.15s",
            }}
          >
            {saving ? <SaveIconGray /> : <SaveIcon />}
            {saving
              ? "Sauvegarde..."
              : isEdit
                ? "Enregistrer les modifications"
                : "Créer le compte"}
          </button>
          <button
            onClick={handleNavigateBack}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: isMobile ? "12px 20px" : "9px 20px",
              fontSize: 12,
              borderRadius: 8,
              border: "1px solid #e0e3ec",
              background: "white",
              color: "#4a4e6a",
              cursor: "pointer",
              width: isMobile ? "100%" : "auto",
              transition: "all 0.15s",
            }}
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
