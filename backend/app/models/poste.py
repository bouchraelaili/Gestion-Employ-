
class Poste:
    """Modèle Poste."""
    
    def __init__(self, data=None, **kwargs):
        data = data or kwargs
        self.id = data.get('id')
        self.nom = data.get('nom', '')
        self.category_id = data.get('category_id')
    
    def to_dict(self):
        return {
            'id': self.id,
            'nom': self.nom,
            'category_id': self.category_id
        }
    
    @classmethod
    def from_db_row(cls, row):
        return cls(dict(row)) if row else None
    
    def __repr__(self):
        return f"<Poste {self.id}: {self.nom}>"
