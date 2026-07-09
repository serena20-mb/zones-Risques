"""
Tests basiques pour l'API FastAPI de prédiction de zones à risques (SafeZone).

À placer dans :
backend/scripts/test_api.py
"""

from fastapi.testclient import TestClient
from api_prediction import app   # Modifie l'import si ton fichier s'appelle autrement

client = TestClient(app)


def test_api_demarre():
    """Vérifie que l'API répond correctement."""
    response = client.get("/docs")
    assert response.status_code == 200


def test_endpoint_prediction_existe():
    """
    Vérifie que l'endpoint de prédiction existe.

    Adapte l'URL (/predict) si ton endpoint possède un autre nom.
    """

    payload = {
        "ville": "Lyon",
        "latitude": 45.75,
        "longitude": 4.85,
        "temperature": 22.5,
        "humidite": 60
    }

    response = client.post("/predict", json=payload)

    # 200 = succès
    # 422 = erreur de validation (payload différent)
    assert response.status_code in (200, 422)


def test_endpoint_inexistant_renvoie_404():
    """Une route inexistante doit renvoyer une erreur 404."""

    response = client.get("/route-qui-nexiste-pas")

    assert response.status_code == 404