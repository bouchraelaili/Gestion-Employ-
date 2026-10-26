import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import type { DashboardStats } from "../types";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  type ChartOptions,
  type TooltipModel,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip);

const BAR_COLORS = ["#e84393", "#ff6b9d", "#4a4e6a", "#1a1a2e", "#8b8fa8"];
const DONUT_COLORS = ["#e84393", "#0f6e56", "#4a4e6a", "#d97706", "#7c3aed"];

const BP_MOBILE = 768;
const BP_TABLET = 1024;


function useBreakpoints() {
  const [w, setW] = useState(BP_TABLET + 1); 

  useEffect(() => {
    setW(window.innerWidth);

    const handle = () => setW(window.innerWidth);
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  return { isMobile: w < BP_MOBILE, isTablet: w < BP_TABLET };
}

/* ── Shared tooltip singleton ── */
function getOrCreateTip(): HTMLDivElement {
  let el = document.getElementById("dash-tip") as HTMLDivElement | null;
  if (!el) {
    el = document.createElement("div");
    el.id = "dash-tip";
    Object.assign(el.style, {
      position: "fixed",
      background: "white",
      border: "1px solid #e8eaf0",
      borderRadius: "8px",
      padding: "7px 10px",
      fontSize: "12px",
      color: "#1a1a2e",
      pointerEvents: "none",
      opacity: "0",
      transition: "opacity .12s",
      boxShadow: "0 2px 8px rgba(0,0,0,.1)",
      zIndex: "9999",
      lineHeight: "1.5",
    });
    document.body.appendChild(el);
  }
  return el;
}

function externalTooltip(
  context: { chart: ChartJS; tooltip: TooltipModel<"bar" | "doughnut"> },
  format: (dp: { raw: unknown; label: string }) => string,
) {
  const el = getOrCreateTip();
  const { chart, tooltip } = context;
  if (tooltip.opacity === 0) {
    el.style.opacity = "0";
    return;
  }
  const dp = tooltip.dataPoints?.[0];
  if (!dp) return;
  const pos = chart.canvas.getBoundingClientRect();
  el.innerHTML = format({ raw: dp.raw, label: dp.label });
  el.style.left = `${pos.left + tooltip.caretX + 14}px`;
  el.style.top = `${pos.top + tooltip.caretY - 32}px`;
  el.style.opacity = "1";
}

/* ── Cleanup tooltip on unmount ── */
function useTooltipCleanup() {
  useEffect(
    () => () => {
      document.getElementById("dash-tip")?.remove();
    },
    [],
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { isMobile, isTablet } = useBreakpoints();
  useTooltipCleanup();

  useEffect(() => {
    api
      .get("/dashboard")
      .then((r) => setStats(r.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Bonjour";
    if (h < 18) return "Bon après-midi";
    return "Bonsoir";
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
          Chargement du dashboard...
        </div>
      </div>
    );
  }

  const s = {
    total_employees: stats?.total_employes || 0,
    risque_count: stats?.total_risque_depart || 0,
    taux_absenteisme: stats?.taux_absenteisme || 0,
    anciennete_moyenne: stats?.anciennete_moyenne || 0,
    categories: stats?.repartition_categorie || [],
    salary_by_category: stats?.salaire_par_categorie || [],
    recent_at_risk: stats?.employes_risque || [],
  };

  const risquePct =
    s.total_employees > 0
      ? Math.round((s.risque_count / s.total_employees) * 100)
      : 0;
  const totalCats = s.categories.reduce(
    (acc, c) => acc + (c.total || c.count || 0),
    0,
  );

  /* ── KPI cards ── */
  const kpiCards = [
    {
      label: "Total employés",
      value: s.total_employees,
      icon: "👥",
      bg: "#fce4f0",
      color: "#e84393",
      trend: "+2 ce mois",
    },
    {
      label: "Employés à risque",
      value: s.risque_count,
      icon: "⚠️",
      bg: "#fee2e2",
      color: "#991b1b",
      trend: `${risquePct}% du total`,
    },
    {
      label: "Taux d'absentéisme",
      value: stats?.taux_absenteisme ? `${stats.taux_absenteisme}%` : "—",
      icon: "📅",
      bg: "#e0f7f0",
      color: "#0f6e56",
      trend: "Moyenne globale",
    },
    {
      label: "Ancienneté moyenne",
      value: stats?.anciennete_moyenne
        ? `${stats.anciennete_moyenne} ans`
        : "—",
      icon: "⏱️",
      bg: "#f1f0f8",
      color: "#4a4e6a",
      trend: "Années de service",
    },
  ];

  /* ── Bar chart ── */
  const barChartData = {
    labels: s.salary_by_category.map((c) => c.categorie?.split(" ")[0] ?? "—"),
    datasets: [
      {
        data: s.salary_by_category.map((c) => Number(c.salaire_moyen) || 0),
        backgroundColor: s.salary_by_category.map(
          (_, i) => BAR_COLORS[i % BAR_COLORS.length],
        ),
        hoverBackgroundColor: s.salary_by_category.map(
          (_, i) => BAR_COLORS[i % BAR_COLORS.length],
        ),
        borderRadius: 6,
        borderSkipped: false as const,
        borderWidth: 0,
      },
    ],
  };

  const barOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1200, easing: "easeOutQuart" },
    layout: { padding: { top: 20 } },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: false,
        external: (ctx) =>
          externalTooltip(
            ctx as Parameters<typeof externalTooltip>[0],
            ({ raw, label }) => {
              const fullCat =
                s.salary_by_category.find(
                  (c) => (c.categorie?.split(" ")[0] ?? "—") === label,
                )?.categorie ?? label;
              return `<strong>${fullCat}</strong><br>${Math.round(Number(raw) / 1000)}k MAD`;
            },
          ),
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: "#8b8fa8", font: { size: 11 }, maxRotation: 0 },
      },
      y: {
        beginAtZero: true,
        grid: { display: false },
        border: { display: false },
        ticks: {
          color: "#b0b4c3",
          font: { size: 10 },
          callback: (v) => `${Math.round(Number(v) / 1000)}k`,
          maxTicksLimit: 4,
        },
      },
    },
  };

  /* ── Donut chart ── */
  const donutChartData = {
    labels: s.categories.map((c) => c.categorie || c.categorie || "—"),
    datasets: [
      {
        data: s.categories.map((c) => c.total || c.count || 0),
        backgroundColor: s.categories.map(
          (_, i) => DONUT_COLORS[i % DONUT_COLORS.length],
        ),
        hoverBackgroundColor: s.categories.map(
          (_, i) => DONUT_COLORS[i % DONUT_COLORS.length],
        ),
        borderWidth: 2,
        borderColor: "#ffffff",
        hoverOffset: 5,
      },
    ],
  };

  const donutOptions: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: false,
        external: (ctx) =>
          externalTooltip(
            ctx as Parameters<typeof externalTooltip>[0],
            ({ raw, label }) => {
              const pct =
                totalCats > 0 ? Math.round((Number(raw) / totalCats) * 100) : 0;
              return `<strong>${label}</strong><br>${raw} employés · ${pct}%`;
            },
          ),
      },
    },
  };

  /* ── Layout helpers ── */
  const kpiCols = isMobile || isTablet ? "repeat(2,1fr)" : "repeat(4,1fr)";
  const chartCols = isMobile || isTablet ? "1fr" : "1.4fr 1fr";
  const donutLayout: React.CSSProperties = isMobile
    ? { flexDirection: "column", alignItems: "center" }
    : { flexDirection: "row", alignItems: "center" };

  /**
   * FIX 2 — Chart.js remount via `key`
   *
   * Chart.js capture les dimensions du canvas au montage. Sans remount,
   * il conserve les dimensions du premier rendu même si le conteneur a changé.
   * En changeant la `key` quand isMobile/isTablet change, React démonte et
   * remonte les charts, forçant Chart.js à recalculer les dimensions correctes.
   */
  const chartKey = `${isMobile}-${isTablet}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* ── Welcome banner ── */}
      <div
        style={{
          background: "linear-gradient(135deg,#1a1a2e 0%,#16213e 100%)",
          borderRadius: 14,
          padding: isMobile ? "16px" : "20px 24px",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "flex-start" : "center",
          justifyContent: "space-between",
          gap: isMobile ? 12 : 0,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 500,
              color: "white",
              marginBottom: 4,
            }}
          >
            {greeting()}, {user?.email?.split("@")[0] || "Admin"} 👋
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.55)" }}>
            {new Date().toLocaleDateString("fr-FR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={() => navigate("/employees/new")}
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
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
            Nouvel employé
          </button>
          <button
            onClick={() => navigate("/predict")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              fontSize: 12,
              borderRadius: 8,
              border: "1px solid rgba(232,67,147,.4)",
              background: "#e84393",
              color: "white",
              cursor: "pointer",
            }}
          >
            <svg viewBox="0 0 24 24" width={13} height={13} fill="white">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z" />
            </svg>
            Prédiction ML
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: kpiCols, gap: 12 }}>
        {kpiCards.map((kpi) => (
          <div
            key={kpi.label}
            style={{
              background: "white",
              borderRadius: 14,
              padding: isMobile ? 12 : 16,
              border: "1px solid #e8eaf0",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: kpi.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                }}
              >
                {kpi.icon}
              </div>
              <span style={{ fontSize: 11, color: kpi.color, fontWeight: 500 }}>
                →
              </span>
            </div>
            <div
              style={{
                fontSize: isMobile ? 22 : 26,
                fontWeight: 600,
                color: "#1a1a2e",
                marginBottom: 4,
              }}
            >
              {kpi.value}
            </div>
            <div style={{ fontSize: 12, color: "#8b8fa8", marginBottom: 6 }}>
              {kpi.label}
            </div>
            <div style={{ fontSize: 11, color: kpi.color }}>{kpi.trend}</div>
          </div>
        ))}
      </div>

      {/* ── Charts row ── */}
      <div style={{ display: "grid", gridTemplateColumns: chartCols, gap: 16 }}>
        {/* Bar chart */}
        <div
          style={{
            background: "white",
            borderRadius: 14,
            padding: 16,
            minHeight: 280,
            border: "1px solid #e8eaf0",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 500, color: "#1a1a2e" }}>
              Salaire moyen par catégorie
            </span>
            <button
              onClick={() => navigate("/employees")}
              style={{
                fontSize: 11,
                color: "#e84393",
                cursor: "pointer",
                padding: "4px 12px",
                borderRadius: 20,
                border: "1px solid #fce4f0",
                background: "#fdf2f8",
              }}
            >
              Voir tout
            </button>
          </div>
          {s.salary_by_category.length === 0 ? (
            <div
              style={{
                height: 200,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#8b8fa8",
                fontSize: 12,
              }}
            >
              Aucune donnée
            </div>
          ) : (
            <div style={{ height: 220 }}>
              {/* FIX 2 applied — key forces remount on breakpoint change */}
              <Bar
                key={`bar-${chartKey}`}
                data={barChartData}
                options={barOptions}
              />
            </div>
          )}
        </div>

        {/* Donut chart */}
        <div
          style={{
            background: "white",
            borderRadius: 14,
            padding: 16,
            border: "1px solid #e8eaf0",
            display: "flex",
            flexDirection: "column",
            minHeight: 280,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 500, color: "#1a1a2e" }}>
              Répartition par catégorie
            </span>
          </div>

          {s.categories.length === 0 ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#8b8fa8",
                fontSize: 12,
              }}
            >
              Aucune donnée
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                gap: 20,
                flex: 1,
                flexWrap: "wrap",
                justifyContent: "center",
                ...donutLayout,
              }}
            >
              {/* Donut + label centré */}
              <div
                style={{
                  position: "relative",
                  width: 130,
                  height: 130,
                  flexShrink: 0,
                }}
              >
                {/* FIX 2 applied — key forces remount on breakpoint change */}
                <Doughnut
                  key={`donut-${chartKey}`}
                  data={donutChartData}
                  options={donutOptions}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "none",
                  }}
                >
                  <span
                    style={{
                      fontSize: 20,
                      fontWeight: 600,
                      color: "#1a1a2e",
                      lineHeight: 1,
                    }}
                  >
                    {s.total_employees}
                  </span>
                  <span
                    style={{ fontSize: 10, color: "#8b8fa8", marginTop: 3 }}
                  >
                    employés
                  </span>
                </div>
              </div>

              {/* Légende */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 7,
                  flex: 1,
                  minWidth: 120,
                }}
              >
                {s.categories.map((cat, i) => {
                  const count = cat.total || cat.count || 0;
                  const pct =
                    totalCats > 0 ? Math.round((count / totalCats) * 100) : 0;
                  return (
                    <div
                      key={cat.categorie || i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 12,
                      }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: DONUT_COLORS[i % DONUT_COLORS.length],
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          flex: 1,
                          color: "#8b8fa8",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {cat.categorie}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: "#8b8fa8",
                          minWidth: 16,
                          textAlign: "right",
                        }}
                      >
                        {count}
                      </span>
                      <span
                        style={{
                          fontWeight: 500,
                          color: "#1a1a2e",
                          minWidth: 30,
                          textAlign: "right",
                        }}
                      >
                        {pct}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Table employés à risque ── */}
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
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 18px",
            borderBottom: "1px solid #f0f2f8",
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "#1a1a2e",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            Employés à risque
            {s.risque_count > 0 && (
              <span
                style={{
                  background: "#fee2e2",
                  color: "#991b1b",
                  fontSize: 10,
                  padding: "1px 7px",
                  borderRadius: 20,
                }}
              >
                {s.risque_count}
              </span>
            )}
          </span>
          <button
            onClick={() => navigate("/employees")}
            style={{
              fontSize: 11,
              color: "#e84393",
              cursor: "pointer",
              padding: "4px 12px",
              borderRadius: 20,
              border: "1px solid #fce4f0",
              background: "#fdf2f8",
            }}
          >
            Voir tous
          </button>
        </div>

        {s.recent_at_risk.length === 0 ? (
          <div
            style={{
              padding: "32px",
              textAlign: "center",
              color: "#8b8fa8",
              fontSize: 13,
            }}
          >
            ✅ Aucun employé à risque détecté
          </div>
        ) : isMobile ? (
          /* ── Mobile : cards ── */
          <div style={{ display: "flex", flexDirection: "column" }}>
            {s.recent_at_risk.slice(0, 5).map((emp, idx) => (
              <div
                key={emp.id}
                style={{
                  padding: "12px 16px",
                  borderBottom:
                    idx < Math.min(s.recent_at_risk.length, 5) - 1
                      ? "1px solid #f0f2f8"
                      : "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "#e84393",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "white",
                    flexShrink: 0,
                  }}
                >
                  {emp.prenom?.[0] || "?"}
                  {emp.nom?.[0] || "?"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{ fontSize: 13, fontWeight: 500, color: "#1a1a2e" }}
                  >
                    {emp.prenom} {emp.nom}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#8b8fa8",
                      marginTop: 2,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {emp.poste_nom || emp.poste_nom || "—"} · Score :{" "}
                    <span style={{ color: "#991b1b", fontWeight: 500 }}>
                      {emp.score_performance ?? "—"}/100
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/employees/${emp.id}`)}
                  style={{
                    fontSize: 11,
                    padding: "5px 10px",
                    borderRadius: 8,
                    border: "1px solid #e0e3ec",
                    background: "white",
                    color: "#4a4e6a",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  Voir
                </button>
              </div>
            ))}
          </div>
        ) : (
          /* ── Desktop : tableau ── */
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 560,
              }}
            >
              <thead>
                <tr>
                  {[
                    "Employé",
                    "Poste",
                    "Score",
                    "Absences",
                    "Salaire",
                    "Action",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 16px",
                        textAlign: "left",
                        fontSize: 11,
                        fontWeight: 500,
                        color: "#8b8fa8",
                        background: "#f8f9fc",
                        borderBottom: "1px solid #f0f2f8",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {s.recent_at_risk.slice(0, 5).map((emp) => (
                  <tr key={emp.id}>
                    <td style={{ padding: "12px 16px", fontSize: 12 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: "50%",
                            background: "#e84393",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 10,
                            fontWeight: 600,
                            color: "white",
                            flexShrink: 0,
                          }}
                        >
                          {emp.prenom?.[0] || "?"}
                          {emp.nom?.[0] || "?"}
                        </div>
                        <span style={{ fontWeight: 500, color: "#1a1a2e" }}>
                          {emp.prenom} {emp.nom}
                        </span>
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: 12,
                        color: "#4a4e6a",
                      }}
                    >
                      {emp.poste_nom || emp.poste_nom || "—"}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: 12,
                        color: "#991b1b",
                        fontWeight: 500,
                      }}
                    >
                      {emp.score_performance ?? "—"}/100
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: 12,
                        color: "#991b1b",
                      }}
                    >
                      {emp.absences ?? 0} j
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: 12,
                        color: "#0f6e56",
                        fontWeight: 500,
                      }}
                    >
                      {emp.salaire != null
                        ? `${Number(emp.salaire).toLocaleString("fr-DZ")} MAD`
                        : "—"}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <button
                        onClick={() => navigate(`/employees/${emp.id}`)}
                        style={{
                          fontSize: 11,
                          padding: "5px 12px",
                          borderRadius: 8,
                          border: "1px solid #e0e3ec",
                          background: "white",
                          color: "#4a4e6a",
                          cursor: "pointer",
                        }}
                      >
                        Voir fiche
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
