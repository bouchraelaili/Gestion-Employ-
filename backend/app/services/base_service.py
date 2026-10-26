import psycopg2
import psycopg2.extras
from datetime import date, datetime

class BaseService:
    """Classe de base pour tous les services avec connexion DB."""
    
    DB_CONFIG = {
        'host': 'localhost',
        'database': 'GestionSystem',
        'user': 'postgres',
        'password': 'aa147258',
        'port': 5432
    }
    
    @classmethod
    def get_db(cls):
        try:
            return psycopg2.connect(**cls.DB_CONFIG)
        except Exception as e:
            print(f"ERREUR CONNEXION DB: {e}")
            raise
    
    @staticmethod
    def row_to_dict(row):
        if row is None:
            return None
        d = dict(row)
        for key, val in d.items():
            if isinstance(val, (date, datetime)):
                d[key] = val.isoformat()
        return d
    
    @staticmethod
    def rows_to_dicts(rows):
        return [BaseService.row_to_dict(r) for r in rows]
