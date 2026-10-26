import psycopg2
from .base_service import BaseService

class DashboardService(BaseService):
    """Service pour les statistiques du dashboard."""
    
    @staticmethod
    def get_stats():
        conn = BaseService.get_db()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        cur.execute("SELECT COUNT(*) AS total FROM employees")
        total = cur.fetchone()["total"]
        
        cur.execute("SELECT COUNT(*) AS total FROM employees WHERE risque_depart = TRUE")
        total_risque = cur.fetchone()["total"]
        
        cur.execute("SELECT ROUND(AVG(absences)::numeric, 2) AS moy FROM employees")
        absenteisme = float(cur.fetchone()["moy"] or 0)
        
        cur.execute("""
            SELECT ROUND(AVG(DATE_PART('year', AGE(date_embauche)))::numeric, 1) AS moy
            FROM employees
        """)
        anciennete_moy = float(cur.fetchone()["moy"] or 0)
        
        cur.execute("""
            SELECT c.nom AS categorie, COUNT(*) AS total
            FROM employees e JOIN categories c ON e.category_id = c.id
            GROUP BY c.nom ORDER BY total DESC
        """)
        repartition = BaseService.rows_to_dicts(cur.fetchall())
        
        cur.execute("""
            SELECT c.nom AS categorie, ROUND(AVG(e.salaire), 2) AS salaire_moyen
            FROM employees e JOIN categories c ON e.category_id = c.id
            GROUP BY c.nom ORDER BY salaire_moyen DESC
        """)
        salaires = BaseService.rows_to_dicts(cur.fetchall())
        
        cur.execute("""
            SELECT e.id, e.nom, e.prenom, c.nom AS categorie, p.nom AS poste,
                   e.score_performance, e.absences, e.salaire
            FROM employees e
            JOIN categories c ON e.category_id = c.id
            JOIN postes p ON e.poste_id = p.id
            WHERE e.risque_depart = TRUE
            ORDER BY e.absences DESC LIMIT 5
        """)
        risque = BaseService.rows_to_dicts(cur.fetchall())
        
        cur.close(); conn.close()
        
        return {
            "total_employes": total,
            "total_risque_depart": total_risque,
            "taux_absenteisme": absenteisme,
            "anciennete_moyenne": anciennete_moy,
            "repartition_categorie": repartition,
            "salaire_par_categorie": salaires,
            "employes_risque": risque
        }
    
    @staticmethod
    def get_categories_with_postes():
        conn = BaseService.get_db()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute("""
            SELECT c.id, c.nom,
                   json_agg(json_build_object('id', p.id, 'nom', p.nom) ORDER BY p.nom) AS postes
            FROM categories c
            LEFT JOIN postes p ON p.category_id = c.id
            GROUP BY c.id, c.nom
            ORDER BY c.id
        """)
        rows = BaseService.rows_to_dicts(cur.fetchall())
        cur.close(); conn.close()
        return rows