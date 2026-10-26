from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from ..services.dashboard_service import DashboardService

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def dashboard():
    stats = DashboardService.get_stats()
    return jsonify(stats), 200

@dashboard_bp.route('/categories', methods=['GET'])
@jwt_required()
def get_categories():
    categories = DashboardService.get_categories_with_postes()
    return jsonify(categories), 200
