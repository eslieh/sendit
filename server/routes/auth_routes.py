
from flask import jsonify, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import User, Courier, UserWallet, CourierWallet, db

def init_auth_routes(app, bcrypt):
    @app.route('/signup_user', methods=['POST'])
    def signup_user():
        data = request.get_json()
        password = data['password']
        first_name = data['first_name']
        last_name = data['last_name']
        email = data['email']

        if User.query.filter_by(email=email).first():
            return jsonify({'message': 'Email already exists!'}), 400

        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        new_user = User(password=hashed_password, first_name=first_name, last_name=last_name, email=email)

        db.session.add(new_user)
        db.session.commit()

        user_wallet = UserWallet(user_id=new_user.id, balance=0.00)
        db.session.add(user_wallet)
        db.session.commit()

        return jsonify({'message': 'User created successfully!'}), 201

    @app.route('/signup_courier', methods=['POST'])
    def signup_courier():
        data = request.get_json()
        password = data['password']
        first_name = data['first_name']
        last_name = data['last_name']
        email = data['email']

        if Courier.query.filter_by(email=email).first():
            return jsonify({'message': 'Email already exists!'}), 400

        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        new_courier = Courier(password=hashed_password, first_name=first_name, last_name=last_name, email=email)

        db.session.add(new_courier)
        db.session.commit()

        courier_wallet = CourierWallet(courier_id=new_courier.id, balance=0.00)
        db.session.add(courier_wallet)
        db.session.commit()

        return jsonify({'message': 'Courier created successfully!'}), 201
    
    @app.route('/login_user', methods=['POST'])
    def login_user():
        data = request.get_json()

        if 'email' not in data or 'password' not in data:
            return jsonify({'message': 'Missing email or password!'}), 400

        email = data['email']
        password = data['password']

        user = User.query.filter_by(email=email).first()
        if user and bcrypt.check_password_hash(user.password, password):
            access_token = create_access_token(identity=user.id)
            return jsonify({'message': 'Login Success!', 'access_token': access_token, 'role': 'user'})

        return jsonify({'message': 'Login Failed!'}), 401

    @app.route('/login_courier', methods=['POST'])
    def login_courier():
        data = request.get_json()

        if 'email' not in data or 'password' not in data:
            return jsonify({'message': 'Missing email or password!'}), 400

        email = data['email']
        password = data['password']

        courier = Courier.query.filter_by(email=email).first()
        if courier and bcrypt.check_password_hash(courier.password, password):
            access_token = create_access_token(identity=courier.id)
            return jsonify({'message': 'Login Success!', 'access_token': access_token, 'role': 'courier'})

        return jsonify({'message': 'Login Failed!'}), 401
    
    @app.route('/get_user_name', methods=['GET'])
    @jwt_required()
    def get_user_name():
        user_id = get_jwt_identity()
        user = User.query.filter_by(id=user_id).first()
        user_wallet = UserWallet.query.filter_by(id=user_id).first()  

        if user:
            return jsonify({
                'message': 'User found',
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email,
                'wallet_balance': float(user_wallet.balance) if user_wallet else 0.0
            })
        else:
            return jsonify({'message': 'User not found'}), 404


    @app.route('/get_courier_name', methods=['GET'])
    @jwt_required()
    def get_courier_name():
        courier_id = get_jwt_identity()
        courier = Courier.query.filter_by(id=courier_id).first()
        courier_wallet = CourierWallet.query.filter_by(courier_id=courier_id).first()

        if courier:
            return jsonify({
                'message': 'Courier found',
                'first_name': courier.first_name,
                'last_name': courier.last_name,
                'email': courier.email,
                'wallet_balance': float(courier_wallet.balance) if courier_wallet else 0.0
            })
        else:
            return jsonify({'message': 'Courier not found'}), 404


