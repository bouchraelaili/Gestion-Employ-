from ..ml.model import predict_risque as ml_predict, get_model_info, train_model

class MLService:

    @staticmethod
    def predict(data):
        return ml_predict(data)

    @staticmethod
    def get_info():
        return get_model_info()

    @staticmethod
    def train(employees_data, labels=None):
        print(f"📊 Nombre d'employés: {len(employees_data)}")
        return train_model(employees_data, labels)