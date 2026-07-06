from flask import Flask, render_template, request, redirect, session, url_for, jsonify
from flask_wtf.csrf import CSRFProtect, CSRFError, generate_csrf
from flask_cors import CORS
from datetime import timedelta, datetime, date
from functools import wraps
import email_utils
import sqlite3
import os
import bcrypt
import bleach
import re
import user_management as db
import calendar
from urllib.parse import urlparse


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'database', 'milofitness.db')

app = Flask(__name__)
app.config['SECRET_KEY'] = 'milofitness-secret-key-2026'

csrf = CSRFProtect(app)
CORS(app)

ALLOWED_REDIRECTS = {
    '/',
    '/2about',
    '/3programs',
    '/4merch',
    '/6login',
    '/7signup',
}

def is_safe_redirect_target(target):
    """Only allow redirecting to a small set of known, internal paths."""
    if not target:
        return False
    parsed = urlparse(target)
    if parsed.netloc or parsed.scheme:
        return False
    return target in ALLOWED_REDIRECTS


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
    testimonials = con.execute(
        '''SELECT * FROM testimonials
           WHERE (before_image IS NULL OR TRIM(before_image) = '')
             AND (after_image IS NULL OR TRIM(after_image) = '')
           ORDER BY id DESC'''
    ).fetchall()
    con.close()
    return render_template('1home.html', testimonials=testimonials)


@app.route('/success-stories')
def success_stories():
      con = get_db()
      testimonials = con.execute('SELECT * FROM testimonials ORDER BY id DESC').fetchall()
      con.close()
      return render_template('9client_testimonial.html', testimonials=testimonials)

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
            if user['is_admin']:
                # Admins skip 2FA entirely
                session['user'] = user['username']
                session['user_id'] = user['id']
                return redirect_after_auth(user['id'])

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

                
                session['user'] = user['username']
                session['user_id'] = user['id']
                return redirect_after_auth(user['id'])
            else:
                user_id  = session.pop('2fa_user_id')
                username = session.pop('2fa_username')
                db.set_verified(user_id)
                
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

@app.route('/my_timetable')
@login_required
def my_timetable():
    return render_template('client_timetable.html', username=session['user'])


@app.route('/api/client/timetable', methods=['GET'])
@login_required
def api_client_timetable():
    client_id = db.get_client_id_for_user(session['user_id'])
    if not client_id:
        return jsonify({'error': 'No client profile is linked to this account yet.'}), 400

    week_param = request.args.get('week')
    if week_param:
        try:
            anchor = date.fromisoformat(week_param)
        except ValueError:
            anchor = date.today()
    else:
        anchor = date.today()

    week_start = anchor - timedelta(days=anchor.weekday())
    week_dates = [week_start + timedelta(days=i) for i in range(7)]
    day_names_short = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

    prev_week = (week_start - timedelta(days=7)).isoformat()
    next_week = (week_start + timedelta(days=7)).isoformat()
    week_label = f"{week_dates[0].strftime('%b')} {week_dates[0].day} \u2013 {week_dates[6].strftime('%b')} {week_dates[6].day}, {week_dates[6].year}"

    week_days = [
        {'iso': d.isoformat(), 'day_name': day_names_short[i], 'day_num': d.day}
        for i, d in enumerate(week_dates)
    ]

    raw_rows = db.get_client_schedule(client_id)
    grid_slots = build_client_week_grid(raw_rows, week_dates, day_names_short)
    time_labels = build_time_labels()
    total_grid_height = round((DAY_END_MINUTES - DAY_START_MINUTES) * PIXELS_PER_MINUTE)

    return jsonify({
        'week_label': week_label,
        'prev_week': prev_week,
        'next_week': next_week,
        'week_days': week_days,
        'grid_slots': grid_slots,
        'time_labels': time_labels,
        'total_grid_height': total_grid_height
    })

def build_client_week_grid(raw_rows, week_dates, day_names_short):
    grid = {d.isoformat(): [] for d in week_dates}

    for row in raw_rows:
        start_min = time_to_minutes(row['start_time'])
        end_min = time_to_minutes(row['end_time'])

        clamped_start = max(start_min, DAY_START_MINUTES)
        clamped_end = min(end_min, DAY_END_MINUTES)

        slot = {
            'slot_id': row['slot_id'],
            'start_time': row['start_time'],
            'end_time': row['end_time'],
            'label': row['label'],
            'top_px': round((clamped_start - DAY_START_MINUTES) * PIXELS_PER_MINUTE),
            'height_px': max(round((clamped_end - clamped_start) * PIXELS_PER_MINUTE), 24)
        }

        if row['is_recurring']:
            target_date = week_dates[row['day_of_week']]
            day_label = day_names_short[row['day_of_week']]
            slot['slot_info'] = f"{day_label} {row['start_time']}\u2013{row['end_time']}"
            grid[target_date.isoformat()].append(slot)
        else:
            if row['specific_date'] in grid:
                d = date.fromisoformat(row['specific_date'])
                day_label = day_names_short[d.weekday()]
                slot['slot_info'] = f"{day_label} {d.month}/{d.day} {row['start_time']}\u2013{row['end_time']}"
                grid[row['specific_date']].append(slot)

    return grid

