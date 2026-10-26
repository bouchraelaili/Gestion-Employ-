from flask import Blueprint, send_file, jsonify
from flask_jwt_extended import jwt_required
from ..services.export_service import ExportService

export_bp = Blueprint('export', __name__)

@export_bp.route('/export/excel', methods=['GET'])
@jwt_required()
def export_excel():
    try:
        output = ExportService.generate_excel()
        return send_file(
            output,
            mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            as_attachment=True,
            download_name="employes.xlsx"
        )
    except ImportError as e:
        return jsonify({"error": str(e)}), 503
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@export_bp.route('/export/pdf', methods=['GET'])
@jwt_required()
def export_pdf():
    try:
        output = ExportService.generate_pdf()
        return send_file(
            output,
            mimetype="application/pdf",
            as_attachment=True,
            download_name="rapport_rh.pdf"
        )
    except ImportError as e:
        return jsonify({"error": str(e)}), 503
    except Exception as e:
        return jsonify({"error": str(e)}), 500