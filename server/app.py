from flask import request
from flask_restful import Resource

from config import app, db, api

@app.route('/')
def index():
    return '<h1>Send it</h1>'

if __name__ == '__main__':
    app.run(port=5000, debug=True)