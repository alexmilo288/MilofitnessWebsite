from flask import Flask, render_template, request, redirect, url_for, flash

app = Flask(__name__)
app.secret_key = 'milofitness_secret_key'


@app.route('/')
def home():
    return render_template('1home.html')

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

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/contact', methods=['POST'])
def contact():
    name = request.form.get('name')
    email = request.form.get('email')
    message = request.form.get('message')
    # TODO: send email to Alex or store in DB
    flash(f"Thanks {name}! Alex will be in touch soon.")
    return redirect(url_for('home') + '#contact')

if __name__ == '__main__':
    app.run(debug=True)
