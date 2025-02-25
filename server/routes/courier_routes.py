from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Courier, CourierWallet, Delivery, Pricing, User, db

def init_courier_routes(app):
    @app.route('/couriers', methods=['GET'])
    @jwt_required()
    def get_couriers():
        couriers = Courier.query.all()
        if not couriers:
            return jsonify({'message': 'No couriers found'}), 404

        courier_list = [{
            'id': courier.id,
            'first_name': courier.first_name,
            'last_name': courier.last_name,
            'email': courier.email
        } for courier in couriers]

        return jsonify({
            'message': 'Couriers retrieved successfully',
            'couriers': courier_list
        }), 200


    @app.route('/couriers/<int:courier_id>/wallet', methods=['GET'])
    @jwt_required()
    def get_courier_wallet(courier_id):
        courier_wallet = CourierWallet.query.filter_by(courier_id=courier_id).first()
        if not courier_wallet:
            return jsonify({'message': 'Courier wallet not found'}), 404

        return jsonify({
            'courier_id': courier_id,
            'balance': float(courier_wallet.balance)
        }), 200

    @app.route('/couriers/<int:courier_id>/orders', methods=['GET'])
    @jwt_required()
    def get_courier_orders(courier_id):
        # Ensure the user is the courier
        user_id = get_jwt_identity()
        if user_id != courier_id:
            return jsonify({'message': 'Unauthorized access'}), 403

        # Fetch orders assigned to the courier
        orders = Delivery.query.filter_by(courier_id=courier_id).all()
        
        if not orders:
            return jsonify({'message': 'No orders found for this courier'}), 404

        orders_list = [{
            'id': order.id,
            'user_id': order.user_id,
            'user_first_name': User.query.get(order.user_id).first_name,
            'description': order.description,
            'pickup_location': order.pickup_location,
            'delivery_location': order.delivery_location,
            'status': order.status,
            'pricing': float(order.pricing),
            'distance': float(order.distance)
        } for order in orders]

        return jsonify({
            'message': 'Orders retrieved successfully',
            'orders': orders_list
        }), 200

    @app.route('/couriers/<int:courier_id>/orders/<int:order_id>/status', methods=['PATCH'])
    @jwt_required()
    def update_order_status(courier_id, order_id):
        user_id = get_jwt_identity()
        if user_id != courier_id:
            return jsonify({'message': 'Unauthorized access'}), 403

        order = Delivery.query.filter_by(id=order_id, courier_id=courier_id).first()
        if not order:
            return jsonify({'message': 'Order not found or unauthorized'}), 404

        data = request.get_json()
        new_status = data.get('status')

        if new_status not in ['pending', 'in_progress', 'delivered', 'cancelled']:
            return jsonify({'message': 'Invalid status'}), 400

        order.status = new_status
        db.session.commit()

        return jsonify({'message': 'Order status updated successfully', 'new_status': order.status}), 200

    @app.route('/couriers/<int:courier_id>/pricing', methods=['PATCH'])
    @jwt_required()
    def update_pricing(courier_id):
        user_id = get_jwt_identity()
        if user_id != courier_id:
            return jsonify({'message': 'Unauthorized access'}), 403

        data = request.get_json()
        new_price_per_km = data.get('price_per_km')

        if new_price_per_km is None or new_price_per_km <= 0:
            return jsonify({'message': 'Invalid price per kilometer'}), 400

        pricing = Pricing.query.filter_by(courier_id=courier_id).first()
        if not pricing:
            return jsonify({'message': 'Pricing not found for this courier'}), 404

        pricing.price_per_km = new_price_per_km
        db.session.commit()

        return jsonify({'message': 'Pricing updated successfully', 'new_price_per_km': float(pricing.price_per_km)}), 200

    @app.route('/couriers/<int:courier_id>/pricing', methods=['POST'])
    @jwt_required()
    def set_pricing(courier_id):
        user_id = get_jwt_identity()
        if user_id != courier_id:
            return jsonify({'message': 'Unauthorized access'}), 403

        data = request.get_json()
        price_per_km = data.get('price_per_km')

        if price_per_km is None or price_per_km <= 0:
            return jsonify({'message': 'Invalid price per kilometer'}), 400

        # Check if pricing already exists for this courier
        pricing = Pricing.query.filter_by(courier_id=courier_id).first()
        if pricing:
            # Update existing pricing
            pricing.price_per_km = price_per_km
        else:
            # Create new pricing
            pricing = Pricing(courier_id=courier_id, price_per_km=price_per_km)
            db.session.add(pricing)

        db.session.commit()

        return jsonify({'message': 'Pricing set successfully', 'price_per_km': float(price_per_km)}), 201 