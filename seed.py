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

testimonials = [
    ('Jake R.', 5, 'Alex completely transformed how I train. Down 12kg in 3 months.', None, None),
    ('Sarah M.', 5, 'Best investment I have made. The online coaching is next level.', None, None),
    ('Tom B.', 5, 'Strength is up across the board. Alex knows his stuff.', None, None),
]

conn.executemany(
    'INSERT INTO testimonials (name, rating, text, before_image, after_image) VALUES (?,?,?,?,?)',
    testimonials
)
conn.commit()
conn.close()
print("Done! Testimonials added.")