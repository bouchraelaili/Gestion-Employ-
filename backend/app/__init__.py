from datetime import timedelta
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager

jwt = JWTManager()

def create_app():
    app = Flask(__name__)

    #  Config 
    app.config["JWT_SECRET_KEY"] = "gestion-rh-secret-key-2026-ultra-secure-32-bytes"
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=8)

    #  CORS 
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:5173"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    #  JWT 
    jwt.init_app(app)

    #  Blueprints 
    from app.routes import register_blueprints
    register_blueprints(app)

    #  Route de base 
    @app.route("/")
    def index():
        return jsonify({"message": "Gestion RH API is running"})

    return app