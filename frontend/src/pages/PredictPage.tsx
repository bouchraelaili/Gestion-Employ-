import { useState, useEffect, useCallback, memo } from "react";
import api from "../services/api";

interface Employee {
  id: number;
  nom: string;
  prenom: string;
  age: number;
  anciennete: number;
  salaire: number;
  absences: number;
  score_performance: number;
  poste_nom: string;
  categorie_nom: string;
  category_id: number;
  poste_id: number;
}

interface PredictionResult {
  risque: boolean;
  pourcentage: number;
  facteurs: string[];
  recommandations: string[];
  ml_used: boolean;
  ml_score: number | null;
  employee?: {
    id: number;
    nom: string;
    prenom: string;
    poste_nom: string;
  };
}

const RefreshIcon = memo(() => (
  <svg viewBox="0 0 24 24" width={13} height={13} fill="white">
    <path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z" />
  </svg>
));

const AnalyzeIcon = memo(() => (
  <svg viewBox="0 0 24 24" width={16} height={16} fill="white">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
));

const Spinner = memo(() => (
  <div
    style={{
      width: 16,
      height: 16,
      border: "2px solid #e0e3ec",
      borderTopColor: "#8b8fa8",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
    }}
  />
));

export default function PredictPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState("");
  const [modelInfo, setModelInfo] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    Promise.all([api.get("/employees"), api.get("/predict/info")])
      .then(([empRes, infoRes]) => {
        setEmployees(empRes.data);
        setModelInfo(infoRes.data);
      })
      .catch(() => setError("Erreur chargement données"))
      .finally(() => setLoadingList(false));
  }, []);

  const handlePredict = useCallback(async () => {
    if (!selectedEmp) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await api.post("/predict", { employee_id: selectedEmp.id });
      setResult(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Erreur lors de la prédiction");
    } finally {
      setLoading(false);
    }
  }, [selectedEmp]);

  const handleTrain = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.post("/predict/train", {});
      alert(res.data.message);
      const info = await api.get("/predict/info");
      setModelInfo(info.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Erreur entraînement");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelectChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const emp = employees.find((emp) => emp.id === Number(e.target.value));
      setSelectedEmp(emp || null);
      setResult(null);
      setError("");
    },
    [employees],
  );

  const getRiskStyle = (pct: number) => {
    if (pct >= 70)
      return {
        bg: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
        color: "#991b1b",
        label: "🔴 Risque élevé",
        bar: "#ef4444",
      };
    if (pct >= 40)
      return {
        bg: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
        color: "#92400e",
        label: "🟡 Risque moyen",
        bar: "#f59e0b",
      };
    return {
      bg: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
      color: "#065f46",
      label: "🟢 Risque faible",
      bar: "#10b981",
    };
  };

  const cardStyle = {
    background: "white",
    borderRadius: 14,
    padding: isMobile ? 14 : 20,
    border: "1px solid #e8eaf0",
  };

  const sectionTitle = (t: string) => (
    <div
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: "#8b8fa8",
        textTransform: "uppercase" as const,
        letterSpacing: "0.08em",
        marginBottom: 14,
        paddingBottom: 10,
        borderBottom: "1px solid #f0f2f8",
      }}
    >
      {t}
    </div>
  );

  if (loadingList) {
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
          gap: isMobile ? 12 : 0,
        }}
      >
        <div>
          <div
            style={{
              fontSize: isMobile ? 15 : 16,
              fontWeight: 500,
              color: "white",
            }}
          >
            Prédiction ML
          </div>
          <div
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,.55)",
              marginTop: 4,
            }}
          >
            {modelInfo?.is_trained
              ? `Modèle ${modelInfo.model_type} actif`
              : "Modèle non entraîné — Logique métier uniquement"}
          </div>
        </div>
        <button
          onClick={handleTrain}
          disabled={loading}
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
            flexShrink: 0,
            width: isMobile ? "100%" : "auto",
          }}
        >
          <RefreshIcon />
          Réentraîner le modèle
        </button>
      </div>

      {/* ✅ Grid responsive : 1 colonne sur mobile */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1.5fr",
          gap: 16,
        }}
      >
        {/* Panel gauche */}
        <div style={cardStyle}>
          {sectionTitle("Sélectionner un employé")}

          <select
            value={selectedEmp?.id || ""}
            onChange={handleSelectChange}
            style={{
              fontSize: 13,
              border: "1px solid #e0e3ec",
              borderRadius: 8,
              padding: "10px 12px",
              background: "#f8f9fc",
              color: "#1a1a2e",
              outline: "none",
              width: "100%",
              cursor: "pointer",
            }}
          >
            <option value="">Choisir un employé...</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.prenom} {emp.nom} — {emp.poste_nom || emp.categorie_nom}
              </option>
            ))}
          </select>

          {selectedEmp && (
            <div style={{ marginTop: 16 }}>
              {sectionTitle("Profil de l'employé")}

              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {[
                  { label: "Âge", value: `${selectedEmp.age} ans`, icon: "🎂" },
                  {
                    label: "Ancienneté",
                    value: `${selectedEmp.anciennete} ans`,
                    icon: "⏱️",
                  },
                  {
                    label: "Salaire",
                    value: `${selectedEmp.salaire?.toLocaleString("fr-MA")} MAD`,
                    icon: "💰",
                  },
                  {
                    label: "Absences",
                    value: `${selectedEmp.absences} jours/an`,
                    icon: "📅",
                  },
                  {
                    label: "Performance",
                    value: `${selectedEmp.score_performance}/100`,
                    icon: "📊",
                  },
                  {
                    label: "Poste",
                    value: selectedEmp.poste_nom || "—",
                    icon: "💼",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: 12,
                      padding: "8px 10px",
                      background: "#f8f9fc",
                      borderRadius: 8,
                    }}
                  >
                    <span
                      style={{
                        color: "#8b8fa8",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      {item.icon} {item.label}
                    </span>
                    <span style={{ color: "#1a1a2e", fontWeight: 500 }}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={handlePredict}
                disabled={loading}
                style={{
                  marginTop: 16,
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "12px 16px",
                  fontSize: 13,
                  fontWeight: 600,
                  borderRadius: 10,
                  border: "none",
                  background: loading ? "#f0f2f8" : "#e84393",
                  color: loading ? "#8b8fa8" : "white",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                  boxShadow: loading
                    ? "none"
                    : "0 4px 12px rgba(232,67,147,.3)",
                }}
              >
                {loading ? (
                  <>
                    <Spinner />
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <AnalyzeIcon />
                    Analyser le risque de départ
                  </>
                )}
              </button>
            </div>
          )}

          {error && (
            <div
              style={{
                marginTop: 12,
                padding: 12,
                borderRadius: 8,
                background: "#fee2e2",
                color: "#991b1b",
                fontSize: 12,
                border: "1px solid #fca5a5",
              }}
            >
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Panel droit */}
        <div style={cardStyle}>
          {sectionTitle("Résultat de l'analyse")}

          {!result ? (
            <div
              style={{
                height: isMobile ? 200 : 300,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "#8b8fa8",
                fontSize: 13,
                gap: 12,
              }}
            >
              <div
                style={{
                  width: isMobile ? 48 : 64,
                  height: isMobile ? 48 : 64,
                  borderRadius: "50%",
                  background: "#f0f2f8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: isMobile ? 24 : 32,
                }}
              >
                🔮
              </div>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{ fontWeight: 500, color: "#4a4e6a", marginBottom: 4 }}
                >
                  En attente d'analyse
                </div>
                <div style={{ fontSize: 12 }}>
                  Sélectionnez un employé et cliquez sur
                  <br />
                  "Analyser le risque de départ"
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Score principal */}
              <div
                style={{
                  padding: isMobile ? 20 : 28,
                  borderRadius: 14,
                  background: getRiskStyle(result.pourcentage).bg,
                  textAlign: "center",
                  border: `2px solid ${getRiskStyle(result.pourcentage).bar}20`,
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: getRiskStyle(result.pourcentage).color,
                    marginBottom: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    flexWrap: "wrap",
                  }}
                >
                  {getRiskStyle(result.pourcentage).label}
                  {result.ml_used && (
                    <span
                      style={{
                        fontSize: 10,
                        padding: "2px 8px",
                        background: "rgba(255,255,255,.5)",
                        borderRadius: 20,
                      }}
                    >
                      🤖 ML
                    </span>
                  )}
                </div>

                <div
                  style={{
                    fontSize: isMobile ? 40 : 52,
                    fontWeight: 700,
                    color: getRiskStyle(result.pourcentage).color,
                    lineHeight: 1,
                  }}
                >
                  {result.pourcentage}%
                </div>

                {/* Barre de progression */}
                <div style={{ marginTop: 16 }}>
                  <div
                    style={{
                      height: 8,
                      background: "rgba(0,0,0,.08)",
                      borderRadius: 4,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${result.pourcentage}%`,
                        height: "100%",
                        borderRadius: 4,
                        background: getRiskStyle(result.pourcentage).bar,
                        transition: "width 1s ease-out",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 10,
                      color: getRiskStyle(result.pourcentage).color,
                      marginTop: 6,
                      opacity: 0.7,
                    }}
                  >
                    <span>0% Stable</span>
                    <span>100% Risque</span>
                  </div>
                </div>
              </div>

              {/* Facteurs clés */}
              {result.facteurs?.length > 0 && (
                <div>
                  {sectionTitle("⚠️ Facteurs de risque identifiés")}
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {result.facteurs.map((f, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "10px 14px",
                          background: "#fef2f2",
                          borderRadius: 8,
                          fontSize: 12,
                          color: "#991b1b",
                          borderLeft: "3px solid #ef4444",
                        }}
                      >
                        <span style={{ fontSize: 14 }}>🔴</span>
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommandations */}
              {result.recommandations?.length > 0 && (
                <div>
                  {sectionTitle("💡 Recommandations RH")}
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {result.recommandations.map((r, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "10px 14px",
                          background: "#ecfdf5",
                          borderRadius: 8,
                          fontSize: 12,
                          color: "#065f46",
                          borderLeft: "3px solid #10b981",
                        }}
                      >
                        <span style={{ fontSize: 14 }}>💡</span>
                        {r}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Détails technique */}
              {result.ml_score && (
                <div
                  style={{
                    padding: 10,
                    background: "#f8f9fc",
                    borderRadius: 8,
                    fontSize: 11,
                    color: "#8b8fa8",
                    textAlign: "center",
                  }}
                >
                  Score brut ML: {result.ml_score}% | Score logique métier
                  ajusté: {result.pourcentage}%
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
