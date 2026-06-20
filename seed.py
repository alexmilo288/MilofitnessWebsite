import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'database', 'milofitness.db')

conn = sqlite3.connect(DB_PATH)

conn.execute('''
    CREATE TABLE IF NOT EXISTS testimonials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        rating INTEGER NOT NULL,
        text TEXT NOT NULL,
        before_image TEXT,
        after_image TEXT
    )
''')

conn.execute('''
    CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT,
        notes TEXT,
        date_of_birth TEXT,
        phone TEXT,
        emergency_contact_name TEXT,
        emergency_contact_phone TEXT,
        medical_conditions TEXT,
        injuries_surgeries TEXT,
        medications TEXT,
        allergies TEXT,
        doctor_notes TEXT,
        fitness_goals TEXT,
        height TEXT,
        weight TEXT,
        body_measurements TEXT,
        body_fat_percentage TEXT,
        strength_test_notes TEXT,
        flexibility_test_notes TEXT,
        cardio_test_notes TEXT,
        mobility_assessment_notes TEXT,
        occupation TEXT,
        activity_level TEXT,
        sleep_habits TEXT,
        exercise_history TEXT,
        dietary_habits TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
''')

conn.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        is_verified INTEGER DEFAULT 0,
        is_admin INTEGER DEFAULT 0,
        client_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients(id)
    )
''')

conn.execute('''
    CREATE TABLE IF NOT EXISTS client_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER NOT NULL,
        code TEXT NOT NULL UNIQUE,
        used INTEGER DEFAULT 0,
        used_by_user_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        used_at TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients(id),
        FOREIGN KEY (used_by_user_id) REFERENCES users(id)
    )
''')

conn.commit()
conn.close()
print("Done! clients, users, and client_codes tables ready.")