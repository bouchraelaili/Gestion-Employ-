import { useState, useEffect, useCallback, memo, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { employeeService } from "../services/employeeService";
import type { Employee } from "../types";

const categories = [
  "Tous",
  "Direction",
  "Technique",
  "Administratif",
  "Commercial",
  "Support",
];

const SearchIcon = memo(() => (
  <svg viewBox="0 0 24 24" width={14} height={14} fill="#8b8fa8">
    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
  </svg>
));

const AddIcon = memo(() => (
  <svg viewBox="0 0 24 24" width={13} height={13} fill="white">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
  </svg>
));

const ViewIcon = memo(() => (
  <svg viewBox="0 0 24 24" width={13} height={13} fill="#8b8fa8">
    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
  </svg>
));

const EditIcon = memo(() => (
  <svg viewBox="0 0 24 24" width={13} height={13} fill="#8b8fa8">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
  </svg>
));

const DeleteIcon = memo(() => (
  <svg viewBox="0 0 24 24" width={13} height={13} fill="#8b8fa8">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
  </svg>
));

export default function EmployeesPage() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("Tous");
  const [risqueFilter, setRisqueFilter] = useState("Tous");
  const [page, setPage] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const perPage = 10;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const data = await employeeService.getAll();
      setEmployees(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cet employé ?")) return;
    try {
      await employeeService.delete(id);
      setEmployees((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      alert("Erreur lors de la suppression");
    }
  };

  const filtered = employees.filter((e) => {
    const matchSearch =
      e.nom.toLowerCase().includes(search.toLowerCase()) ||
      e.prenom.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "Tous" || e.categorie_nom === catFilter;
    const matchRisque =
      risqueFilter === "Tous" ||
      (risqueFilter === "Risque" && e.risque_depart) ||
      (risqueFilter === "Stable" && !e.risque_depart);
    return matchSearch && matchCat && matchRisque;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const getAnciennete = (date: string) => {
    const diff = new Date().getFullYear() - new Date(date).getFullYear();
    return `${diff} ans`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "#0f6e56";
    if (score >= 50) return "#d97706";
    return "#991b1b";
  };

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
      setPage(1);
    },
    [],
  );

  const handleCatChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setCatFilter(e.target.value);
      setPage(1);
    },
    [],
  );

  const handleRisqueChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setRisqueFilter(e.target.value);
      setPage(1);
    },
    [],
  );

  const handleNavigateNew = useCallback(
    () => navigate("/employees/new"),
    [navigate],
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* ✅ Header responsive */}
      <div
        style={{
          display: "flex",
          alignItems: isMobile ? "stretch" : "center",
          gap: 10,
          flexWrap: "wrap",
          flexDirection: isMobile ? "column" : "row",
        }}
      >
        {/* Search */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            background: "white",
            border: "1px solid #e8eaf0",
            borderRadius: 8,
            padding: "7px 12px",
            flex: 1,
            minWidth: isMobile ? "100%" : 200,
            width: isMobile ? "100%" : "auto",
          }}
        >
          <SearchIcon />
          <input
            type="text"
            placeholder="Rechercher un employé..."
            value={search}
            onChange={handleSearchChange}
            style={{
              border: "none",
              background: "transparent",
              fontSize: 13,
              color: "#1a1a2e",
              outline: "none",
              width: "100%",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            width: isMobile ? "100%" : "auto",
          }}
        >
          <select
            value={catFilter}
            onChange={handleCatChange}
            style={{
              fontSize: 12,
              border: "1px solid #e8eaf0",
              borderRadius: 8,
              padding: "7px 10px",
              background: "white",
              color: "#4a4e6a",
              cursor: "pointer",
              flex: isMobile ? 1 : "none",
              minWidth: isMobile ? 0 : "auto",
            }}
          >
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          <select
            value={risqueFilter}
            onChange={handleRisqueChange}
            style={{
              fontSize: 12,
              border: "1px solid #e8eaf0",
              borderRadius: 8,
              padding: "7px 10px",
              background: "white",
              color: "#4a4e6a",
              cursor: "pointer",
              flex: isMobile ? 1 : "none",
              minWidth: isMobile ? 0 : "auto",
            }}
          >
            <option value="Tous">Tous les statuts</option>
            <option value="Risque">À risque</option>
            <option value="Stable">Stables</option>
          </select>
        </div>

        <button
          onClick={handleNavigateNew}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: isMobile ? "10px 16px" : "7px 16px",
            fontSize: 12,
            fontWeight: 500,
            borderRadius: 8,
            border: "none",
            background: "#e84393",
            color: "white",
            cursor: "pointer",
            width: isMobile ? "100%" : "auto",
          }}
        >
          <AddIcon />
          Ajouter
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
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 18px",
            borderBottom: "1px solid #f0f2f8",
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 500, color: "#1a1a2e" }}>
            Employés
            <span
              style={{
                marginLeft: 8,
                background: "#f0f2f8",
                color: "#4a4e6a",
                fontSize: 11,
                padding: "2px 8px",
                borderRadius: 20,
              }}
            >
              {filtered.length}
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
        ) : isMobile ? (
          <div style={{ padding: 12 }}>
            {paginated.length === 0 ? (
              <div
                style={{
                  padding: 32,
                  textAlign: "center",
                  color: "#8b8fa8",
                  fontSize: 13,
                }}
              >
                Aucun employé trouvé
              </div>
            ) : (
              paginated.map((emp) => (
                <EmployeeCard
                  key={emp.id}
                  emp={emp}
                  onView={() => navigate(`/employees/${emp.id}`)}
                  onEdit={() => navigate(`/employees/${emp.id}/edit`)}
                  onDelete={() => handleDelete(emp.id)}
                  getAnciennete={getAnciennete}
                  getScoreColor={getScoreColor}
                />
              ))
            )}
          </div>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              tableLayout: "fixed",
            }}
          >
            <thead>
              <tr>
                {[
                  "Employé",
                  "Catégorie / Poste",
                  "Ancienneté",
                  "Salaire",
                  "Absences",
                  "Score",
                  "Statut IA",
                  "Actions",
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
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      padding: 32,
                      textAlign: "center",
                      color: "#8b8fa8",
                      fontSize: 13,
                    }}
                  >
                    Aucun employé trouvé
                  </td>
                </tr>
              ) : (
                paginated.map((emp) => (
                  <TableRow
                    key={emp.id}
                    emp={emp}
                    onView={() => navigate(`/employees/${emp.id}`)}
                    onEdit={() => navigate(`/employees/${emp.id}/edit`)}
                    onDelete={() => handleDelete(emp.id)}
                    getAnciennete={getAnciennete}
                    getScoreColor={getScoreColor}
                  />
                ))
              )}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 18px",
              borderTop: "1px solid #f0f2f8",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <span style={{ fontSize: 12, color: "#8b8fa8" }}>
              {(page - 1) * perPage + 1}–
              {Math.min(page * perPage, filtered.length)} sur {filtered.length}
            </span>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  style={{
                    width: 30,
                    height: 30,
                    border: "1px solid #e8eaf0",
                    borderRadius: 8,
                    background: p === page ? "#e84393" : "white",
                    color: p === page ? "white" : "#4a4e6a",
                    borderColor: p === page ? "#e84393" : "#e8eaf0",
                    fontSize: 12,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface EmployeeCardProps {
  emp: Employee;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  getAnciennete: (date: string) => string;
  getScoreColor: (score: number) => string;
}

const EmployeeCard = memo(function EmployeeCard({
  emp,
  onView,
  onEdit,
  onDelete,
  getAnciennete,
  getScoreColor,
}: EmployeeCardProps) {
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
            background: "#e84393",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 600,
            color: "white",
            flexShrink: 0,
          }}
        >
          {emp.prenom[0]}
          {emp.nom[0]}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 500, fontSize: 14, color: "#1a1a2e" }}>
            {emp.prenom} {emp.nom}
          </div>
          <div style={{ fontSize: 12, color: "#8b8fa8" }}>
            {emp.poste_nom || "—"} · {emp.age} ans
          </div>
        </div>
        {emp.risque_depart ? (
          <span
            style={{
              padding: "3px 10px",
              borderRadius: 20,
              fontSize: 10,
              fontWeight: 500,
              background: "#fee2e2",
              color: "#991b1b",
              flexShrink: 0,
            }}
          >
            ⚠ Risque
          </span>
        ) : (
          <span
            style={{
              padding: "3px 10px",
              borderRadius: 20,
              fontSize: 10,
              fontWeight: 500,
              background: "#e0f7f0",
              color: "#0f6e56",
              flexShrink: 0,
            }}
          >
            ✓ Stable
          </span>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          marginBottom: 12,
          fontSize: 12,
        }}
      >
        <div>
          <div style={{ color: "#8b8fa8", fontSize: 11 }}>Catégorie</div>
          <span
            style={{
              padding: "2px 8px",
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 500,
              background: "#fce4f0",
              color: "#c73380",
            }}
          >
            {emp.categorie_nom}
          </span>
        </div>
        <div>
          <div style={{ color: "#8b8fa8", fontSize: 11 }}>Ancienneté</div>
          <div style={{ color: "#1a1a2e", fontWeight: 500 }}>
            {getAnciennete(emp.date_embauche)}
          </div>
        </div>
        <div>
          <div style={{ color: "#8b8fa8", fontSize: 11 }}>Salaire</div>
          <div style={{ color: "#0f6e56", fontWeight: 500 }}>
            {emp.salaire
              ? `${Number(emp.salaire).toLocaleString("fr-MA")} MAD`
              : "—"}
          </div>
        </div>
        <div>
          <div style={{ color: "#8b8fa8", fontSize: 11 }}>Score</div>
          <div
            style={{
              color: getScoreColor(emp.score_performance || 0),
              fontWeight: 500,
            }}
          >
            {emp.score_performance ?? "—"}/100
          </div>
        </div>
        <div>
          <div style={{ color: "#8b8fa8", fontSize: 11 }}>Absences</div>
          <div
            style={{ color: (emp.absences || 0) > 10 ? "#991b1b" : "#0f6e56" }}
          >
            {emp.absences ?? 0} j
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
        <ActionButton onClick={onView} icon={<ViewIcon />} title="Voir" />
        <ActionButton onClick={onEdit} icon={<EditIcon />} title="Modifier" />
        <ActionButton
          onClick={onDelete}
          icon={<DeleteIcon />}
          title="Supprimer"
          danger
        />
      </div>
    </div>
  );
});

