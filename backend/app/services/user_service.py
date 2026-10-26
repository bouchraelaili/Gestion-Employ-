
import psycopg2
from werkzeug.security import generate_password_hash
from .base_service import BaseService
from ..models.user import User

class UserService(BaseService):
    """Service pour la gestion des utilisateurs."""

    @staticmethod
    def get_all():
        conn = BaseService.get_db()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute("SELECT id, email, role, created_at FROM users ORDER BY id")
        users = [User.from_db_row(r) for r in cur.fetchall()]
        cur.close(); conn.close()
        return users

    @staticmethod
    def get_by_id(user_id):
        conn = BaseService.get_db()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute("SELECT id, email, role, created_at FROM users WHERE id = %s", (user_id,))
        user = cur.fetchone()
        cur.close(); conn.close()
        return User.from_db_row(user) if user else None

    @staticmethod
    def create(email, password, role='rh'):
        if not email or not password:
            raise ValueError("Email et mot de passe requis")
        if role not in ('admin', 'rh'):
            raise ValueError("Role invalide")

        hashed = generate_password_hash(password)
        conn = BaseService.get_db()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        try:
            cur.execute(
                "INSERT INTO users (email, password_hash, role) VALUES (%s,%s,%s) RETURNING id, email, role, created_at",
                (email.strip(), hashed, role)
            )
            conn.commit()
            user = User.from_db_row(cur.fetchone())
        except psycopg2.errors.UniqueViolation:
            conn.rollback()
            raise ValueError("Email deja utilise")
        finally:
            cur.close(); conn.close()
        return user

    @staticmethod
    def update(user_id, email=None, password=None, role=None):
        if role and role not in ('admin', 'rh'):
            raise ValueError("Role invalide")

        conn = BaseService.get_db()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        try:
            fields = []
            values = []

            if email:
                fields.append("email = %s")
                values.append(email.strip())

            if role:
                fields.append("role = %s")
                values.append(role)

            if password:
                fields.append("password_hash = %s")
                values.append(generate_password_hash(password))

            if not fields:
                raise ValueError("Aucun champ à mettre à jour")

            values.append(user_id)
            cur.execute(
                f"UPDATE users SET {', '.join(fields)} WHERE id = %s RETURNING id, email, role, created_at",
                values
            )
            conn.commit()
            row = cur.fetchone()
            if not row:
                raise ValueError("Utilisateur introuvable")
            return User.from_db_row(row)

        except psycopg2.errors.UniqueViolation:
            conn.rollback()
            raise ValueError("Email deja utilise")
        finally:
            cur.close(); conn.close()

    @staticmethod
    def delete(user_id):
        conn = BaseService.get_db()
        cur = conn.cursor()
        cur.execute("SELECT id FROM users WHERE id = %s", (user_id,))
        if not cur.fetchone():
            cur.close(); conn.close()
            return False
        cur.execute("DELETE FROM users WHERE id = %s", (user_id,))
        conn.commit()
        cur.close(); conn.close()
        return True