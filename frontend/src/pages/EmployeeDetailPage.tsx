import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { employeeService } from "../services/employeeService";
import type { Employee } from "../types";

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [emp, setEmp] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);

  useEffect(() => {
    if (!id) return;
    employeeService
      .getById(Number(id))
      .then(setEmp)
      .catch(() => navigate("/employees"))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePredict = async () => {
    if (!emp) return;
    setPredicting(true);
    try {
      const payload = {
        employee_id: emp.id,
        age: emp.age,
        anciennete: getAncienneteYears(emp.date_embauche),
        salaire: emp.salaire,
        absences: emp.absences ?? 0,
        score_performance: emp.score_performance ?? 50,
        category_id: emp.category_id,
        poste_id: emp.poste_id,
      };

      console.log("📤 Payload envoyé:", payload);

      const res = await employeeService.predict(payload);

      const risque = res.risque_depart ?? res.risque ?? false;

      setEmp((prev) => (prev ? { ...prev, risque_depart: risque } : prev));

      alert(
        risque ? "⚠️ Risque élevé de départ détecté !" : "✅ Employé stable",
      );
    } catch (err) {
      console.error("❌ Erreur prédiction:", err);
      alert("Erreur lors de la prédiction");
    } finally {
      setPredicting(false);
    }
  };

  const getAncienneteYears = (date: string) => {
    const ms = Date.now() - new Date(date).getTime();
    return Math.floor(ms / (1000 * 60 * 60 * 24 * 365));
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR");
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "#0f6e56";
    if (score >= 50) return "#d97706";
    return "#991b1b";
  };

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
        <div style={{ fontSize: 13, color: "#8b8fa8" }}>
          Chargement de la fiche...
        </div>
      </div>
    );
  }

  if (!emp) return null;

  const anciennete = getAncienneteYears(emp.date_embauche);
  const score = emp.score_performance ?? 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Banner */}
      <div
        style={{
          background: "linear-gradient(135deg,#1a1a2e 0%,#16213e 100%)",
          borderRadius: 14,
          padding: "22px 24px",
          display: "flex",
          alignItems: "center",
          gap: 18,
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "#e84393",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            fontWeight: 500,
            color: "white",
            flexShrink: 0,
            border: "3px solid rgba(255,255,255,.2)",
          }}
        >
          {emp.prenom[0]}
          {emp.nom[0]}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 500, color: "white" }}>
            {emp.prenom} {emp.nom}
          </div>
          <div
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,.55)",
              marginTop: 3,
            }}
          >
            {emp.poste_nom || "—"} · {emp.category_nom}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => navigate(`/employees/${emp.id}/edit`)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              fontSize: 12,
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,.2)",
              background: "rgba(255,255,255,.1)",
              color: "white",
              cursor: "pointer",
            }}
          >
            <svg viewBox="0 0 24 24" width={13} height={13} fill="white">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
            </svg>
            Modifier
          </button>
          <span
            style={{
              background: emp.risque_depart
                ? "rgba(232,67,147,.2)"
                : "rgba(255,255,255,.15)",
              color: "white",
              fontSize: 12,
              fontWeight: 500,
              padding: "7px 16px",
              borderRadius: 20,
              border: `1px solid ${emp.risque_depart ? "rgba(232,67,147,.4)" : "rgba(255,255,255,.25)"}`,
            }}
          >
            {emp.risque_depart ? "⚠ Risque de départ" : "✓ Employé stable"}
          </span>
        </div>
      </div>

      {/* 4 cards grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {/* Infos personnelles */}
        <div
          style={{
            background: "white",
            border: "1px solid #e8eaf0",
            borderRadius: 14,
            padding: 16,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: "#8b8fa8",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              marginBottom: 12,
              paddingBottom: 8,
              borderBottom: "1px solid #f0f2f8",
            }}
          >
            Informations personnelles
          </div>
          {[
            ["Nom complet", `${emp.prenom} ${emp.nom}`],
            ["Âge", `${emp.age} ans`],
            ["Sexe", emp.sexe === "M" ? "Masculin" : "Féminin"],
          ].map(([label, val]) => (
            <div
              key={label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "6px 0",
                borderBottom: "1px solid #f5f6fa",
                fontSize: 12,
              }}
            >
              <span style={{ color: "#8b8fa8" }}>{label}</span>
              <span style={{ fontWeight: 500, color: "#1a1a2e" }}>{val}</span>
            </div>
          ))}
        </div>

        {/* Infos professionnelles */}
        <div
          style={{
            background: "white",
            border: "1px solid #e8eaf0",
            borderRadius: 14,
            padding: 16,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: "#8b8fa8",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              marginBottom: 12,
              paddingBottom: 8,
              borderBottom: "1px solid #f0f2f8",
            }}
          >
            Informations professionnelles
          </div>
          {[
            ["Catégorie", emp.category_nom],
            ["Poste", emp.poste_nom || "—"],
            ["Date d'embauche", formatDate(emp.date_embauche)],
            ["Ancienneté", `${anciennete} ans`],
            [
              "Salaire",
              emp.salaire
                ? `${Number(emp.salaire).toLocaleString("fr-MA")} MAD`
                : "—",
            ],
          ].map(([label, val]) => (
            <div
              key={label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "6px 0",
                borderBottom: "1px solid #f5f6fa",
                fontSize: 12,
              }}
            >
              <span style={{ color: "#8b8fa8" }}>{label}</span>
              <span
                style={{
                  fontWeight: 500,
                  color: label === "Salaire" ? "#0f6e56" : "#1a1a2e",
                }}
              >
                {label === "Catégorie" ? (
                  <span
                    style={{
                      background: "#fce4f0",
                      color: "#c73380",
                      padding: "2px 8px",
                      borderRadius: 20,
                      fontSize: 10,
                    }}
                  >
                    {val}
                  </span>
                ) : (
                  val
                )}
              </span>
            </div>
          ))}
        </div>

        {/* Performance */}
        <div
          style={{
            background: "white",
            border: "1px solid #e8eaf0",
            borderRadius: 14,
            padding: 16,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: "#8b8fa8",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              marginBottom: 12,
              paddingBottom: 8,
              borderBottom: "1px solid #f0f2f8",
            }}
          >
            Indicateurs de performance
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "6px 0",
              borderBottom: "1px solid #f5f6fa",
              fontSize: 12,
            }}
          >
            <span style={{ color: "#8b8fa8" }}>Absences / an</span>
            <span
              style={{
                fontWeight: 500,
                color: (emp.absences ?? 0) > 10 ? "#991b1b" : "#0f6e56",
              }}
            >
              {emp.absences ?? 0} jours
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "6px 0",
              borderBottom: "1px solid #f5f6fa",
              fontSize: 12,
            }}
          >
            <span style={{ color: "#8b8fa8" }}>Score performance</span>
            <span style={{ fontWeight: 500, color: getScoreColor(score) }}>
              {score} / 100
            </span>
          </div>
          <div style={{ marginTop: 12 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 11,
                color: "#8b8fa8",
                marginBottom: 6,
              }}
            >
              <span>Score global</span>
              <span>{score}%</span>
            </div>
            <div
              style={{
                height: 6,
                background: "#f0f2f8",
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${score}%`,
                  height: "100%",
                  borderRadius: 3,
                  background: "#e84393",
                  transition: "width 0.8s ease",
                }}
              />
            </div>
          </div>
        </div>

        {/* ML Result */}
        <div
          style={{
            background: "white",
            border: `1px solid ${emp.risque_depart ? "#fca5a5" : "#86efac"}`,
            borderRadius: 14,
            padding: 20,
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: emp.risque_depart ? "#fee2e2" : "#e0f7f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 10px",
            }}
          >
            {emp.risque_depart ? (
              <svg viewBox="0 0 24 24" fill="#991b1b" width={24} height={24}>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="#0f6e56" width={24} height={24}>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            )}
          </div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 500,
              color: emp.risque_depart ? "#991b1b" : "#065f46",
              marginBottom: 6,
            }}
          >
            {emp.risque_depart ? "Risque de départ" : "Employé stable"}
          </div>
          <div
            style={{
              fontSize: 12,
              color: emp.risque_depart ? "#e84393" : "#0f6e56",
              marginBottom: 16,
            }}
          >
            {emp.risque_depart
              ? "Random Forest prédit un risque élevé de départ."
              : "Random Forest prédit un faible risque de départ."}
          </div>
          <button
            onClick={handlePredict}
            disabled={predicting}
            style={{
              width: "100%",
              padding: "10px 0",
              fontSize: 12,
              fontWeight: 500,
              borderRadius: 8,
              border: "none",
              background: "#e84393",
              color: "white",
              cursor: predicting ? "not-allowed" : "pointer",
              opacity: predicting ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            {predicting ? "Analyse en cours..." : "Relancer prédiction ML"}
          </button>
        </div>
      </div>

      {/* Back button */}
      <div>
        <button
          onClick={() => navigate("/employees")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 14px",
            fontSize: 12,
            borderRadius: 8,
            border: "1px solid #e0e3ec",
            background: "white",
            color: "#4a4e6a",
            cursor: "pointer",
          }}
        >
          <svg viewBox="0 0 24 24" width={13} height={13} fill="#4a4e6a">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
          Retour à la liste
        </button>
      </div>
    </div>
  );
}
