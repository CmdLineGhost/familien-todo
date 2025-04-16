from flask import Flask, render_template, request, redirect, session, flash  # type: ignore
from flask_sqlalchemy import SQLAlchemy # type: ignore
from flask_bcrypt import Bcrypt # type: ignore

app = Flask(__name__)
app.secret_key = 'super_secret_key'  # Wichtig für Sessions und Flash

# SQLite-Datenbankkonfiguration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///todo.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)

# -------------------------------
# Datenbankmodelle
# -------------------------------

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

# -------------------------------
# Routen
# -------------------------------

@app.route('/')
def index():
    if 'user_id' in session:
        return redirect('/dashboard')
    return redirect('/login')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        email = request.form['email']
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            flash('Ein Benutzer mit dieser E-Mail existiert bereits.', 'error')
            return redirect('/register')
        
        password = bcrypt.generate_password_hash(request.form['password']).decode('utf-8')
        user = User(email=email, password=password)
        db.session.add(user)
        db.session.commit()
        session['user_id'] = user.id
        session['logged_in'] = True
        return redirect('/login')
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return render_template('login.html')
    email = request.form['email']
    password = request.form['password']
    user = User.query.filter_by(email=email).first()
    if user and bcrypt.check_password_hash(user.password, password):
        session['user_id'] = user.id
        session['logged_in'] = True
        return {
            'success': True,
            'name': email.split('@')[0].capitalize(),
            'is_admin': False
        }
    else:
        return {'success': False, 'message': 'Ungültige Login-Daten'}, 401

@app.route('/logout')
def logout():
    session.clear()
    return redirect('/login')

@app.route('/dashboard', methods=['GET', 'POST'])
def dashboard():
    if 'user_id' not in session:
        return redirect('/login')
    if request.method == 'POST':
        title = request.form['title']
        task = Task(title=title, user_id=session['user_id'])
        db.session.add(task)
        db.session.commit()
    tasks = Task.query.filter_by(user_id=session['user_id']).all()
    return render_template('login.html', tasks=tasks, show_app_content=True)

@app.route('/delete/<int:id>')
def delete(id):
    task = Task.query.get_or_404(id)
    if task.user_id == session.get('user_id'):
        db.session.delete(task)
        db.session.commit()
    return redirect('/dashboard')

@app.route('/check_login')
def check_login():
    return {'logged_in': 'user_id' in session}

# -------------------------------
# App starten (nur lokal)
# -------------------------------

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Erstellt Datenbanktabellen beim ersten Mal
    app.run(debug=True)