# ── Admin Timetable ───────────────────────────────────────

DAY_START_MINUTES = 6 * 60   # 6:00 AM
DAY_END_MINUTES = 21 * 60    # 9:00 PM
PIXELS_PER_MINUTE = 1.2


def time_to_minutes(time_str):
    h, m = map(int, time_str.split(':'))
    return h * 60 + m


def build_time_labels():
    labels = []
    minutes = DAY_START_MINUTES
    while minutes <= DAY_END_MINUTES:
        hour = minutes // 60
        minute = minutes % 60
        suffix = 'AM' if hour < 12 else 'PM'
        display_hour = hour if hour <= 12 else hour - 12
        if display_hour == 0:
            display_hour = 12
        labels.append({
            'top_px': round((minutes - DAY_START_MINUTES) * PIXELS_PER_MINUTE),
            'text': f'{display_hour}:{minute:02d} {suffix}'
        })
        minutes += 30
    return labels


def build_week_grid(raw_rows, week_dates, day_names_short):
    by_slot = {}

    for row in raw_rows:
        slot_id = row['slot_id']
        if slot_id not in by_slot:
            by_slot[slot_id] = {
                'slot_id': slot_id,
                'is_recurring': row['is_recurring'],
                'day_of_week': row['day_of_week'],
                'specific_date': row['specific_date'],
                'start_time': row['start_time'],
                'end_time': row['end_time'],
                'capacity': row['capacity'],
                'label': row['label'],
                'bookings': []
            }
        if row['booking_id']:
            by_slot[slot_id]['bookings'].append({
                'booking_id': row['booking_id'],
                'client_id': row['client_id'],
                'client_name': row['client_name']
            })

    grid = {d.isoformat(): [] for d in week_dates}

    for slot in by_slot.values():
        start_min = time_to_minutes(slot['start_time'])
        end_min = time_to_minutes(slot['end_time'])

        clamped_start = max(start_min, DAY_START_MINUTES)
        clamped_end = min(end_min, DAY_END_MINUTES)

        slot['top_px'] = round((clamped_start - DAY_START_MINUTES) * PIXELS_PER_MINUTE)
        slot['height_px'] = max(round((clamped_end - clamped_start) * PIXELS_PER_MINUTE), 24)

        if slot['is_recurring']:
            target_date = week_dates[slot['day_of_week']]
            day_label = day_names_short[slot['day_of_week']]
            slot['slot_info'] = f"{day_label} {slot['start_time']}\u2013{slot['end_time']}"
            grid[target_date.isoformat()].append(slot)
        else:
            if slot['specific_date'] in grid:
                d = date.fromisoformat(slot['specific_date'])
                day_label = day_names_short[d.weekday()]
                slot['slot_info'] = f"{day_label} {d.month}/{d.day} {slot['start_time']}\u2013{slot['end_time']}"
                grid[slot['specific_date']].append(slot)

    return grid


@app.route('/api/admin/timetable', methods=['GET'])
@admin_required
def api_admin_timetable():
    week_param = request.args.get('week')
    if week_param:
        try:
            anchor = date.fromisoformat(week_param)
        except ValueError:
            anchor = date.today()
    else:
        anchor = date.today()

    week_start = anchor - timedelta(days=anchor.weekday())
    week_dates = [week_start + timedelta(days=i) for i in range(7)]
    day_names_short = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

    prev_week = (week_start - timedelta(days=7)).isoformat()
    next_week = (week_start + timedelta(days=7)).isoformat()
    week_label = f"{week_dates[0].strftime('%b')} {week_dates[0].day} \u2013 {week_dates[6].strftime('%b')} {week_dates[6].day}, {week_dates[6].year}"

    week_days = [
        {'iso': d.isoformat(), 'day_name': day_names_short[i], 'day_num': d.day}
        for i, d in enumerate(week_dates)
    ]

    raw_rows = db.get_full_timetable()
    grid_slots = build_week_grid(raw_rows, week_dates, day_names_short)
    time_labels = build_time_labels()
    total_grid_height = round((DAY_END_MINUTES - DAY_START_MINUTES) * PIXELS_PER_MINUTE)

    clients = db.get_all_clients()
    clients_list = [{'id': c['id'], 'name': c['name']} for c in clients]

    return jsonify({
        'week_label': week_label,
        'prev_week': prev_week,
        'next_week': next_week,
        'week_days': week_days,
        'grid_slots': grid_slots,
        'time_labels': time_labels,
        'total_grid_height': total_grid_height,
        'clients': clients_list,
        'csrf_token': generate_csrf()
    })


