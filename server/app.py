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
from routes.courier_stats import init_courier_stats

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
app.config['SECRET_KEY'] = 'your_strong_secret_key'
app.config["JWT_SECRET_KEY"] = 'your_jwt_secret_key'
app.config['JWT_TOKEN_LOCATION'] = ['headers']
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=2)

app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'your-email@gmail.com'
app.config['MAIL_PASSWORD'] = 'your-app-password'
app.config['MAIL_DEFAULT_SENDER'] = 'your-email@gmail.com'



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
init_courier_stats(app)
if __name__ == '__main__':
    app.run(port=5000, debug=True)
