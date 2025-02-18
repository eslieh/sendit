from flask import Flask, jsonify, request
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt
from flask_restful import Api, Resource
from flask_bcrypt import Bcrypt
from flask_migrate import Migrate
from decimal import Decimal

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

# AUTHENTICATION

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

    # Create user
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(password=hashed_password, first_name=first_name, last_name=last_name, email=email)

    db.session.add(new_user)
    db.session.commit()

    # Create a wallet for user
    user_wallet = UserWallet(user_id=new_user.id, balance=0.00)
    db.session.add(user_wallet)
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

    # Create a new courier
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_courier = Courier(password=hashed_password, first_name=first_name, last_name=last_name, email=email)

    db.session.add(new_courier)
    db.session.commit()

    #Create wallet for courier
    courier_wallet = CourierWallet(courier_id=new_courier.id, balance=0.00)
    db.session.add(courier_wallet)
    db.session.commit()

    return jsonify({'message': 'Courier created successfully'}), 201


# Login for Users and Couriers
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    if 'email' not in data or 'password' not in data:
        return jsonify({'message': 'Missing email or password'}), 400

    email = data['email']
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

#  WALLET

# Check wallet balance for user or courier
@app.route('/wallet/balance', methods=['GET'])
@jwt_required()
def check_wallet_balance():
    user_id = get_jwt_identity()

    user = User.query.filter_by(id=user_id).first()
    courier = Courier.query.filter_by(id=user_id).first()

    if user and user.wallet:
        return jsonify({"message": "User wallet balance", "balance": float(user.wallet.balance)}), 200
    elif courier and courier.wallet:
        return jsonify({"message": "Courier wallet balance", "balance": float(courier.wallet.balance)}), 200
    else:
        return jsonify({"message": "Wallet not found"}), 404

# Deposit Funds to User Wallet
@app.route('/wallet/deposit', methods=['POST'])
@jwt_required()
def deposit_funds():
    user_id = get_jwt_identity()
    data = request.get_json()
    amount = (data.get('amount'))

    if amount <= 0:
        return jsonify({"message": "Invalid deposit amount"}), 400

    user = User.query.filter_by(id=user_id).first()
    if not user:
        return jsonify({"message": "User not found"}), 404

    if not user.wallet:
        user.wallet = UserWallet(user_id=user.id, balance=0.00)

    user.wallet.balance += Decimal(str(amount))
    db.session.commit()
    
    return jsonify({"message": "Deposit successful", "new_balance": float(user.wallet.balance)}), 200

# Withdraw funds from the User wallet
@app.route('/wallet/withdraw', methods=['POST'])
@jwt_required()
def withdraw_funds():
    user_id = get_jwt_identity()
    data = request.get_json()
    amount = data.get('amount')

    if amount is None or amount <= 0:
        return jsonify({'message': 'Invalid withdrawal amount'}), 400

    user_wallet = UserWallet.query.filter_by(user_id=user_id).first()

    if not user_wallet:
        return jsonify({'message': 'Wallet not found'}), 404

    if user_wallet.balance < amount:
        return jsonify({'message': 'Insufficient funds'}), 400

    user_wallet.balance -= amount
    db.session.commit()

    return jsonify({'message': 'Withdrawal successful', 'new_balance': float(user_wallet.balance)}), 200

# Handle transations between the user and courier
@app.route('/wallet/transfer', methods=['POST'])
@jwt_required()
def transfer_funds():
    data = request.get_json()
    user_id = get_jwt_identity()
    courier_id = data.get('courier_id')
    amount = data.get('amount')

    if not courier_id or amount is None or amount <= 0:
        return jsonify({'message': 'Invalid transfer details'}), 400

    user_wallet = UserWallet.query.filter_by(user_id=user_id).first()
    courier_wallet = CourierWallet.query.filter_by(courier_id=courier_id).first()

    if not user_wallet or not courier_wallet:
        return jsonify({'message': 'Wallet not found'}), 404

    if user_wallet.balance < amount:
        return jsonify({'message': 'Insufficient funds'}), 400

    # Deduct from user and add to courier
    user_wallet.balance -= amount
    courier_wallet.balance += amount

    db.session.commit()

    return jsonify({'message': 'Payment successful', 'new_user_balance': float(user_wallet.balance), 'new_courier_balance': float(courier_wallet.balance)}), 200

if __name__ == '__main__':
    app.run(port=5000, debug=True)