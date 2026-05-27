from flask import Flask, render_template, request
from flask import send_from_directory

app = Flask(__name__)

#landing page 
@app.route("/")
def home():
    return render_template("index.html")



if __name__ == '__main__':
    app.run(debug=True)