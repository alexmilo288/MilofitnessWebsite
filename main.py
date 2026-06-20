from flask import Flask, render_template, request, redirect, session, url_for
from flask_wtf.csrf import CSRFProtect, CSRFError
from flask_cors import CORS
from datetime import timedelta, datetime
from functools import wraps
import email_utils
import sqlite3
import os
import bcrypt
import bleach
import re
import user_management as db


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'database', 'milofitness.db')

app = Flask(__name__)
app.config['SECRET_KEY'] = 'milofitness-secret-key-2026'
app.permanent_session_lifetime = timedelta(minutes=30)
csrf = CSRFProtect(app)
CORS(app)


def get_db():
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    return con


@app.after_request
def add_security_headers(response):
    response.headers['X-Frame-Options'] = 'SAMEORIGIN'
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    return response


@app.errorhandler(CSRFError)
def handle_csrf_error(e):
    return redirect(url_for('login'))


def sanitize(value):
    return bleach.clean(value, tags=[], attributes={}, strip=True)


def check_password_strength(password):
    if len(password) < 8:
        return 'Password must be at least 8 characters'
    if not re.search(r'[A-Z]', password):
        return 'Password must contain at least one uppercase letter'
    if not re.search(r'[a-z]', password):
        return 'Password must contain at least one lowercase letter'
    if not re.search(r'[0-9]', password):
        return 'Password must contain at least one number'
    if not re.search(r'[!@#$%^&*(),.?\":{}|<>]', password):
        return 'Password must contain at least one special character'
    return None


def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user' not in session:
            return redirect(url_for('login'))
        user = db.get_user_by_id(session['user_id'])
        if not user or not user['is_admin']:
            return redirect(url_for('dashboard'))
        return f(*args, **kwargs)
    return decorated

def redirect_after_auth(user_id):
    user = db.get_user_by_id(user_id)
    if user and user['is_admin']:
        return redirect(url_for('admin_dashboard'))
    return redirect(url_for('dashboard'))




# ── Home ───────────────────────────────────────────────────
@app.route('/')
def home():
    con = get_db()
    testimonials = con.execute('SELECT * FROM testimonials').fetchall()
    con.close()
    return render_template('1home.html', testimonials=testimonials)


@app.route('/2about')
def about():
    return render_template('2about.html')


@app.route('/3programs')
def programs():
    status = request.args.get('status')
    return render_template('3programs.html', status=status)


@app.route('/4merch')
def merch():
    return render_template('4merch.html')


@app.route('/timetable')
def timetable():
    return render_template('timetable.html')


@app.route('/contact', methods=['POST'])
def contact():
    name    = sanitize(request.form.get('name', ''))
    email   = sanitize(request.form.get('email', ''))
    program = sanitize(request.form.get('program', ''))
    message = sanitize(request.form.get('message', ''))

    try:
        email_utils.send_contact_email(name, email, program, message)
        status = 'success'
    except Exception as e:
        print(f"Email error: {e}")  
        status = 'error'

    return redirect(url_for('programs', status=status))

# ── Login ──────────────────────────────────────────────────
@app.route('/6login', methods=['GET', 'POST'])
def login():
    if 'user' in session:
        return redirect_after_auth(session['user_id'])
    

    error = None
    if request.method == 'POST':
        username = sanitize(request.form.get('username', ''))
        password = sanitize(request.form.get('password', ''))
        user = db.get_user_by_username(username)

        if user and bcrypt.checkpw(password.encode(), user['password'].encode()):
            code = email_utils.generate_code()
            session['2fa_code'] = code
            session['2fa_expires'] = (datetime.utcnow() + timedelta(minutes=10)).isoformat()
            session['2fa_user_id'] = user['id']
            session['2fa_username'] = user['username']

            try:
                email_utils.send_verification_email(user['email'], code, user['username'])
                return redirect(url_for('verify_2fa'))
            except Exception:
                error = 'Could not send verification email. Please try again.'
        else:
            error = 'Invalid username or password.'

    return render_template('6login.html', error=error)


