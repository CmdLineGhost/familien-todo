Familien Todo Projekt 🏡

Dieses Projekt ist ein einfacher Familien-Organizer mit Login-, Registrierungs- und Aufgabenverwaltungssystem – basierend auf Flask, SQLite und HTML/CSS/JS.

⸻

📚 Projektstruktur

familien_todo_flask/
├── app.py                 # Hauptserver
├── templates/            # HTML-Dateien (login.html, register.html)
├── static/               # CSS und JS (style.css, script.js)
├── instance/             # SQLite-Datenbank
├── venv/                 # Virtuelle Umgebung (nicht hochladen!)
├── website.gitignore     # .gitignore-Datei



⸻

🚀 Starten des Projekts (lokal)

# Virtuelle Umgebung aktivieren (macOS/Linux)
source venv/bin/activate

# Server starten
python3 app.py

Dann im Browser aufrufen: http://127.0.0.1:5000

⸻

🔑 Login-Daten

Du kannst dich registrieren oder bestehende Nutzer in der SQLite-Datenbank anlegen.

⸻

🛠️ Entwicklung mit Git & GitHub

📉 Regeln:
	•	Nicht direkt auf main arbeiten!
	•	Arbeite immer in einem eigenen Feature-Branch (siehe unten).
	•	Pull Request stellen und mergen lassen.

🌐 Feature-Branch erstellen

git checkout -b feature/neue-funktion

📄 Änderungen committen & pushen

git add .
git commit -m "Neue Funktion erstellt"
git push origin feature/neue-funktion

Dann auf GitHub einen Pull Request erstellen.

⸻

⛓️ Branch-Schutz

Der main-Branch ist geschützt:
	•	Pushes direkt auf main sind blockiert
	•	Alle Änderungen müssen per Pull Request erfolgen

⸻

🌐 Deployment (optional)

Später möglich mit Render, Railway, Fly.io oder Heroku

⸻

⚡ Hinweise
	•	Die virtuelle Umgebung venv/ und die Datei todo.db werden nicht mit hochgeladen
	•	Stelle sicher, dass dein website.gitignore folgende Einträge hat:

__pycache__/
*.pyc
*.db
instance/
.env
venv/
*.sqlite3



⸻

🚀 Autor & Idee

Marcello & Team

⸻

Viel Spaß beim Coden! 🚀📚🎨
