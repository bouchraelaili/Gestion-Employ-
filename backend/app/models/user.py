from datetime import datetime

class User:
    """Modèle Utilisateur."""
    
    def __init__(self, data=None, **kwargs):
        data = data or kwargs
        self.id = data.get('id')
        self.email = data.get('email', '')
        self.password_hash = data.get('password_hash', '')
        self.role = data.get('role', 'rh')
        self.created_at = data.get('created_at')
    
    def to_dict(self, secure=False):
        result = {
            'id': self.id,
            'email': self.email,
            'role': self.role,
            'created_at': self.created_at.isoformat() if isinstance(self.created_at, datetime) else self.created_at
        }
        if secure:
            result['password_hash'] = self.password_hash
        return result
    
    @classmethod
    def from_db_row(cls, row):
        return cls(dict(row)) if row else None
    
    def __repr__(self):
        return f"<User {self.id}: {self.email} ({self.role})>"