interface TableRowProps {
  emp: Employee;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  getAnciennete: (date: string) => string;
  getScoreColor: (score: number) => string;
}

const TableRow = memo(function TableRow({
  emp,
  onView,
  onEdit,
  onDelete,
  getAnciennete,
  getScoreColor,
}: TableRowProps) {
  return (
    <tr
      style={{ cursor: "pointer" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#fdf2f8")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "")}
    >
      <td style={{ padding: "12px 16px", fontSize: 12, color: "#1a1a2e" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
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
            {emp.prenom[0]}
            {emp.nom[0]}
          </div>
          <div>
            <div style={{ fontWeight: 500 }}>
              {emp.prenom} {emp.nom}
            </div>
            <div style={{ fontSize: 11, color: "#8b8fa8" }}>{emp.age} ans</div>
          </div>
        </div>
      </td>
      <td style={{ padding: "12px 16px", fontSize: 12 }}>
        <div style={{ fontWeight: 500, color: "#1a1a2e" }}>
          {emp.poste_nom || "—"}
        </div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "2px 8px",
            borderRadius: 20,
            fontSize: 10,
            fontWeight: 500,
            background: "#fce4f0",
            color: "#c73380",
            marginTop: 2,
          }}
        >
          {emp.categorie_nom}
        </span>
      </td>
      <td style={{ padding: "12px 16px", fontSize: 12, color: "#1a1a2e" }}>
        {getAnciennete(emp.date_embauche)}
      </td>
      <td
        style={{
          padding: "12px 16px",
          fontSize: 12,
          color: "#0f6e56",
          fontWeight: 500,
        }}
      >
        {emp.salaire
          ? `${Number(emp.salaire).toLocaleString("fr-MA")} MAD`
          : "—"}
      </td>
      <td
        style={{
          padding: "12px 16px",
          fontSize: 12,
          color: (emp.absences || 0) > 10 ? "#991b1b" : "#0f6e56",
        }}
      >
        {emp.absences ?? 0} j
      </td>
      <td style={{ padding: "12px 16px", fontSize: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              color: getScoreColor(emp.score_performance || 0),
              fontWeight: 500,
            }}
          >
            {emp.score_performance ?? "—"}/100
          </span>
        </div>
      </td>
      <td style={{ padding: "12px 16px" }}>
        {emp.risque_depart ? (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "3px 10px",
              borderRadius: 20,
              fontSize: 10,
              fontWeight: 500,
              background: "#fee2e2",
              color: "#991b1b",
            }}
          >
            ⚠ Risque
          </span>
        ) : (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "3px 10px",
              borderRadius: 20,
              fontSize: 10,
              fontWeight: 500,
              background: "#e0f7f0",
              color: "#0f6e56",
            }}
          >
            ✓ Stable
          </span>
        )}
      </td>
      <td style={{ padding: "12px 16px" }}>
        <div style={{ display: "flex", gap: 4 }}>
          <ActionButton onClick={onView} icon={<ViewIcon />} title="Voir" />
          <ActionButton onClick={onEdit} icon={<EditIcon />} title="Modifier" />
          <ActionButton
            onClick={onDelete}
            icon={<DeleteIcon />}
            title="Supprimer"
            danger
          />
        </div>
      </td>
    </tr>
  );
});

interface ActionButtonProps {
  onClick: () => void;
  icon: JSX.Element;
  title: string;
  danger?: boolean;
}

const ActionButton = memo(function ActionButton({
  onClick,
  icon,
  title,
  danger,
}: ActionButtonProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 28,
        height: 28,
        border: "1px solid #e8eaf0",
        borderRadius: 8,
        background: hovered && danger ? "#fee2e2" : "white",
        borderColor: hovered && danger ? "#fca5a5" : "#e8eaf0",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.15s",
      }}
    >
      {icon}
    </button>
  );
});