@app.route('/admin/timetable', methods=['GET'])
@admin_required
def admin_timetable():
    return render_template('admin_timetable.html', username=session['user'])


@app.route('/api/admin/timetable/create_slot', methods=['POST'])
@admin_required
def api_admin_timetable_create_slot():
    data = request.get_json()

    is_recurring = data.get('is_recurring') == '1' or data.get('is_recurring') is True
    start_time = sanitize(data.get('start_time', ''))
    end_time = sanitize(data.get('end_time', ''))
    label = sanitize(data.get('label', ''))

    try:
        capacity = int(data.get('capacity', 1))
    except (ValueError, TypeError):
        capacity = 1

    day_of_week = None
    specific_date = None

    if is_recurring:
        try:
            day_of_week = int(data.get('day_of_week'))
        except (ValueError, TypeError):
            return jsonify({'success': False, 'message': 'Please select a day of the week.'}), 400
    else:
        specific_date = sanitize(data.get('specific_date', ''))
        if not specific_date:
            return jsonify({'success': False, 'message': 'Please select a date.'}), 400

    if not start_time or not end_time:
        return jsonify({'success': False, 'message': 'Start and end time are required.'}), 400

    db.create_slot(
        start_time=start_time,
        end_time=end_time,
        is_recurring=is_recurring,
        day_of_week=day_of_week,
        specific_date=specific_date,
        capacity=capacity,
        label=label
    )

    return jsonify({'success': True, 'message': 'Slot created.'})


@app.route('/api/admin/timetable/book', methods=['POST'])
@admin_required
def api_admin_timetable_book():
    data = request.get_json()
    slot_id = data.get('slot_id')
    client_id = data.get('client_id')

    if not slot_id or not client_id:
        return jsonify({'success': False, 'message': 'Missing slot or client.'}), 400

    success, message = db.book_client_into_slot(int(slot_id), int(client_id))

    if success:
        try:
            send_booking_email(int(slot_id), int(client_id))
        except Exception as e:
            # Booking itself already succeeded — don't fail the request over email.
            print(f"Booking email error: {e}")

    return jsonify({'success': success, 'message': message})


DAY_NAMES_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']


def format_time_12h(time_str):
    """'14:30' -> '2:30 PM'"""
    h, m = map(int, time_str.split(':'))
    suffix = 'AM' if h < 12 else 'PM'
    display_hour = h if h <= 12 else h - 12
    if display_hour == 0:
        display_hour = 12
    return f'{display_hour}:{m:02d} {suffix}'


def send_booking_email(slot_id, client_id):
    """Looks up the slot + client and emails the client a booking notification.
    Prefers the email on the linked user account (what they actually log in
    with) over the client profile email, which may be blank or out of date."""
    slot = db.get_slot_by_id(slot_id)
    client = db.get_client_by_id(client_id)

    if not slot or not client:
        return

    linked_user = db.get_user_by_client_id(client_id)
    to_email = (linked_user['email'] if linked_user else None) or client['email']

    if not to_email:
        return  # no account email and no profile email — nothing to send to

    if slot['is_recurring']:
        day_label = DAY_NAMES_FULL[slot['day_of_week']]
    else:
        d = date.fromisoformat(slot['specific_date'])
        day_label = d.strftime('%A %-d %B')  # e.g. "Wednesday 2 July"

    login_url = url_for('login', _external=True)

    email_utils.send_booking_notification_email(
        to_email=to_email,
        client_name=client['name'],
        day_label=day_label,
        start_time=format_time_12h(slot['start_time']),
        end_time=format_time_12h(slot['end_time']),
        label=slot['label'],
        login_url=login_url
    )


@app.route('/api/admin/timetable/cancel_booking', methods=['POST'])
@admin_required
def api_admin_timetable_cancel_booking():
    data = request.get_json()
    booking_id = data.get('booking_id')

    if not booking_id:
        return jsonify({'success': False, 'message': 'Missing booking id.'}), 400

    db.cancel_booking(int(booking_id))
    return jsonify({'success': True, 'message': 'Booking cancelled.'})


@app.route('/api/admin/timetable/cancel_slot', methods=['POST'])
@admin_required
def api_admin_timetable_cancel_slot():
    data = request.get_json()
    slot_id = data.get('slot_id')

    if not slot_id:
        return jsonify({'success': False, 'message': 'Missing slot id.'}), 400

    db.cancel_slot(int(slot_id))
    return jsonify({'success': True, 'message': 'Slot cancelled.'})
# ── Logout ─────────────────────────────────────────────────
@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))


if __name__ == '__main__':
    app.run(debug=True, port=5000)