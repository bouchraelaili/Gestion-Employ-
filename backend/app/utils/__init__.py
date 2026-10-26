# -*- coding: utf-8 -*-
from datetime import date, datetime

def serialize_row(row):
    if row is None:
        return None
    d = dict(row)
    for key, val in d.items():
        if isinstance(val, (date, datetime)):
            d[key] = val.isoformat()
        elif isinstance(val, bytes):
            d[key] = val.decode('utf-8', errors='ignore')
    return d

def format_currency(amount, currency='€'):
    if amount is None:
        return f"0.00 {currency}"
    return f"{float(amount):,.2f} {currency}".replace(',', ' ')

def validate_email(email):
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None
