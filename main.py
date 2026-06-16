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
app.config['SECRET_KEY'] = 'milofitness-secret-key-2024'
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


# ── Home ───────────────────────────────────────────────────
@app.route('/')
def home():
    con = get_db()
    testimonials = con.execute('SELECT * FROM testimonials').fetchall()
    con.close()
    return render_template('1home.html', testimonials=testimonials)


@app.route('/about')
def about():
    return render_template('about.html')


@app.route('/programs')
def programs():
    return render_template('programs.html')


@app.route('/merch')
def merch():
    return render_template('merch.html')


@app.route('/timetable')
def timetable():
    return render_template('timetable.html')


# ── Login ──────────────────────────────────────────────────
@app.route('/login', methods=['GET', 'POST'])
def login():
    if 'user' in session:
        return redirect(url_for('dashboard'))

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

    return render_template('login.html', error=error)


# ── Signup ─────────────────────────────────────────────────
@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if 'user' in session:
        return redirect(url_for('dashboard'))

    error = None
    if request.method == 'POST':
        username = sanitize(request.form.get('username', ''))
        email    = sanitize(request.form.get('email', ''))
        password = sanitize(request.form.get('password', ''))

        error = check_password_strength(password)
        if not error:
            hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
            success = db.insert_user(username, email, hashed)

            if not success:
                error = 'Username or email already exists.'
            else:
                user = db.get_user_by_username(username)
                code = email_utils.generate_code()
                session['2fa_code'] = code
                session['2fa_expires'] = (datetime.utcnow() + timedelta(minutes=10)).isoformat()
                session['2fa_user_id'] = user['id']
                session['2fa_username'] = user['username']

                try:
                    email_utils.send_verification_email(email, code, username)
                    return redirect(url_for('verify_2fa'))
                except Exception:
                    error = 'Account created but could not send email. Try logging in.'

    return render_template('signup.html', error=error)


# ── 2FA ────────────────────────────────────────────────────
@app.route('/verify', methods=['GET', 'POST'])
def verify_2fa():
    if '2fa_user_id' not in session:
        return redirect(url_for('login'))

    error = None
    if request.method == 'POST':
        entered = sanitize(request.form.get('code', ''))
        expires = datetime.fromisoformat(session.get('2fa_expires', '2000-01-01'))

        if datetime.utcnow() > expires:
            session.clear()
            return redirect(url_for('login'))

        if entered == session.get('2fa_code'):
            user_id  = session.pop('2fa_user_id')
            username = session.pop('2fa_username')
            session.pop('2fa_code', None)
            session.pop('2fa_expires', None)
            db.set_verified(user_id)
            session.permanent = True
            session['user'] = username
            session['user_id'] = user_id
            return redirect(url_for('dashboard'))
        else:
            error = 'Incorrect code. Please try again.'

    return render_template('verify_2fa.html', error=error)


# ── Dashboard ──────────────────────────────────────────────
@app.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html', username=session['user'])


# ── Logout ─────────────────────────────────────────────────
@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))


if __name__ == '__main__':
    app.run(debug=True, port=5000)