import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'database', 'milofitness.db')


def get_db():
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    return con


def insert_user(username, email, hashed_password):
    con = get_db()
    try:
        con.execute(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            (username, email, hashed_password)
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