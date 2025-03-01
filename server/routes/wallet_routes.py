from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from decimal import Decimal
from models import User, Courier, UserWallet, CourierWallet, db

from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Courier, UserWallet, CourierWallet, db
from decimal import Decimal

def init_wallet_routes(app):
    # User Wallet Routes
    @app.route('/wallet/user/balance', methods=['GET'])
    @jwt_required()
    def check_user_wallet_balance():
        user_id = get_jwt_identity()
        user = User.query.filter_by(id=user_id).first()

        if user and user.wallet:
            return jsonify({"message": "User wallet balance", "balance": float(user.wallet.balance)}), 200
        return jsonify({"message": "User wallet not found"}), 404

    @app.route('/wallet/user/deposit', methods=['POST'])
    @jwt_required()
    def deposit_user_funds():
        user_id = get_jwt_identity()
        data = request.get_json()
        amount = data.get('amount')

        if amount is None or amount <= 0:
            return jsonify({"message": "Invalid deposit amount"}), 400

        user = User.query.filter_by(id=user_id).first()
        if not user:
            return jsonify({"message": "User not found"}), 404

        if not user.wallet:
            user.wallet = UserWallet(user_id=user.id, balance=0.00)
            db.session.add(user.wallet)

        user.wallet.balance += Decimal(str(amount))
        db.session.commit()
        
        return jsonify({"message": "Deposit successful!", "new_balance": float(user.wallet.balance)}), 200

    @app.route('/wallet/user/withdraw', methods=['POST'])
    @jwt_required()
    def withdraw_user_funds():
        user_id = get_jwt_identity()
        data = request.get_json()
        amount = data.get('amount')

        if amount is None or amount <= 0:
            return jsonify({'message': 'Invalid withdrawal amount'}), 400

        user_wallet = UserWallet.query.filter_by(user_id=user_id).first()

        if not user_wallet:
            return jsonify({'message': 'User wallet not found'}), 404

        if user_wallet.balance < amount:
            return jsonify({'message': 'Insufficient funds'}), 400

        user_wallet.balance -= Decimal(str(amount))
        db.session.commit()

        return jsonify({'message': 'Withdrawal successful!', 'new_balance': float(user_wallet.balance)}), 200

    # Courier Wallet Routes
    @app.route('/wallet/courier/balance', methods=['GET'])
    @jwt_required()
    def check_courier_wallet_balance():
        courier_id = get_jwt_identity()
        courier = Courier.query.filter_by(id=courier_id).first()

        if courier and courier.wallet:
            return jsonify({"message": "Courier wallet balance", "balance": float(courier.wallet.balance)}), 200
        return jsonify({"message": "Courier wallet not found"}), 404

    @app.route('/wallet/courier/deposit', methods=['POST'])
    @jwt_required()
    def deposit_courier_funds():
        courier_id = get_jwt_identity()
        data = request.get_json()
        amount = data.get('amount')

        if amount is None or amount <= 0:
            return jsonify({"message": "Invalid deposit amount"}), 400

        courier = Courier.query.filter_by(id=courier_id).first()
        if not courier:
            return jsonify({"message": "Courier not found"}), 404

        if not courier.wallet:
            courier.wallet = CourierWallet(courier_id=courier.id, balance=0.00)
            db.session.add(courier.wallet)

        courier.wallet.balance += Decimal(str(amount))
        db.session.commit()

        return jsonify({"message": "Deposit successful!", "new_balance": float(courier.wallet.balance)}), 200

    @app.route('/wallet/courier/withdraw', methods=['POST'])
    @jwt_required()
    def withdraw_courier_funds():
        courier_id = get_jwt_identity()
        data = request.get_json()
        amount = data.get('amount')

        if amount is None or amount <= 0:
            return jsonify({'message': 'Invalid withdrawal amount'}), 400

        courier_wallet = CourierWallet.query.filter_by(courier_id=courier_id).first()

        if not courier_wallet:
            return jsonify({'message': 'Courier wallet not found'}), 404

        if courier_wallet.balance < amount:
            return jsonify({'message': 'Insufficient funds'}), 400

        courier_wallet.balance -= Decimal(str(amount))
        db.session.commit()

        return jsonify({'message': 'Withdrawal successful!', 'new_balance': float(courier_wallet.balance)}), 200


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

        user_wallet.balance -= amount
        courier_wallet.balance += amount

        db.session.commit()

        return jsonify({
            'message': 'Payment successful!', 
            'new_user_balance': float(user_wallet.balance), 
            'new_courier_balance': float(courier_wallet.balance)
        }), 200
