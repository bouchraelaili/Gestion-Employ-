import os
import pickle
import numpy as np

try:
    from sklearn.ensemble import GradientBoostingClassifier
    from sklearn.preprocessing import StandardScaler
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import accuracy_score
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False

MODEL_DIR   = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH  = os.path.join(MODEL_DIR, 'trained_model.pkl')
SCALER_PATH = os.path.join(MODEL_DIR, 'scaler.pkl')


class RiskPredictor:
    def __init__(self):
        self.model         = None
        self.scaler        = None
        self.is_trained    = False
        self.feature_names = [
            'age', 'anciennete', 'salaire', 'absences',
            'score_performance', 'category_id', 'poste_id'
        ]
        self._load_model()

    def _load_model(self):
        if os.path.exists(MODEL_PATH) and SKLEARN_AVAILABLE:
            try:
                with open(MODEL_PATH, 'rb') as f:
                    self.model = pickle.load(f)
                if os.path.exists(SCALER_PATH):
                    with open(SCALER_PATH, 'rb') as f:
                        self.scaler = pickle.load(f)
                self.is_trained = True
                print("✅ Modèle chargé depuis le disque")
            except Exception as e:
                print(f"Erreur chargement modèle: {e}")
                self.is_trained = False

    def _save_model(self):
        if not SKLEARN_AVAILABLE or self.model is None:
            return
        try:
            with open(MODEL_PATH, 'wb') as f:
                pickle.dump(self.model, f)
            if self.scaler:
                with open(SCALER_PATH, 'wb') as f:
                    pickle.dump(self.scaler, f)
        except Exception as e:
            print(f"Erreur sauvegarde modèle: {e}")

    def _calculate_risk_score(self, data):
        score = 0
        facteurs = []
        recommandations = []

        absences = data.get('absences', 0)
        if absences > 20:
            score += 30
            facteurs.append(f"Absences très élevées ({absences} jours)")
            recommandations.append("Entretien médical/congé de récupération")
        elif absences > 12:
            score += 20
            facteurs.append(f"Absences élevées ({absences} jours)")
            recommandations.append("Enquête sur les causes d'absence")
        elif absences > 6:
            score += 10
            facteurs.append(f"Absences modérées ({absences} jours)")
            recommandations.append("Suivi régulier des absences")

        perf = data.get('score_performance', 50)
        if perf < 30:
            score += 25
            facteurs.append(f"Performance critique ({perf}/100)")
            recommandations.append("Plan d'amélioration immédiat (PIP)")
        elif perf < 50:
            score += 15
            facteurs.append(f"Performance insuffisante ({perf}/100)")
            recommandations.append("Coaching et formation ciblée")
        elif perf < 65:
            score += 5
            facteurs.append(f"Performance en dessous des attentes ({perf}/100)")
            recommandations.append("Entretien d'évaluation semestriel")

        anciennete = data.get('anciennete', 0)
        if anciennete < 0.5:
            score += 20
            facteurs.append("Période d'essai / très récent")
            recommandations.append("Programme d'intégration renforcé")
        elif anciennete < 1.5:
            score += 15
            facteurs.append("Ancienneté faible (< 1.5 an)")
            recommandations.append("Suivi mentorat à 3 et 6 mois")
        elif anciennete > 10:
            score += 10
            facteurs.append("Ancienneté élevée (> 10 ans)")
            recommandations.append("Plan de carrière / évolution")
        elif anciennete > 7:
            score += 5
            facteurs.append("Ancienneté significative (> 7 ans)")
            recommandations.append("Projet motivant / nouveau challenge")

        salaire = data.get('salaire', 0)
        if salaire < 25000:
            score += 15
            facteurs.append(f"Salaire très bas ({salaire:,.0f} DA)")
            recommandations.append("Révision salariale urgente")
        elif salaire < 35000:
            score += 10
            facteurs.append(f"Salaire sous le marché ({salaire:,.0f} DA)")
            recommandations.append("Ajustement salarial à prévoir")
        elif salaire < 45000:
            score += 5
            facteurs.append(f"Salaire moyen ({salaire:,.0f} DA)")
            recommandations.append("Prime de performance ou avantages")

        age = data.get('age', 30)
        if age < 24:
            score += 10
            facteurs.append(f"Jeune diplômé ({age} ans)")
            recommandations.append("Projet innovant / responsabilités")
        elif age > 58:
            score += 10
            facteurs.append(f"Approche retraite ({age} ans)")
            recommandations.append("Transmission des connaissances")
        elif age > 50:
            score += 5
            facteurs.append(f"Senior ({age} ans)")
            recommandations.append("Flexibilité horaire / télétravail")

        poste_id    = data.get('poste_id', 0)
        category_id = data.get('category_id', 0)

        high_turnover_postes = [8, 9, 10, 13, 14]
        if poste_id in high_turnover_postes:
            score += 10
            facteurs.append("Poste à forte rotation")
            recommandations.append("Amélioration conditions de travail")

        if category_id == 1:
            score -= 5
            facteurs.append("Poste de direction (facteur de stabilité)")

        score = max(0, min(100, score))

        if score >= 40 and len(recommandations) < 2:
            recommandations.append("Entretien de rétention personnalisé")

        return {
            'score': score,
            'risque': score >= 40,    
            'facteurs': facteurs,
            'recommandations': recommandations
        }

    def predict(self, data):
        for field in self.feature_names:
            if field not in data:
                raise ValueError(f"Champ manquant: {field}")

        ml_prediction = None
        ml_proba      = None

        if SKLEARN_AVAILABLE and self.is_trained and self.model:
            try:
                features = np.array([[
                    float(data['age']),
                    float(data['anciennete']),
                    float(data['salaire']),
                    float(data['absences']),
                    float(data['score_performance']),
                    int(data['category_id']),
                    int(data['poste_id'])
                ]])
                if self.scaler:
                    features = self.scaler.transform(features)
                prediction    = self.model.predict(features)[0]
                ml_prediction = bool(prediction)
                if hasattr(self.model, 'predict_proba'):
                    proba    = self.model.predict_proba(features)[0]
                    ml_proba = float(proba[1]) * 100
            except Exception as e:
                print(f"ML failed, fallback: {e}")

        business_result = self._calculate_risk_score(data)

        if ml_proba is not None:
            final_score = int(0.3 * ml_proba + 0.7 * business_result['score'])
        else:
            final_score = business_result['score']

        if ml_prediction is not None:
            if ml_prediction and final_score < 45:
                final_score = 50 

        final_score = max(0, min(100, final_score))

        print(f"🔍 Business score: {business_result['score']} | ML proba: {ml_proba} | Final: {final_score}")

        return {
            'risque':          final_score >= 40,   
            'pourcentage':     final_score,
            'facteurs':        business_result['facteurs'],
            'recommandations': business_result['recommandations'],
            'ml_used':         ml_prediction is not None,
            'ml_score':        int(ml_proba) if ml_proba else None
        }

    def train(self, employees_data, labels=None):
        if not SKLEARN_AVAILABLE:
            print("❌ scikit-learn non installé : pip install scikit-learn")
            return False

        if len(employees_data) < 10:
            print(f"❌ Pas assez de données : {len(employees_data)} (minimum 10)")
            return False

        try:
            X = np.array([[
                float(emp['age']),
                float(emp['anciennete']),
                float(emp['salaire']),
                float(emp['absences']),
                float(emp['score_performance']),
                int(emp['category_id']),
                int(emp['poste_id'])
            ] for emp in employees_data])

            if labels is None:
                y = np.array([
                    1 if self._calculate_risk_score(emp)['risque'] else 0
                    for emp in employees_data
                ])
            else:
                y = np.array(labels)

            print(f"📊 Distribution labels: {sum(y)} risque / {len(y)-sum(y)} stable")

            try:
                X_train, X_test, y_train, y_test = train_test_split(
                    X, y, test_size=0.2, random_state=42, stratify=y
                )
            except ValueError:
                print("⚠️ stratify désactivé (une seule classe détectée)")
                X_train, X_test, y_train, y_test = train_test_split(
                    X, y, test_size=0.2, random_state=42
                )

            self.scaler    = StandardScaler()
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled  = self.scaler.transform(X_test)

            self.model = GradientBoostingClassifier(
                n_estimators=200, max_depth=5,
                learning_rate=0.1, random_state=42
            )
            self.model.fit(X_train_scaled, y_train)

            y_pred   = self.model.predict(X_test_scaled)
            accuracy = accuracy_score(y_test, y_pred)

            self.is_trained = True
            self._save_model()
            print(f"✅ Entraînement réussi — Accuracy: {accuracy:.2%}")
            return True

        except Exception as e:
            import traceback
            print(f"❌ Erreur entraînement: {e}")
            traceback.print_exc()
            return False

    def get_info(self):
        return {
            'sklearn_available': SKLEARN_AVAILABLE,
            'is_trained':        self.is_trained,
            'model_type':        'GradientBoosting' if self.is_trained else 'Business Logic',
            'features':          self.feature_names,
            'model_path':        MODEL_PATH if os.path.exists(MODEL_PATH) else None
        }


_predictor = RiskPredictor()

def predict_risque(data):
    return _predictor.predict(data)

def train_model(employees_data, labels=None):
    return _predictor.train(employees_data, labels)

def get_model_info():
    return _predictor.get_info()