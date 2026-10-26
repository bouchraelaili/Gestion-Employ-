export interface User {
  id: number;
  email: string;
  role: string;
  created_at?: string;
}

export interface Employee {
  id: number;
  nom: string;
  prenom: string;
  full_name: string;
  age: number;
  sexe: string;
  category_id: number;
  category_nom?: string;
  poste_id: number;
  date_embauche: string;
  salaire: number;
  absences: number;
  score_performance: number;
  risque_depart: boolean;
  anciennete: number;
  categorie_nom: string;
  poste_nom: string;
  created_at?: string;
  updated_at?: string;
}

export interface DashboardStats {
  total_employes: number;
  total_risque_depart: number;
  taux_absenteisme: number;
  anciennete_moyenne: number;
  repartition_categorie: {
    categorie: string;
    total?: number;
    count?: number;
  }[];
  salaire_par_categorie: {
    categorie: string;
    salaire_moyen: number;
  }[];
  employes_risque: {
    id: number;
    nom: string;
    prenom: string;
    poste_nom?: string;
    score_performance?: number;
    absences?: number;
    salaire?: number;
  }[];
}

export interface Category {
  id: number;
  nom: string;
  postes: { id: number; nom: string }[];
}
export interface EmployeeFormData {
  nom: string
  prenom: string
  age: number | ''
  sexe: string
  category_id: number | ''
  poste_id: number | ''
  date_embauche: string
  salaire: number | ''
  absences: number | ''
  score_performance: number | ''
}

export interface PredictInput {
  employee_id?: number
  age: number
  anciennete: number
  salaire: number
  absences: number
  score_performance: number
  category_id: number
  poste_id: number
}

export interface PredictResult {
  risque_depart?: boolean
  risque?: boolean
  pourcentage?: number
  label?: string
  facteurs?: string[]
  recommandations?: string[]
  ml_used?: boolean
  ml_score?: number | null
}