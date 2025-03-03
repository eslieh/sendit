from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from decimal import Decimal
from models import Delivery, Courier, UserWallet, Pricing, CourierWallet, db

def init_order_routes(app):
    @app.route('/orders', methods=['POST'])
    @jwt_required()
    def create_order():
        data = request.get_json()
        user_id = get_jwt_identity()

        required_fields = ['courier_id', 'description', 'pickup_location', 'delivery_location', 'distance']
        for field in required_fields:
            if field not in data:
                return jsonify({'message': f'Missing required field: {field}'}), 400

        courier_id = data.get('courier_id')
        description = data.get('description')
        pickup_location = data.get('pickup_location')
        delivery_location = data.get('delivery_location')
        distance = Decimal(str(data.get('distance')))

        courier = Courier.query.get(courier_id)
        if not courier:
            return jsonify({'message': 'Courier not found'}), 404

        pricing = Pricing.query.filter_by(courier_id=courier_id).first()
        if not pricing:
            return jsonify({'message': 'Courier has not set their pricing'}), 400

        price_per_km = Decimal(str(pricing.price_per_km))
        total_price = distance * price_per_km

        user_wallet = UserWallet.query.filter_by(user_id=user_id).first()
        courier_wallet = CourierWallet.query.filter_by(courier_id = courier_id).first()
        if not user_wallet:
            return jsonify({'message': 'User wallet not found'}), 404

        if user_wallet.balance < total_price:
            return jsonify({
                'message': 'Insufficient funds',
                'required': float(total_price),
                'current_balance': float(user_wallet.balance)
            }), 400

        try:
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

            user_wallet.balance -= total_price
            # Add money to courier wallet
            courier_wallet.balance += total_price
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
    
    @app.route('/orders/<int:order_id>', methods=['DELETE'])
    @jwt_required()
    def cancel_order(order_id):
        user_id = get_jwt_identity()
        
        order = Delivery.query.filter_by(id=order_id, user_id=user_id).first()
        
        if not order:
            return jsonify({'message': 'Order not found or unauthorized'}), 404
        
        if order.status not in ['pending', 'in_progress']:
            return jsonify({
                'message': 'Order cannot be cancelled',
                'current_status': order.status
            }), 400

        try:
            user_wallet = UserWallet.query.filter_by(user_id=user_id).first()
            courier_wallet = CourierWallet.query.filter_by(courier_id=order.courier_id).first()

            if not user_wallet or not courier_wallet:
                return jsonify({'message': 'Wallet not found for transaction'}), 400

            refund_amount = Decimal(str(order.pricing))  # Convert to Decimal for accuracy

            # Refund user
            user_wallet.balance += refund_amount
            
            # Deduct from courier (if they already received the payment)
            if courier_wallet.balance >= refund_amount:
                courier_wallet.balance -= refund_amount
            else:
                return jsonify({'message': 'Courier does not have enough balance to refund'}), 400

            # Mark order as cancelled
            order.status = 'cancelled'
            
            db.session.commit()
            
            return jsonify({
                'message': 'Order cancelled successfully',
                'order': {
                    'id': order.id,
                    'refunded_amount': float(refund_amount),
                    'new_status': order.status,
                    'user_new_wallet_balance': float(user_wallet.balance),
                    'courier_new_wallet_balance': float(courier_wallet.balance)
                }
            }), 200

        except Exception as e:
            db.session.rollback()
            return jsonify({'message': 'Error cancelling order', 'error': str(e)}), 500


    @app.route('/orders/<int:order_id>', methods=['PATCH'])
    @jwt_required()
    def update_delivery_details(order_id):
        user_id = get_jwt_identity()
        data = request.get_json()

        new_location = data.get('delivery_location')
<<<<<<< HEAD
        new_distance = data.get('distance')

        if not new_location:
            return jsonify({'message': 'New delivery location is required'}), 400

        if new_distance is None or not isinstance(new_distance, (int, float)) or new_distance <= 0:
            return jsonify({'message': 'Invalid distance value'}), 400

=======
        new_distance = data.get('new_distance')
        new_price = data.get('new_price')

        if not new_location or new_distance is None or new_price is None:
            return jsonify({'message': 'Delivery location, new distance, and new price are required'}), 400
        
