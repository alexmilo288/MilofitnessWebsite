import sqlite3
import os
import secrets
import string
from datetime import date

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'database', 'milofitness.db')


def get_db():
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    return con


# ── Users ──────────────────────────────────────────────────

def insert_user(username, email, hashed_password, client_id=None):
    con = get_db()
    try:
        con.execute(
            'INSERT INTO users (username, email, password, client_id) VALUES (?, ?, ?, ?)',
            (username, email, hashed_password, client_id)
        )
        con.commit()
        return True
    except sqlite3.IntegrityError:
        return False
    finally:
        con.close()


def get_user_by_username(username):
    con = get_db()
    user = con.execute(
        'SELECT * FROM users WHERE username = ?', (username,)
    ).fetchone()
    con.close()
    return user


def get_user_by_id(user_id):
    con = get_db()
    user = con.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()
    con.close()
    return user


def set_verified(user_id):
    con = get_db()
    con.execute('UPDATE users SET is_verified = 1 WHERE id = ?', (user_id,))
    con.commit()
    con.close()


def username_or_email_exists(username, email):
    con = get_db()
    row = con.execute(
        'SELECT 1 FROM users WHERE username = ? OR email = ?',
        (username, email)
    ).fetchone()
    con.close()
    return row is not None


def make_user_admin(user_id):
    """One-off use: promote a user to admin."""
    con = get_db()
    con.execute('UPDATE users SET is_admin = 1 WHERE id = ?', (user_id,))
    con.commit()
    con.close()


# ── Clients ────────────────────────────────────────────────

CLIENT_PROFILE_FIELDS = [
    'date_of_birth', 'phone', 'emergency_contact_name', 'emergency_contact_phone',
    'medical_conditions', 'injuries_surgeries', 'medications', 'allergies', 'doctor_notes',
    'fitness_goals', 'height', 'weight', 'body_measurements', 'body_fat_percentage',
    'strength_test_notes', 'flexibility_test_notes', 'cardio_test_notes', 'mobility_assessment_notes',
    'occupation', 'activity_level', 'sleep_habits', 'exercise_history', 'dietary_habits'
]


def get_all_clients():
    con = get_db()
    clients = con.execute('SELECT * FROM clients ORDER BY created_at DESC').fetchall()
    con.close()
    return clients


def get_client_by_id(client_id):
    con = get_db()
    client = con.execute('SELECT * FROM clients WHERE id = ?', (client_id,)).fetchone()
    con.close()
    return client


def generate_client_code():
    """Generates a code like MILO-7F3K"""
    chars = string.ascii_uppercase + string.digits
    suffix = ''.join(secrets.choice(chars) for _ in range(4))
    return f"MILO-{suffix}"


def create_client_with_code(name, email="", notes="", **fields):
    """Creates a client AND a one-time signup code for them. Returns (client_id, code).
    fields can include any key listed in CLIENT_PROFILE_FIELDS.
    """
    columns = ['name', 'email', 'notes'] + CLIENT_PROFILE_FIELDS
    values = [name, email, notes] + [fields.get(f, '') for f in CLIENT_PROFILE_FIELDS]

    placeholders = ', '.join(['?'] * len(columns))
    column_names = ', '.join(columns)

    con = get_db()
    cur = con.execute(
        f'INSERT INTO clients ({column_names}) VALUES ({placeholders})',
        values
    )
    client_id = cur.lastrowid

    code = generate_client_code()
    while con.execute('SELECT 1 FROM client_codes WHERE code = ?', (code,)).fetchone():
        code = generate_client_code()

    con.execute(
        'INSERT INTO client_codes (client_id, code) VALUES (?, ?)',
        (client_id, code)
    )
    con.commit()
    con.close()
    return client_id, code


def calculate_age(date_of_birth):
    """Returns age as an int from a YYYY-MM-DD string, or None if missing/invalid."""
    if not date_of_birth:
        return None
    try:
        dob = date.fromisoformat(date_of_birth)
        today = date.today()
        return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
    except ValueError:
        return None


# ── Client codes ───────────────────────────────────────────

def validate_client_code(code):
    """Returns the client_codes row if valid + unused, else None."""
    con = get_db()
    row = con.execute(
        'SELECT * FROM client_codes WHERE code = ? AND used = 0', (code,)
    ).fetchone()
    con.close()
    return row


def redeem_client_code(code, user_id):
    """Marks a code as used. Call only after the user account is actually created."""
    con = get_db()
    con.execute(
        'UPDATE client_codes SET used = 1, used_by_user_id = ?, used_at = CURRENT_TIMESTAMP WHERE code = ?',
        (user_id, code)
    )
    con.commit()
    con.close()


def count_active_codes():
    con = get_db()
    row = con.execute('SELECT COUNT(*) as c FROM client_codes WHERE used = 0').fetchone()
    con.close()
    return row['c']


def count_linked_accounts():
    con = get_db()
    row = con.execute('SELECT COUNT(*) as c FROM users WHERE client_id IS NOT NULL').fetchone()
    con.close()
    return row['c']