# ── Signup ─────────────────────────────────────────────────
@app.route('/7signup', methods=['GET', 'POST'])
def signup():
    if 'user' in session:
        return redirect(url_for('5client_dashboard'))

    error = None
    if request.method == 'POST':
        username = sanitize(request.form.get('username', ''))
        email    = sanitize(request.form.get('email', ''))
        password = sanitize(request.form.get('password', ''))
        client_code = sanitize(request.form.get('client_code', '')).upper().strip()

        error = check_password_strength(password)

        if not error and db.username_or_email_exists(username, email):
            error = 'Username or email already exists.'

        code_row = None
        if not error:
            code_row = db.validate_client_code(client_code)
            if not code_row:
                error = 'Invalid or already-used client code.'

        if not error:
            hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
            code = email_utils.generate_code()

            # Stage the signup — nothing is written to the DB yet
            session['pending_signup'] = {
                'username': username,
                'email': email,
                'password': hashed,
                'client_code': client_code,
                'client_id': code_row['client_id']
            }
            session['2fa_code'] = code
            session['2fa_expires'] = (datetime.utcnow() + timedelta(minutes=10)).isoformat()

            try:
                email_utils.send_verification_email(email, code, username)
                return redirect(url_for('verify_2fa'))
            except Exception:
                session.pop('pending_signup', None)
                session.pop('2fa_code', None)
                session.pop('2fa_expires', None)
                error = 'Could not send verification email. Try again.'

    return render_template('7signup.html', error=error)




# ── 2FA ────────────────────────────────────────────────────
@app.route('/verify_2fa', methods=['GET', 'POST'])
def verify_2fa():
    if '2fa_code' not in session:
        return redirect(url_for('login'))

    error = None
    if request.method == 'POST':
        entered = sanitize(request.form.get('code', ''))
        expires = datetime.fromisoformat(session.get('2fa_expires', '2000-01-01'))

        if datetime.utcnow() > expires:
            session.clear()
            return redirect(url_for('login'))

        if entered == session.get('2fa_code'):
            session.pop('2fa_code', None)
            session.pop('2fa_expires', None)

            pending = session.pop('pending_signup', None)

            if pending:
                success = db.insert_user(
                    pending['username'],
                    pending['email'],
                    pending['password'],
                    pending.get('client_id')
                )
                if not success:
                    error = 'Username or email already exists.'
                    return render_template('verify_2fa.html', error=error)

                user = db.get_user_by_username(pending['username'])
                db.set_verified(user['id'])

                # Redeem the client code now that the account is real
                if pending.get('client_code'):
                    db.redeem_client_code(pending['client_code'], user['id'])

                session.permanent = True
                session['user'] = user['username']
                session['user_id'] = user['id']
                return redirect_after_auth(user['id'])
            else:
                user_id  = session.pop('2fa_user_id')
                username = session.pop('2fa_username')
                db.set_verified(user_id)
                session.permanent = True
                session['user'] = username
                session['user_id'] = user_id
                return redirect_after_auth(user_id)
        else:
            error = 'Incorrect code. Please try again.'

    return render_template('8verify_2fa.html', error=error)

# ── Dashboard ──────────────────────────────────────────────
@app.route('/client_dashboard')
@login_required
def dashboard():
    return render_template('5client_dashboard.html', username=session['user'])

@app.route('/admin_dashboard', methods=['GET', 'POST'])
@admin_required
def admin_dashboard():
    new_code = None

    if request.method == 'POST':
        name = sanitize(request.form.get('name', ''))
        email = sanitize(request.form.get('email', ''))
        notes = sanitize(request.form.get('notes', ''))

        profile_fields = {}
        for field in db.CLIENT_PROFILE_FIELDS:
            profile_fields[field] = sanitize(request.form.get(field, ''))

        if name:
            client_id, new_code = db.create_client_with_code(name, email, notes, **profile_fields)

    clients = db.get_all_clients()
    active_codes = db.count_active_codes()
    linked_accounts = db.count_linked_accounts()

    clients_with_age = []
    for client in clients:
        client_dict = dict(client)
        client_dict['age'] = db.calculate_age(client['date_of_birth'])
        clients_with_age.append(client_dict)

    return render_template(
        'admin_dashboard.html',
        clients=clients_with_age,
        username=session['user'],
        new_code=new_code,
        active_codes=active_codes,
        linked_accounts=linked_accounts
    )

# ── Logout ─────────────────────────────────────────────────
@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))


if __name__ == '__main__':
    app.run(debug=True, port=5000)