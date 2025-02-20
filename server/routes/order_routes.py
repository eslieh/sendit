from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from decimal import Decimal
from models import Delivery, Courier, UserWallet, Pricing, db

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
            if user_wallet:
                user_wallet.balance += Decimal(str(order.pricing))
            
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

    @app.route('/orders/<int:order_id>', methods=['PATCH'])
    @jwt_required()
    def update_delivery_location(order_id):
        user_id = get_jwt_identity()
        data = request.get_json()
        
        new_location = data.get('delivery_location')
        if not new_location:
            return jsonify({'message': 'New delivery location is required'}), 400
        
        order = Delivery.query.filter_by(id=order_id, user_id=user_id).first()
        
        if not order:
            return jsonify({'message': 'Order not found or unauthorized'}), 404
        
        if order.status != 'pending':
            return jsonify({
                'message': 'Order destination cannot be updated',
                'current_status': order.status,
                'reason': 'Only pending orders can be updated'
            }), 400
        
        try:
            old_location = order.delivery_location
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
