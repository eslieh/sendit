from flask import Flask, jsonify, session, request, redirect, url_for
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt
from flask_restful import Api, Resource
from flask_bcrypt import Bcrypt
from flask_migrate import Migrate

from models import db, User, Courier, UserWallet, CourierWallet, Delivery, Pricing

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
app.config['SECRET_KEY'] = 'your_strong_secret_key'
app.config["JWT_SECRET_KEY"] = 'your_jwt_secret_key'
app.config['JWT_TOKEN_LOCATION'] = ['headers']

jwt = JWTManager(app)
db.init_app(app)
migrate = Migrate(app, db)

api = Api(app)
bcrypt = Bcrypt(app)


@app.route('/')
def index():
    return '<h1>Send it</h1>'

# Signup for Users
@app.route('/signup_user', methods=['POST'])
def signup_user():
    data = request.get_json()
    password = data['password']
    first_name = data['first_name']
    last_name = data['last_name']
    email = data['email']

    # Check if user already exists
    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'Email already exists'}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(password=hashed_password, first_name=first_name, last_name=last_name, email=email)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User created successfully'}), 201


# Signup for Couriers
@app.route('/signup_courier', methods=['POST'])
def signup_courier():
    data = request.get_json()
    password = data['password']
    first_name = data['first_name']
    last_name = data['last_name']
    email = data['email']

    # Check if courier already exists
    if Courier.query.filter_by(email=email).first():
        return jsonify({'message': 'Email already exists'}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_courier = Courier(password=hashed_password, first_name=first_name, last_name=last_name, email=email)

    db.session.add(new_courier)
    db.session.commit()

    return jsonify({'message': 'Courier created successfully'}), 201


# Login for Users and Couriers
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data[email]
    password = data['password']

    # Check for user first
    user = User.query.filter_by(email = email).first()
    if user and bcrypt.check_password_hash(user.password, password):
        access_token = create_access_token(identity=user.id)
        return jsonify({'message': 'Login Success', 'access_token': access_token, 'role': 'user'})

    # Check for courier if user not found
    courier = Courier.query.filter_by(email = email).first()
    if courier and bcrypt.check_password_hash(courier.password, password):
        access_token = create_access_token(identity=courier.id)
        return jsonify({'message': 'Login Success', 'access_token': access_token, 'role': 'courier'})

    return jsonify({'message': 'Login Failed'}), 401


# Get User Info (JWT protected)
@app.route('/get_name', methods=['GET'])
@jwt_required()
def get_name():
    # Extract the user ID from the JWT
    user_id = get_jwt_identity()
    user = User.query.filter_by(id=user_id).first()
    courier = Courier.query.filter_by(id=user_id).first()

    # Check if user or courier exists
    if user:
        return jsonify({'message': 'User found', 'name': user.first_name})
    elif courier:
        return jsonify({'message': 'Courier found', 'name': courier.first_name})
    else:
        return jsonify({'message': 'User or Courier not found'}), 404

if __name__ == '__main__':
    app.run(port=5000, debug=True)