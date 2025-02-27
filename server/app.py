from flask import Flask
from flask_jwt_extended import JWTManager
from flask_restful import Api
from flask_bcrypt import Bcrypt
from flask_migrate import Migrate
from models import db
from flask_cors import CORS
from datetime import timedelta


from routes.auth_routes import init_auth_routes
from routes.wallet_routes import init_wallet_routes
from routes.order_routes import init_order_routes
from routes.courier_routes import init_courier_routes

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
app.config['SECRET_KEY'] = 'your_strong_secret_key'
app.config["JWT_SECRET_KEY"] = 'your_jwt_secret_key'
app.config['JWT_TOKEN_LOCATION'] = ['headers']
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=2)

# # Initialize Flask-Mail
# app.config['MAIL_SERVER'] = 'localhost'
# app.config['MAIL_PORT'] = 1025  # Change to your local SMTP port
# app.config['MAIL_USE_TLS'] = False
# app.config['MAIL_USE_SSL'] = False
# app.config['MAIL_USERNAME'] = None
# app.config['MAIL_PASSWORD'] = None


jwt = JWTManager(app)
db.init_app(app)
migrate = Migrate(app, db)

api = Api(app)
bcrypt = Bcrypt(app)
CORS(app)



@app.route('/')
def index():
    return '<h1>Send it</h1>'

# Initialize routes
init_auth_routes(app, bcrypt)
init_wallet_routes(app)
init_order_routes(app)
init_courier_routes(app)

if __name__ == '__main__':
    app.run(port=5000, debug=True)
