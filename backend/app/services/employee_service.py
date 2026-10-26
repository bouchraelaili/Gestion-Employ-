import psycopg2
import psycopg2.extras
from .base_service import BaseService
from ..models.employee import Employee

class EmployeeService(BaseService):
    """Service métier pour les employés."""
    
    @staticmethod
    def get_all(filters=None):
        filters = filters or {}
        query = """
            SELECT e.*, c.nom AS categorie_nom, p.nom AS poste_nom,
                   DATE_PART('year', AGE(e.date_embauche))::INT AS anciennete
            FROM employees e
            JOIN categories c ON e.category_id = c.id
            JOIN postes p ON e.poste_id = p.id
            WHERE 1=1
        """
        params = []
        
        if filters.get('category_id'):
            query += " AND e.category_id = %s"
            params.append(filters['category_id'])
        if filters.get('poste_id'):
            query += " AND e.poste_id = %s"
            params.append(filters['poste_id'])
        if filters.get('risque_depart') is not None:
            query += " AND e.risque_depart = %s"
            params.append(filters['risque_depart'])
        if filters.get('search'):
            query += " AND (LOWER(e.nom) LIKE %s OR LOWER(e.prenom) LIKE %s)"
            like = f"%{filters['search'].lower()}%"
            params.extend([like, like])
        if filters.get('categorie_nom'):
            query += " AND LOWER(c.nom) = %s"
            params.append(filters['categorie_nom'].lower())
        
        query += " ORDER BY e.id"
        
        conn = BaseService.get_db()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(query, params)
        employees = [Employee.from_db_row(r) for r in cur.fetchall()]
        cur.close(); conn.close()
        return employees
    
    @staticmethod
    def get_by_id(emp_id):
        conn = BaseService.get_db()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute("""
            SELECT e.*, c.nom AS categorie_nom, p.nom AS poste_nom,
                   DATE_PART('year', AGE(e.date_embauche))::INT AS anciennete
            FROM employees e
            JOIN categories c ON e.category_id = c.id
            JOIN postes p ON e.poste_id = p.id
            WHERE e.id = %s
        """, (emp_id,))
        row = cur.fetchone()
        cur.close(); conn.close()
        return Employee.from_db_row(row)
    
    @staticmethod
    def create(data):
        required = ["nom", "prenom", "age", "sexe", "category_id", "poste_id", "date_embauche", "salaire"]
        for field in required:
            if field not in data:
                raise ValueError(f"Champ manquant: {field}")
        
        conn = BaseService.get_db()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute("""
            INSERT INTO employees (nom, prenom, age, sexe, category_id, poste_id,
                                 date_embauche, salaire, absences, score_performance, risque_depart)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            RETURNING *
        """, (
            data["nom"], data["prenom"], data["age"], data["sexe"],
            data["category_id"], data["poste_id"], data["date_embauche"],
            data["salaire"], data.get("absences", 0),
            data.get("score_performance", 50), data.get("risque_depart", False)
        ))
        conn.commit()
        emp = Employee.from_db_row(cur.fetchone())
        cur.close(); conn.close()
        return emp
    
    @staticmethod
    def update(emp_id, data):
        conn = BaseService.get_db()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute("SELECT id FROM employees WHERE id = %s", (emp_id,))
        if not cur.fetchone():
            cur.close(); conn.close()
            return None
        
        cur.execute("""
            UPDATE employees SET
                nom = COALESCE(%s, nom), prenom = COALESCE(%s, prenom),
                age = COALESCE(%s, age), sexe = COALESCE(%s, sexe),
                category_id = COALESCE(%s, category_id), poste_id = COALESCE(%s, poste_id),
                date_embauche = COALESCE(%s, date_embauche), salaire = COALESCE(%s, salaire),
                absences = COALESCE(%s, absences), score_performance = COALESCE(%s, score_performance),
                risque_depart = COALESCE(%s, risque_depart), updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
            RETURNING *
        """, (
            data.get("nom"), data.get("prenom"), data.get("age"), data.get("sexe"),
            data.get("category_id"), data.get("poste_id"), data.get("date_embauche"),
            data.get("salaire"), data.get("absences"), data.get("score_performance"),
            data.get("risque_depart"), emp_id
        ))
        conn.commit()
        emp = Employee.from_db_row(cur.fetchone())
        cur.close(); conn.close()
        return emp
    
    @staticmethod
    def delete(emp_id):
        conn = BaseService.get_db()
        cur = conn.cursor()
        cur.execute("SELECT id FROM employees WHERE id = %s", (emp_id,))
        if not cur.fetchone():
            cur.close(); conn.close()
            return False
        cur.execute("DELETE FROM employees WHERE id = %s", (emp_id,))
        conn.commit()
        cur.close(); conn.close()
        return True

    
    @staticmethod
    def get_categories():
        conn = BaseService.get_db()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute("SELECT id, nom FROM categories ORDER BY nom")
        rows = cur.fetchall()
        cur.close(); conn.close()
        return rows
    
    @staticmethod
    def get_postes():
        conn = BaseService.get_db()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute("SELECT id, category_id, nom FROM postes ORDER BY nom")
        rows = cur.fetchall()
        cur.close(); conn.close()
        return rows