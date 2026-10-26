from datetime import date
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from ..services.employee_service import EmployeeService
from ..services.ml_service import MLService

predict_bp = Blueprint('predict', __name__)


@predict_bp.route('/predict', methods=['POST'])
@jwt_required()
def predict():
    data = request.get_json()

    if data.get('employee_id'):
        emp = EmployeeService.get_by_id(data['employee_id'])
        if not emp:
            return jsonify({"error": "Employé introuvable"}), 404

        emp_data = emp.to_dict() if hasattr(emp, 'to_dict') else emp

        anciennete = emp_data.get('anciennete', 0)
        if not anciennete and emp_data.get('date_embauche'):
            try:
                from datetime import date
                dh = emp_data['date_embauche']
                if isinstance(dh, str):
                    dh = date.fromisoformat(dh[:10])
                anciennete = (date.today() - dh).days // 365
            except Exception:
                anciennete = 0

        predict_data = {
            'age':               int(emp_data.get('age') or 30),
            'anciennete':        int(anciennete or 0),
            'salaire':           float(emp_data.get('salaire') or 0),
            'absences':          int(emp_data.get('absences') or 0),
            'score_performance': int(emp_data.get('score_performance') or 50),
            'category_id':       int(emp_data.get('category_id') or 1),
            'poste_id':          int(emp_data.get('poste_id') or 1),
        }

        result = MLService.predict(predict_data)

        result['risque_depart'] = result.get('risque', False)

        result['employee'] = {
            'id':        emp_data.get('id'),
            'nom':       emp_data.get('nom'),
            'prenom':    emp_data.get('prenom'),
            'poste_nom': emp_data.get('poste_nom'),
        }

        if data.get('employee_id'):
            EmployeeService.update(
                data['employee_id'],
                {'risque_depart': result['risque_depart']}
            )

        return jsonify(result), 200

    else:
        required = ['age', 'anciennete', 'salaire', 'absences',
                    'score_performance', 'category_id', 'poste_id']
        for field in required:
            if field not in data:
                return jsonify({"error": f"Champ manquant: {field}"}), 400

        result = MLService.predict(data)

        result['risque_depart'] = result.get('risque', False)

        return jsonify(result), 200

@predict_bp.route('/predict/train', methods=['POST'])
@jwt_required()
def train():
    try:
        employees = EmployeeService.get_all()

        if not employees:
            return jsonify({"error": "Aucun employé en base"}), 400

        employees_data = []
        for emp in employees:
            emp_dict = emp.to_dict() if hasattr(emp, 'to_dict') else emp

            anciennete = emp_dict.get('anciennete', 0)
            if not anciennete and emp_dict.get('date_embauche'):
                try:
                    dh = emp_dict['date_embauche']
                    if isinstance(dh, str):
                        dh = date.fromisoformat(dh[:10])
                    anciennete = (date.today() - dh).days // 365
                except Exception:
                    anciennete = 0

            employees_data.append({
                'age':               int(emp_dict.get('age') or 30),
                'anciennete':        int(anciennete or 0),
                'salaire':           float(emp_dict.get('salaire') or 0),
                'absences':          int(emp_dict.get('absences') or 0),
                'score_performance': int(emp_dict.get('score_performance') or 50),
                'category_id':       int(emp_dict.get('category_id') or 1),
                'poste_id':          int(emp_dict.get('poste_id') or 1),
            })

        print(f"📊 {len(employees_data)} employés envoyés au ML")
        print(f"📋 Exemple : {employees_data[0]}")

        if len(employees_data) < 10:
            return jsonify({
                "error": f"Pas assez de données : {len(employees_data)} employés (minimum 10 requis)"
            }), 400

        success = MLService.train(employees_data)

        return jsonify({
            "success":      success,
            "message":      "✅ Modèle entraîné avec succès !" if success else "❌ Entraînement échoué",
            "nb_employees": len(employees_data)
        }), 200

    except Exception as e:
        import traceback
        print(f"❌ ERREUR /predict/train: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@predict_bp.route('/predict/info', methods=['GET'])
@jwt_required()
def info():
    return jsonify(MLService.get_info()), 200


@predict_bp.route('/predict/history/<int:emp_id>', methods=['GET'])
@jwt_required()
def history(emp_id):
    return jsonify([]), 200