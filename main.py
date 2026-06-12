import os
import sqlite3
from flask import Flask, render_template, request, redirect, url_for, flash

app = Flask(__name__)
app.secret_key = 'milofitness_secret_key'

DB_PATH = 'database/milofitness.db'

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def home():
    db = get_db()
    testimonials = db.execute('SELECT * FROM testimonials').fetchall()
    db.close()
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

@app.route('/login')
def login():
    return render_template('login.html')

if __name__ == '__main__':
    app.run(debug=True)