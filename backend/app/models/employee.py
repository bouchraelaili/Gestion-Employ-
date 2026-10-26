from datetime import date, datetime

class Employee:
    """Modèle Employé."""
    
    def __init__(self, data=None, **kwargs):
        data = data or kwargs
        self.id = data.get('id')
        self.nom = data.get('nom', '')
        self.prenom = data.get('prenom', '')
        self.age = data.get('age', 0)
        self.sexe = data.get('sexe', '')
        self.category_id = data.get('category_id')
        self.poste_id = data.get('poste_id')
        self.date_embauche = data.get('date_embauche')
        self.salaire = data.get('salaire', 0.0)
        self.absences = data.get('absences', 0)
        self.score_performance = data.get('score_performance', 50)
        self.risque_depart = data.get('risque_depart', False)
        self.created_at = data.get('created_at')
        self.updated_at = data.get('updated_at')
        self.categorie_nom = data.get('categorie_nom', '')
        self.poste_nom = data.get('poste_nom', '')
        self.anciennete = data.get('anciennete', 0)

    @property
    def full_name(self):
        return f"{self.prenom} {self.nom}".strip()

    @property
    def anciennete_annees(self):
        if isinstance(self.date_embauche, (date, datetime)):
            today = date.today()
            return today.year - self.date_embauche.year - (
                (today.month, today.day) < (self.date_embauche.month, self.date_embauche.day)
            )
        return self.anciennete or 0

    def to_dict(self):
        return {
            'id': self.id,
            'nom': self.nom,
            'prenom': self.prenom,
            'full_name': self.full_name,
            'age': self.age,
            'sexe': self.sexe,
            'category_id': self.category_id,
            'poste_id': self.poste_id,
            'date_embauche': self.date_embauche.isoformat() if isinstance(self.date_embauche, (date, datetime)) else self.date_embauche,
            'salaire': float(self.salaire) if self.salaire else 0.0,
            'absences': self.absences,
            'score_performance': self.score_performance,
            'risque_depart': bool(self.risque_depart),
            'anciennete': self.anciennete_annees,
            'categorie_nom': self.categorie_nom,
            'poste_nom': self.poste_nom,
            'created_at': self.created_at.isoformat() if isinstance(self.created_at, datetime) else self.created_at,
            'updated_at': self.updated_at.isoformat() if isinstance(self.updated_at, datetime) else self.updated_at,
        }

    @classmethod
    def from_db_row(cls, row):
        return cls(dict(row)) if row else None

    def __repr__(self):
        return f"<Employee {self.id}: {self.full_name}>"
