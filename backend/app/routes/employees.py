from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from ..services.employee_service import EmployeeService

employees_bp = Blueprint('employees', __name__)

@employees_bp.route('/employees', methods=['GET'])
@jwt_required()
def get_employees():
    filters = {
        'category_id': request.args.get('category_id'),
        'poste_id': request.args.get('poste_id'),
        'risque_depart': request.args.get('risque_depart'),
        'search': request.args.get('search', ''),
        'categorie_nom': request.args.get('categorie_nom')
    }
    if filters['risque_depart'] is not None:
        filters['risque_depart'] = filters['risque_depart'].lower() == 'true'
    
    employees = EmployeeService.get_all(filters)
    return jsonify([e.to_dict() for e in employees]), 200

@employees_bp.route('/employees/<int:emp_id>', methods=['GET'])
@jwt_required()
def get_employee(emp_id):
    emp = EmployeeService.get_by_id(emp_id)
    if not emp:
        return jsonify({"error": "Employe introuvable"}), 404
    return jsonify(emp.to_dict()), 200

@employees_bp.route('/employees', methods=['POST'])
@jwt_required()
def create_employee():
    try:
        emp = EmployeeService.create(request.get_json())
        return jsonify(emp.to_dict()), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

@employees_bp.route('/employees/<int:emp_id>', methods=['PUT'])
@jwt_required()
def update_employee(emp_id):
    emp = EmployeeService.update(emp_id, request.get_json())
    if not emp:
        return jsonify({"error": "Employe introuvable"}), 404
    return jsonify(emp.to_dict()), 200

@employees_bp.route('/employees/<int:emp_id>', methods=['DELETE'])
@jwt_required()
def delete_employee(emp_id):
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"error": "Acces refuse — Admin uniquement"}), 403
    
    if not EmployeeService.delete(emp_id):
        return jsonify({"error": "Employe introuvable"}), 404
    return jsonify({"message": f"Employe {emp_id} supprime"}), 200

@employees_bp.route('/categories', methods=['GET'])
@jwt_required()
def get_categories():
    categories = EmployeeService.get_categories()
    return jsonify(categories), 200

@employees_bp.route('/postes', methods=['GET'])
@jwt_required()
def get_postes():
    postes = EmployeeService.get_postes()
    return jsonify(postes), 200