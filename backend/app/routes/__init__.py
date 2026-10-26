
from .auth import auth_bp
from .employees import employees_bp
from .dashboard import dashboard_bp
from .predict import predict_bp
from .users import users_bp
from .export import export_bp  

def register_blueprints(app):
    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(employees_bp, url_prefix="/api")
    app.register_blueprint(dashboard_bp, url_prefix="/api")
    app.register_blueprint(predict_bp, url_prefix="/api")
    app.register_blueprint(users_bp, url_prefix="/api")
    app.register_blueprint(export_bp, url_prefix="/api")  