
class Category:
    """Modèle Catégorie."""
    
    def __init__(self, data=None, **kwargs):
        data = data or kwargs
        self.id = data.get('id')
        self.nom = data.get('nom', '')
        self.postes = data.get('postes', [])
    
    def to_dict(self):
        return {
            'id': self.id,
            'nom': self.nom,
            'postes': self.postes
        }
    
    @classmethod
    def from_db_row(cls, row):
        return cls(dict(row)) if row else None
    
    def __repr__(self):
        return f"<Category {self.id}: {self.nom}>"
