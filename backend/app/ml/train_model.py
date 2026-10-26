import sys
sys.path.append('.')

from app import app
from app.services.employee_service import EmployeeService
from app.ml.model import train_model

with app.app_context():
    employees = EmployeeService.get_all()
    
    employees_data = []
    for emp in employees:
        emp_dict = emp.to_dict() if hasattr(emp, 'to_dict') else emp
        employees_data.append({
            'age': emp_dict.get('age', 30),
            'anciennete': emp_dict.get('anciennete', 0),
            'salaire': emp_dict.get('salaire', 0),
            'absences': emp_dict.get('absences', 0),
            'score_performance': emp_dict.get('score_performance', 50),
            'category_id': emp_dict.get('category_id', 1),
            'poste_id': emp_dict.get('poste_id', 1)
        })
    
    success = train_model(employees_data)
    print("✅ Modèle entraîné !" if success else "❌ Échec")