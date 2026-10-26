import sys
import os
import io

if sys.platform == "win32":
    import locale
    locale.setlocale(locale.LC_ALL, 'C')
    os.environ["PYTHONUTF8"] = "1"

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

from app import create_app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=5000)