from flask import Flask, render_template, request, redirect, session, flash, jsonify  # type: ignore
from flask_sqlalchemy import SQLAlchemy # type: ignore
from flask_bcrypt import Bcrypt # type: ignore
from datetime import datetime

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
    is_admin = db.Column(db.Boolean, default=False)
    tasks = db.relationship('Task', backref='user', lazy=True)

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    completed = db.Column(db.Boolean, default=False)
    due_date = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
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
            'is_admin': user.is_admin
        }
    else:
        return {'success': False, 'message': 'Ungültige Login-Daten'}, 401

@app.route('/logout')
def logout():
    session.clear()
    return redirect('/login')

@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect('/login')
    tasks = Task.query.filter_by(user_id=session['user_id']).all()
    return render_template('login.html', tasks=tasks, show_app_content=True)

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    if 'user_id' not in session:
        return jsonify({'error': 'Nicht eingeloggt'}), 401
    
    tasks = Task.query.filter_by(user_id=session['user_id']).all()
    tasks_list = []
    for task in tasks:
        tasks_list.append({
            'id': task.id,
            'title': task.title,
            'description': task.description,
            'completed': task.completed,
            'due_date': task.due_date.isoformat() if task.due_date else None,
            'created_at': task.created_at.strftime('%H:%M')
        })
    return jsonify(tasks_list)

@app.route('/api/tasks', methods=['POST'])
def create_task():
    if 'user_id' not in session:
        return jsonify({'error': 'Nicht eingeloggt'}), 401
    
    data = request.json
    if not data or 'title' not in data:
        return jsonify({'error': 'Titel ist erforderlich'}), 400
    
    task = Task(
        title=data['title'],
        description=data.get('description', ''),
        user_id=session['user_id']
    )
    
    if 'due_date' in data and data['due_date']:
        task.due_date = datetime.strptime(data['due_date'], '%Y-%m-%d').date()
    
    db.session.add(task)
    db.session.commit()
    
    return jsonify({
        'id': task.id,
        'title': task.title,
        'description': task.description,
        'completed': task.completed,
        'due_date': task.due_date.isoformat() if task.due_date else None,
        'created_at': task.created_at.strftime('%H:%M')
    })

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    if 'user_id' not in session:
        return jsonify({'error': 'Nicht eingeloggt'}), 401
    
    task = Task.query.get_or_404(task_id)
    if task.user_id != session['user_id']:
        return jsonify({'error': 'Keine Berechtigung'}), 403
    
    data = request.json
    if 'title' in data:
        task.title = data['title']
    if 'description' in data:
        task.description = data['description']
    if 'completed' in data:
        task.completed = data['completed']
    if 'due_date' in data:
        task.due_date = datetime.strptime(data['due_date'], '%Y-%m-%d').date() if data['due_date'] else None
    
    db.session.commit()
    return jsonify({
        'id': task.id,
        'title': task.title,
        'description': task.description,
        'completed': task.completed,
        'due_date': task.due_date.isoformat() if task.due_date else None,
        'created_at': task.created_at.strftime('%H:%M')
    })

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    if 'user_id' not in session:
        return jsonify({'error': 'Nicht eingeloggt'}), 401
    
    task = Task.query.get_or_404(task_id)
    if task.user_id != session['user_id']:
        return jsonify({'error': 'Keine Berechtigung'}), 403
    
    db.session.delete(task)
    db.session.commit()
    return jsonify({'message': 'Aufgabe gelöscht'})

# -------------------------------
# App starten (nur lokal)
# -------------------------------

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Erstellt Datenbanktabellen beim ersten Mal
    app.run(debug=True, port=5001)
