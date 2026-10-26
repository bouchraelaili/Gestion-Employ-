import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { employeeService } from "../services/employeeService";

interface Category {
  id: number;
  nom: string;
}
interface Poste {
  id: number;
  category_id: number;
  nom: string;
}

export default function EmployeeFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id && id !== "new";

  const [categories, setCategories] = useState<Category[]>([]);
  const [postes, setPostes] = useState<Poste[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    age: "",
    sexe: "M",
    category_id: "",
    poste_id: "",
    date_embauche: "",
    salaire: "",
    absences: "0",
    score_performance: "75",
  });

  useEffect(() => {
    Promise.all([
      fetch("http://127.0.0.1:5000/api/categories", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }).then((r) => r.json()),

      fetch("http://127.0.0.1:5000/api/postes", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }).then((r) => r.json()),
    ])
      .then(([cats, pos]) => {
        console.log("CATS", cats);
        console.log("POSTES", pos);

        setCategories(Array.isArray(cats) ? cats : []);
        setPostes(Array.isArray(pos) ? pos : []);
      })
      .catch((err) => {
        console.error(err);
      });

    if (isEdit) {
      employeeService
        .getById(Number(id))
        .then((emp) => {
          setForm({
            nom: emp.nom,
            prenom: emp.prenom,
            age: String(emp.age),
            sexe: emp.sexe || "M",
            category_id: String(emp.category_id),
            poste_id: String(emp.poste_id),
            date_embauche: emp.date_embauche?.split("T")[0] || "",
            salaire: String(emp.salaire || ""),
            absences: String(emp.absences ?? 0),
            score_performance: String(emp.score_performance ?? 75),
          });
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const filteredPostes = postes.filter(
    (p) => Number(p.category_id) === Number(form.category_id),
  );

  console.log(form.category_id);
  console.log(filteredPostes);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => {
      const updated = {
        ...prev,
        [field]: value,
      };

      if (field === "category_id") {
        updated.poste_id = "";
      }

      return updated;
    });

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nom.trim()) e.nom = "Nom requis";
    if (!form.prenom.trim()) e.prenom = "Prénom requis";
    if (!form.age || Number(form.age) < 18) e.age = "Âge invalide";
    if (!form.category_id) e.category_id = "Catégorie requise";
    if (!form.poste_id) e.poste_id = "Poste requis";
    if (!form.date_embauche) e.date_embauche = "Date requise";
    if (!form.salaire || Number(form.salaire) <= 0)
      e.salaire = "Salaire invalide";
    const score = Number(form.score_performance);
    if (score < 0 || score > 100) e.score_performance = "Entre 0 et 100";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        nom: form.nom,
        prenom: form.prenom,
        age: Number(form.age),
        sexe: form.sexe,
        category_id: Number(form.category_id),
        poste_id: Number(form.poste_id),
        date_embauche: form.date_embauche,
        salaire: Number(form.salaire),
        absences: Number(form.absences),
        score_performance: Number(form.score_performance),
      };
      if (isEdit) {
        await employeeService.update(Number(id), payload);
      } else {
        await employeeService.create(payload);
      }
      navigate("/employees");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
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
    );
  }

  const field = (label: string, key: string, input: React.ReactNode) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: "#4a4e6a" }}>
        {label}
      </label>
      {input}
      {errors[key] && (
        <span style={{ fontSize: 11, color: "#991b1b" }}>{errors[key]}</span>
      )}
    </div>
  );

  const inp = (
    key: string,
    props: React.InputHTMLAttributes<HTMLInputElement>,
  ) => (
    <input
      {...props}
      value={(form as any)[key]}
      onChange={(e) => handleChange(key, e.target.value)}
      style={{
        fontSize: 13,
        border: `1px solid ${errors[key] ? "#fca5a5" : "#e0e3ec"}`,
        borderRadius: 8,
        padding: "9px 12px",
        background: "#f8f9fc",
        color: "#1a1a2e",
        outline: "none",
        width: "100%",
      }}
    />
  );

  const sel = (key: string, options: { value: string; label: string }[]) => (
    <select
      value={(form as any)[key]}
      onChange={(e) => handleChange(key, e.target.value)}
      style={{
        fontSize: 13,
        border: `1px solid ${errors[key] ? "#fca5a5" : "#e0e3ec"}`,
        borderRadius: 8,
        padding: "9px 12px",
        background: "#f8f9fc",
        color: "#1a1a2e",
        outline: "none",
        width: "100%",
        cursor: "pointer",
      }}
    >
      <option value="">Sélectionner...</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );

  const cardStyle = {
    background: "white",
    border: "1px solid #e8eaf0",
    borderRadius: 14,
    padding: 18,
  };
  const sectionTitle = (t: string) => (
    <div
      style={{
        fontSize: 11,
        fontWeight: 500,
        color: "#8b8fa8",
        textTransform: "uppercase" as const,
        letterSpacing: "0.05em",
        marginBottom: 14,
        paddingBottom: 8,
        borderBottom: "1px solid #f0f2f8",
      }}
    >
      {t}
    </div>
  );
  const grid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Infos personnelles */}
      <div style={cardStyle}>
        {sectionTitle("Informations personnelles")}
        <div style={grid}>
          {field("Nom", "nom", inp("nom", { placeholder: "Benali" }))}
          {field("Prénom", "prenom", inp("prenom", { placeholder: "Karim" }))}
          {field(
            "Âge",
            "age",
            inp("age", { type: "number", placeholder: "35", min: 18, max: 70 }),
          )}
          {field(
            "Sexe",
            "sexe",
            <select
              value={form.sexe}
              onChange={(e) => handleChange("sexe", e.target.value)}
              style={{
                fontSize: 13,
                border: "1px solid #e0e3ec",
                borderRadius: 8,
                padding: "9px 12px",
                background: "#f8f9fc",
                color: "#1a1a2e",
                outline: "none",
                width: "100%",
                cursor: "pointer",
              }}
            >
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
            </select>,
          )}
        </div>
      </div>

      {/* Infos professionnelles */}
      <div style={cardStyle}>
        {sectionTitle("Informations professionnelles")}
        <div style={grid}>
          {field(
            "Catégorie",
            "category_id",
            sel(
              "category_id",
              categories.map((c) => ({ value: String(c.id), label: c.nom })),
            ),
          )}
          {field(
            "Poste",
            "poste_id",
            <select
              value={form.poste_id}
              onChange={(e) => handleChange("poste_id", e.target.value)}
              disabled={!form.category_id}
              style={{
                fontSize: 13,
                border: `1px solid ${errors.poste_id ? "#fca5a5" : "#e0e3ec"}`,
                borderRadius: 8,
                padding: "9px 12px",
                background: form.category_id ? "#f8f9fc" : "#f0f2f8",
                color: "#1a1a2e",
                outline: "none",
                width: "100%",
                cursor: form.category_id ? "pointer" : "not-allowed",
                opacity: form.category_id ? 1 : 0.6,
              }}
            >
              <option value="">
                {form.category_id
                  ? "Sélectionner..."
                  : "Choisir catégorie d'abord"}
              </option>
              {filteredPostes.map((p) => (
                <option key={p.id} value={String(p.id)}>
                  {p.nom}
                </option>
              ))}
            </select>,
          )}
          {field(
            "Date d'embauche",
            "date_embauche",
            inp("date_embauche", { type: "date" }),
          )}
          {field(
            "Salaire (MAD)",
            "salaire",
            inp("salaire", { type: "number", placeholder: "75000", min: 0 }),
          )}
        </div>
      </div>

      {/* Performance */}
      <div style={cardStyle}>
        {sectionTitle("Performance")}
        <div style={grid}>
          {field(
            "Absences (jours/an)",
            "absences",
            inp("absences", { type: "number", placeholder: "5", min: 0 }),
          )}
          {field(
            "Score de performance (0–100)",
            "score_performance",
            <div>
              {inp("score_performance", {
                type: "number",
                placeholder: "75",
                min: 0,
                max: 100,
              })}
              {form.score_performance && (
                <div style={{ marginTop: 8 }}>
                  <div
                    style={{
                      height: 4,
                      background: "#f0f2f8",
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min(100, Math.max(0, Number(form.score_performance)))}%`,
                        height: "100%",
                        borderRadius: 2,
                        background: "#e84393",
                        transition: "width 0.3s",
                      }}
                    />
                  </div>
                </div>
              )}
            </div>,
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button
          onClick={() => navigate("/employees")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            fontSize: 12,
            fontWeight: 500,
            borderRadius: 8,
            border: "1px solid #e0e3ec",
            background: "white",
            color: "#4a4e6a",
            cursor: "pointer",
          }}
        >
          Annuler
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 20px",
            fontSize: 12,
            fontWeight: 500,
            borderRadius: 8,
            border: "none",
            background: saving ? "#f0f2f8" : "#e84393",
            color: saving ? "#8b8fa8" : "white",
            cursor: saving ? "not-allowed" : "pointer",
          }}
        >
          {saving
            ? "Enregistrement..."
            : isEdit
              ? "Mettre à jour"
              : "Enregistrer l'employé"}
        </button>
      </div>
    </div>
  );
}
