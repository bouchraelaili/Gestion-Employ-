# -*- coding: utf-8 -*-
import psycopg2
import psycopg2.extras
from datetime import date, datetime


def get_db():
    try:
        conn = psycopg2.connect(
            host="localhost",
            database="GestionSystem",
            user="postgres",
            password="aa147258",
            port=5432
        )
        return conn
    except Exception as e:
        print("ERREUR CONNEXION DB:", str(e))
        raise


def row_to_dict(row):
    """Convertit une ligne psycopg2 (RealDictRow) en dict JSON-safe."""
    d = dict(row)
    for key, val in d.items():
        if isinstance(val, (date, datetime)):
            d[key] = val.isoformat()
    return d