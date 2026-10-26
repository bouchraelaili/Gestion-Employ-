import { useState, useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Email ou mot de passe incorrect.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .login-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f0f2f8;
          padding: 16px;
          box-sizing: border-box;
        }

        .login-card {
          display: flex;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,.15);
          width: 100%;
          max-width: 860px;
          min-height: 520px;
        }

        .login-left {
          flex: 1;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px;
          position: relative;
          overflow: hidden;
        }

        .login-right {
          width: 380px;
          min-width: 0;
          background: white;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 40px 36px;
          box-sizing: border-box;
        }

        /* ✅ TABLET: shrink left panel */
        @media (max-width: 768px) {
          .login-card {
            max-width: 600px;
          }
          .login-left {
            padding: 32px 24px;
            flex: 0 0 200px;
          }
          .login-right {
            width: auto;
            flex: 1;
            padding: 32px 24px;
          }
          .login-features {
            display: none;
          }
        }

        /* ✅ MOBILE: hide left panel entirely */
        @media (max-width: 640px) {
          .login-card {
            flex-direction: column;
            min-height: unset;
            max-width: 400px;
          }
          .login-left {
            display: none;
          }
          .login-right {
            width: 100%;
            padding: 32px 24px;
          }
          .login-logo-row {
            display: flex !important;
          }
        }

        /* ✅ VERY SMALL: full width */
        @media (max-width: 400px) {
          .login-wrapper {
            padding: 8px;
          }
          .login-card {
            border-radius: 12px;
          }
          .login-right {
            padding: 24px 16px;
          }
        }

        .login-input {
          font-size: 13px;
          border: 1px solid #e0e3ec;
          border-radius: 10px;
          padding: 11px 14px;
          background: #f8f9fc;
          color: #1a1a2e;
          outline: none;
          width: 100%;
          box-sizing: border-box;
          font-family: inherit;
        }
        .login-input:focus {
          border-color: #e84393;
          background: #fff;
        }

        .login-btn {
          width: 100%;
          padding: 12px 0;
          margin-top: 4px;
          font-size: 13px;
          font-weight: 600;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-family: inherit;
          transition: opacity 0.15s;
        }
        .login-btn:not(:disabled):hover {
          opacity: 0.9;
        }
      `}</style>

      <div className="login-wrapper">
        <div className="login-card">
          {/* ── Left dark panel ── */}
          <div className="login-left">
            {/* Decorative circles */}
            <div
              style={{
                position: "absolute",
                width: 320,
                height: 320,
                borderRadius: "50%",
                background: "rgba(232,67,147,.07)",
                top: -90,
                right: -90,
              }}
            />
            <div
              style={{
                position: "absolute",
                width: 220,
                height: 220,
                borderRadius: "50%",
                background: "rgba(232,67,147,.05)",
                bottom: -70,
                left: -70,
              }}
            />
            <div
              style={{
                position: "absolute",
                width: 100,
                height: 100,
                borderRadius: "50%",
                background: "rgba(232,67,147,.08)",
                bottom: 80,
                right: 40,
              }}
            />

            {/* Logo */}
            <div
              style={{
                width: 60,
                height: 60,
                background: "#e84393",
                borderRadius: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 28,
                boxShadow: "0 8px 24px rgba(232,67,147,.4)",
                position: "relative",
                zIndex: 1,
              }}
            >
              <svg viewBox="0 0 24 24" width={28} height={28} fill="white">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
              </svg>
            </div>

            <div
              style={{ textAlign: "center", position: "relative", zIndex: 1 }}
            >
              <h1
                style={{
                  fontSize: 26,
                  fontWeight: 600,
                  color: "white",
                  marginBottom: 10,
                  margin: "0 0 10px",
                }}
              >
                RH Manager
              </h1>
              <p
                style={{
                  fontSize: 14,
                  color: "rgba(255,255,255,.55)",
                  lineHeight: 1.6,
                  maxWidth: 260,
                  margin: 0,
                }}
              >
                Plateforme intelligente de gestion des ressources humaines avec
                analyse prédictive ML
              </p>
            </div>

            {/* Feature pills */}
            <div
              className="login-features"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                marginTop: 36,
                position: "relative",
                zIndex: 1,
              }}
            >
              {[
                { icon: "📊", text: "Dashboard analytique" },
                { icon: "🤖", text: "Prédiction IA de départ" },
                { icon: "📁", text: "Export Excel & PDF" },
              ].map((f) => (
                <div
                  key={f.text}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: "rgba(255,255,255,.06)",
                    borderRadius: 10,
                    padding: "8px 14px",
                    border: "1px solid rgba(255,255,255,.08)",
                  }}
                >
                  <span style={{ fontSize: 16 }}>{f.icon}</span>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,.7)" }}>
                    {f.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right form panel ── */}
          <div className="login-right">
            {/* Logo row (visible on mobile / hidden on desktop) */}
            <div
              className="login-logo-row"
              style={{
                display: "none",
                alignItems: "center",
                gap: 10,
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  background: "#e84393",
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg viewBox="0 0 24 24" width={18} height={18} fill="white">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <div>
                <div
                  style={{ fontSize: 14, fontWeight: 600, color: "#1a1a2e" }}
                >
                  RH Manager
                </div>
                <div style={{ fontSize: 10, color: "#8b8fa8" }}>
                  Espace de connexion
                </div>
              </div>
            </div>

            <h2
              style={{
                fontSize: 22,
                fontWeight: 600,
                color: "#1a1a2e",
                margin: "0 0 6px",
              }}
            >
              Connexion
            </h2>
            <p style={{ fontSize: 13, color: "#8b8fa8", margin: "0 0 28px" }}>
              Accédez à votre espace de gestion RH
            </p>

            {/* Error */}
            {error && (
              <div
                style={{
                  background: "#fee2e2",
                  border: "1px solid #fca5a5",
                  borderRadius: 8,
                  padding: "10px 14px",
                  fontSize: 12,
                  color: "#991b1b",
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  width={14}
                  height={14}
                  fill="#991b1b"
                  style={{ flexShrink: 0 }}
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              {/* Email */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label
                  style={{ fontSize: 12, fontWeight: 500, color: "#4a4e6a" }}
                >
                  Adresse email
                </label>
                <input
                  className="login-input"
                  type="email"
                  placeholder="admin@rh.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              {/* Password */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label
                  style={{ fontSize: 12, fontWeight: 500, color: "#4a4e6a" }}
                >
                  Mot de passe
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    className="login-input"
                    type={showPwd ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    style={{ paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((p) => !p)}
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                    }}
                    aria-label={
                      showPwd
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
                    }
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width={16}
                      height={16}
                      fill="#8b8fa8"
                    >
                      {showPwd ? (
                        <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                      ) : (
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="login-btn"
                style={{
                  background: loading ? "#f0f2f8" : "#e84393",
                  color: loading ? "#8b8fa8" : "white",
                  cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: loading
                    ? "none"
                    : "0 4px 14px rgba(232,67,147,.35)",
                }}
              >
                {loading ? (
                  <>
                    <svg
                      viewBox="0 0 24 24"
                      width={14}
                      height={14}
                      fill="#8b8fa8"
                      style={{ animation: "spin 1s linear infinite" }}
                    >
                      <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0 0 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 0 0 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" />
                    </svg>
                    Connexion en cours...
                  </>
                ) : (
                  "Se connecter"
                )}
              </button>
            </form>

            {/* Demo hint */}
            <div
              style={{
                marginTop: 24,
                padding: "10px 14px",
                background: "#f8f9fc",
                borderRadius: 8,
                border: "1px solid #e8eaf0",
              }}
            >
              <div style={{ fontSize: 11, color: "#8b8fa8", marginBottom: 4 }}>
                Comptes de test :
              </div>
              <div style={{ fontSize: 11, color: "#4a4e6a" }}>
                <span style={{ fontWeight: 500 }}>Admin :</span> admin@rh.com /
                admin123
              </div>
              <div style={{ fontSize: 11, color: "#4a4e6a" }}>
                <span style={{ fontWeight: 500 }}>RH :</span> rh@rh.com / rh123
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
