from flask import Flask
from flask_jwt_extended import JWTManager
from flask_restful import Api
from flask_bcrypt import Bcrypt
from flask_migrate import Migrate
from models import db
from flask_cors import CORS
from flask_mail import Mail
from flask_socketio import SocketIO


from routes.auth_routes import init_auth_routes
from routes.wallet_routes import init_wallet_routes
from routes.order_routes import init_order_routes
from routes.courier_routes import init_courier_routes

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
app.config['SECRET_KEY'] = 'your_strong_secret_key'
app.config["JWT_SECRET_KEY"] = 'your_jwt_secret_key'
app.config['JWT_TOKEN_LOCATION'] = ['headers']
# Initialize Flask-Mail
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'your-email@gmail.com'  # Replace with your email
app.config['MAIL_PASSWORD'] = 'your-app-password'     # Replace with app password

jwt = JWTManager(app)
db.init_app(app)
migrate = Migrate(app, db)

api = Api(app)
bcrypt = Bcrypt(app)
CORS(app)
mail = Mail(app)
socketio = SocketIO(app, cors_allowed_origins="*")

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
