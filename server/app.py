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

# ORDERS
# Create a New Order
@app.route('/orders', methods=['POST'])
@jwt_required()
def create_order():
    data = request.get_json()
    user_id = get_jwt_identity()

    # Validate required fields
    required_fields = ['courier_id', 'description', 'pickup_location', 'delivery_location', 'distance']
    for field in required_fields:
        if field not in data:
            return jsonify({'message': f'Missing required field: {field}'}), 400

    # Get required details
    courier_id = data.get('courier_id')
    description = data.get('description')
    pickup_location = data.get('pickup_location')
    delivery_location = data.get('delivery_location')
    distance = Decimal(str(data.get('distance')))  # Convert to Decimal for precise calculation

    # Verify the courier exists
    courier = Courier.query.get(courier_id)
    if not courier:
        return jsonify({'message': 'Courier not found'}), 404

    # Get or create pricing if it doesn't exist
    pricing = Pricing.query.filter_by(courier_id=courier_id).first()
    if not pricing:
        return jsonify({'message': 'Courier has not set their pricing'}), 400

    # Calculate the total price
    price_per_km = Decimal(str(pricing.price_per_km))
    total_price = distance * price_per_km

    # Verify user has sufficient funds
    user_wallet = UserWallet.query.filter_by(user_id=user_id).first()
    if not user_wallet:
        return jsonify({'message': 'User wallet not found'}), 404

    if user_wallet.balance < total_price:
        return jsonify({
            'message': 'Insufficient funds',
            'required': float(total_price),
            'current_balance': float(user_wallet.balance)
        }), 400

    try:
        # Create new order
        new_order = Delivery(
            user_id=user_id,
            courier_id=courier_id,
            description=description,
            pickup_location=pickup_location,
            delivery_location=delivery_location,
            pricing=total_price,
            status='pending',
            distance=float(distance)
        )

        # Deduct payment from user wallet
        user_wallet.balance -= total_price
        
        db.session.add(new_order)
        db.session.commit()

        return jsonify({
            'message': 'Order created successfully',
            'order': {
                'id': new_order.id,
                'total_price': float(total_price),
                'status': new_order.status,
                'pickup_location': pickup_location,
                'delivery_location': delivery_location
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error creating order', 'error': str(e)}), 500

# Cancel an Order
@app.route('/orders/<int:order_id>', methods=['DELETE'])
@jwt_required()
def cancel_order(order_id):
    user_id = get_jwt_identity()
    
    # Find the order
    order = Delivery.query.filter_by(id=order_id, user_id=user_id).first()
    
    if not order:
        return jsonify({'message': 'Order not found or unauthorized'}), 404
    
    # Check if order status allows cancellation
    if order.status not in ['pending', 'in_progress']:
        return jsonify({
            'message': 'Order cannot be cancelled',
            'current_status': order.status
        }), 400
    
    try:
        # Refund the user
        user_wallet = UserWallet.query.filter_by(user_id=user_id).first()
        if user_wallet:
            user_wallet.balance += Decimal(str(order.pricing))
        
        # Update order status
        order.status = 'cancelled'
        
        db.session.commit()
        
        return jsonify({
            'message': 'Order cancelled successfully',
            'order': {
                'id': order.id,
                'refunded_amount': float(order.pricing),
                'new_status': order.status,
                'new_wallet_balance': float(user_wallet.balance)
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error cancelling order', 'error': str(e)}), 500

# Update Delivery Location
@app.route('/orders/<int:order_id>', methods=['PATCH'])
@jwt_required()
def update_delivery_location(order_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate input
    new_location = data.get('delivery_location')
    if not new_location:
        return jsonify({'message': 'New delivery location is required'}), 400
    
    # Find the order
    order = Delivery.query.filter_by(id=order_id, user_id=user_id).first()
    
    if not order:
        return jsonify({'message': 'Order not found or unauthorized'}), 404
    
    # Check if order can be updated
    if order.status != 'pending':
        return jsonify({
            'message': 'Order destination cannot be updated',
            'current_status': order.status,
            'reason': 'Only pending orders can be updated'
        }), 400
    
    try:
        # Store old location for response
        old_location = order.delivery_location
        
        # Update delivery location
        order.delivery_location = new_location
        
        db.session.commit()
        
        return jsonify({
            'message': 'Delivery location updated successfully',
            'order': {
                'id': order.id,
                'old_location': old_location,
                'new_location': new_location,
                'status': order.status
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error updating delivery location', 'error': str(e)}), 500

# Get User Orders
@app.route('/orders', methods=['GET'])
@jwt_required()
def get_user_orders():
    user_id = get_jwt_identity()
    status = request.args.get('status')  # Optional query parameter for filtering
    
    try:
        # Base query
        query = Delivery.query.filter_by(user_id=user_id)
        
        # Apply status filter if provided
        if status:
            query = query.filter_by(status=status)
            
        # Get orders and sort by creation date (newest first)
        orders = query.order_by(Delivery.id.desc()).all()
        
        if not orders:
            return jsonify({
                'message': 'No orders found',
                'orders': []
            }), 200
            
        # Format orders for response
        orders_list = [{
            'id': order.id,
            'description': order.description,
            'pickup_location': order.pickup_location,
            'delivery_location': order.delivery_location,
            'status': order.status,
            'price': float(order.pricing),
            'distance': float(order.distance),
            'courier_id': order.courier_id
        } for order in orders]
        
        return jsonify({
            'message': 'Orders retrieved successfully',
            'total_orders': len(orders_list),
            'orders': orders_list
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Error retrieving orders', 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)