>>>>>>> faith-backend
        order = Delivery.query.filter_by(id=order_id, user_id=user_id).first()

        if not order:
            return jsonify({'message': 'Order not found or unauthorized'}), 404

        if order.status == 'delivered':
            return jsonify({
                'message': 'Order details cannot be updated',
                'current_status': order.status,
                'reason': 'Only non-delivered orders can be updated'
            }), 400

        try:
            # Fetch the courier's pricing per km
            courier_pricing = Pricing.query.filter_by(courier_id=order.courier_id).first()
            if not courier_pricing:
                return jsonify({'message': 'Courier pricing not found'}), 404

            # Calculate new pricing based on updated distance
            new_pricing = float(new_distance) * float(courier_pricing.price_per_km)

            old_location = order.delivery_location
<<<<<<< HEAD
            old_distance = order.distance
            old_pricing = order.pricing
=======
            old_price = order.pricing

            # Get user and courier wallets
            user_wallet = UserWallet.query.filter_by(user_id=user_id).first()
            courier_wallet = CourierWallet.query.filter_by(courier_id=order.courier_id).first()

            if not user_wallet or not courier_wallet:
                return jsonify({'message': 'Wallet not found for transaction'}), 400

            price_difference = new_price - old_price

            if price_difference > 0:
                # Charge user the extra cost
                if user_wallet.balance < price_difference:
                    return jsonify({'message': 'Insufficient balance to cover the price change'}), 400
                
                user_wallet.balance -=  Decimal(str(price_difference))
                courier_wallet.balance += Decimal(str(price_difference))

            elif price_difference < 0:
                # Refund the user from courier's wallet
                refund_amount = abs(price_difference)
                if courier_wallet.balance < refund_amount:
                    return jsonify({'message': 'Courier has insufficient balance for refund'}), 400

                courier_wallet.balance -= Decimal(str(refund_amount))
                user_wallet.balance += Decimal(str(refund_amount))
>>>>>>> faith-backend

            # Update order details
            order.delivery_location = new_location
            order.distance = new_distance
<<<<<<< HEAD
            order.pricing = new_pricing

=======
            order.pricing = new_price

            # Commit transaction
>>>>>>> faith-backend
            db.session.commit()

            return jsonify({
                'message': 'Delivery details updated successfully',
                'order': {
                    'id': order.id,
                    'old_location': old_location,
                    'new_location': new_location,
<<<<<<< HEAD
                    'old_distance': float(old_distance),
                    'new_distance': float(new_distance),
                    'old_pricing': float(old_pricing),
                    'new_pricing': float(new_pricing),
=======
                    'old_price': old_price,
                    'new_price': new_price,
                    'price_difference': price_difference,
>>>>>>> faith-backend
                    'status': order.status
                }
            }), 200

        except Exception as e:
            db.session.rollback()
<<<<<<< HEAD
            return jsonify({'message': 'Error updating order details', 'error': str(e)}), 500



=======
            return jsonify({'message': 'Error updating delivery location', 'error': str(e)}), 500
>>>>>>> faith-backend
    @app.route('/orders', methods=['GET'])
    @jwt_required()
    def get_user_orders():
        user_id = get_jwt_identity()
        status = request.args.get('status')
        
        try:
            query = Delivery.query.filter_by(user_id=user_id)
            
            if status:
                query = query.filter_by(status=status)
                
            orders = query.order_by(Delivery.id.desc()).all()
            
            if not orders:
                return jsonify({
                    'message': 'No orders found',
                    'orders': []
                }), 200
                
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

    @app.route('/orders/quote', methods=['POST'])
    @jwt_required()
    def get_quote():
        data = request.get_json()
        required_fields = ['distance']
        
        for field in required_fields:
            if field not in data:
                return jsonify({'message': f'Missing required field: {field}'}), 400

        distance = Decimal(str(data['distance']))
        if distance <= 0:
            return jsonify({'message': 'Distance must be greater than zero'}), 400

        # Get all couriers and their pricing
        couriers = Courier.query.all()
        quotes = []

        for courier in couriers:
            pricing = Pricing.query.filter_by(courier_id=courier.id).first()
            if pricing:
                price_per_km = Decimal(str(pricing.price_per_km))
                total_price = distance * price_per_km
                quotes.append({
                    'courier_id': courier.id,
                    'courier_name': f"{courier.first_name} {courier.last_name}",
                    'price_per_km': float(price_per_km),
                    'total_price': float(total_price)
                })

        if not quotes:
            return jsonify({'message': 'No available couriers for quotes'}), 404

        return jsonify({
            'message': 'Quotes retrieved successfully',
            'quotes': quotes
        }), 200
