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
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        is_verified INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
''')

testimonials = [
    ('Jake R.', 5, 'Alex completely transformed how I train. Down 12kg in 3 months.', None, None),
    ('Sarah M.', 5, 'Best investment I have made. The online coaching is next level.', None, None),
    ('Tom B.', 5, 'Strength is up across the board. Alex knows his stuff.', None, None),
]

conn.executemany(
    'INSERT OR IGNORE INTO testimonials (name, rating, text, before_image, after_image) VALUES (?,?,?,?,?)',
    testimonials
)

conn.commit()
conn.close()
print("Done! Users table added.")