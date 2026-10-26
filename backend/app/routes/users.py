from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from ..services.user_service import UserService

users_bp = Blueprint('users', __name__)

def check_admin():
    if get_jwt().get("role") != "admin":
        return jsonify({"error": "Acces refuse — Admin uniquement"}), 403
    return None

@users_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    error = check_admin()
    if error:
        return error
    users = UserService.get_all()
    return jsonify([u.to_dict() for u in users]), 200

@users_bp.route('/users/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    error = check_admin()
    if error:
        return error
    user = UserService.get_by_id(user_id)
    if not user:
        return jsonify({"error": "Utilisateur introuvable"}), 404
    return jsonify(user.to_dict()), 200

@users_bp.route('/users', methods=['POST'])
@jwt_required()
def create_user():
    error = check_admin()
    if error:
        return error
    data = request.get_json()
    try:
        user = UserService.create(
            email=data.get('email', ''),
            password=data.get('password', ''),
            role=data.get('role', 'rh')
        )
        return jsonify(user.to_dict()), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

@users_bp.route('/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    error = check_admin()
    if error:
        return error
    user = UserService.get_by_id(user_id)
    if not user:
        return jsonify({"error": "Utilisateur introuvable"}), 404
    data = request.get_json()
    try:
        updated = UserService.update(
            user_id=user_id,
            email=data.get('email'),
            password=data.get('password') or None,  
            role=data.get('role')
        )
        return jsonify(updated.to_dict()), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

@users_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    error = check_admin()
    if error:
        return error
    if not UserService.delete(user_id):
        return jsonify({"error": "Utilisateur introuvable"}), 404
    return jsonify({"message": f"Utilisateur {user_id} supprime"}), 200