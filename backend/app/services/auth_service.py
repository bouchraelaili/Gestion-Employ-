import psycopg2
import psycopg2.extras
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from .base_service import BaseService
from ..models.user import User

class AuthService(BaseService):
    """Service d'authentification."""
    
    @staticmethod
    def authenticate(email, password):
        """Authentifie un utilisateur et retourne le token."""
        conn = BaseService.get_db()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute("SELECT * FROM users WHERE email = %s", (email.strip(),))
        user = cur.fetchone()
        cur.close(); conn.close()
        
        if not user or not check_password_hash(user["password_hash"], password):
            return None
        
        user_obj = User.from_db_row(user)
        token = create_access_token(
            identity=str(user_obj.id),
            additional_claims={"role": user_obj.role, "email": user_obj.email}
        )
        return {
            "access_token": token,
            "user": user_obj.to_dict()
        }
    
    @staticmethod
    def get_user_by_id(user_id):
        """Récupère un utilisateur par ID."""
        conn = BaseService.get_db()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute("SELECT id, email, role, created_at FROM users WHERE id = %s", (user_id,))
        user = cur.fetchone()
        cur.close(); conn.close()
        return User.from_db_row(user)
