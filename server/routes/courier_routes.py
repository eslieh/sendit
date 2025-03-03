from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Courier, CourierWallet, Delivery, Pricing, User, UserWallet, db
from flask_mail import Mail, Message
from flask_socketio import SocketIO, emit
from decimal import Decimal  
# Initialize Flask-Mail and Flask-SocketIO
mail = Mail()
socketio = SocketIO(cors_allowed_origins="*")

def init_courier_routes(app):
    mail.init_app(app)
    socketio.init_app(app)

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


    @app.route('/couriers/wallet', methods=['GET'])
    @jwt_required()
    def get_courier_wallet():
        courier_id = get_jwt_identity()
        courier_wallet = CourierWallet.query.filter_by(courier_id=courier_id).first()
        if not courier_wallet:
            return jsonify({'message': 'Courier wallet not found'}), 404

        return jsonify({
            'courier_id': courier_id,
            'balance': float(courier_wallet.balance)
        }), 200

    @app.route('/couriers/orders', methods=['GET'])
    @jwt_required()
    def get_courier_orders():
        courier_id = get_jwt_identity()

        # Fetch orders assigned to the courier
        orders = Delivery.query.filter_by(courier_id=courier_id).all()

        if not orders:
            return jsonify({'message': f'No orders found for this courier {courier_id}'}), 404

        orders_list = []
        for order in orders:
            user = User.query.get(order.user_id)  # Fetch user details
            if user:  # Ensure user exists
                orders_list.append({
                    'id': order.id,
                    'user_id': order.user_id,
                    'customer': f"{user.first_name} {user.last_name}",  # Query first and last name
                    'description': order.description,
                    'pickup_location': order.pickup_location,
                    'delivery_location': order.delivery_location,
                    'status': order.status,
                    'pricing': float(order.pricing),
                    'distance': float(order.distance)
                })

        return jsonify({
            'message': 'Orders retrieved successfully',
            'orders': orders_list
        }), 200

    @app.route('/couriers/orders/<int:order_id>/status', methods=['PATCH'])
    @jwt_required()
    def update_order_status(order_id):
        courier_id = get_jwt_identity()

        order = Delivery.query.filter_by(id=order_id, courier_id=courier_id).first()
        if not order:
            return jsonify({'message': 'Order not found or unauthorized'}), 404

        data = request.get_json()
        new_status = data.get('status')

        if new_status not in ['pending', 'in_progress', 'delivered', 'cancelled']:
            return jsonify({'message': 'Invalid status'}), 400

        # Handle refund if order is cancelled
        if new_status == 'cancelled':
            courier_wallet = CourierWallet.query.filter_by(courier_id=courier_id).first()
            user_wallet = UserWallet.query.filter_by(user_id=order.user_id).first()

            if not courier_wallet or not user_wallet:
                return jsonify({'message': 'Wallets not found'}), 404

            if courier_wallet.balance < order.pricing:
                return jsonify({'message': 'Insufficient funds in courier wallet'}), 400
            
            
            try:
                # Perform the refund
                courier_wallet.balance -= Decimal(str(order.pricing))
                user_wallet.balance += Decimal(str(order.pricing))

                # Save changes to database
                db.session.commit()
                
            except Exception as e:
                db.session.rollback()  # Rollback changes if something goes wrong
                return jsonify({'message': f'Refund failed: {str(e)}'}), 500

        # Update order status
        order.status = new_status
        db.session.commit()

        # Fetch user details
        user = User.query.get(order.user_id)
        if user and user.email:
            send_status_email(user.email, new_status, order)

        # Emit real-time notification
        socketio.emit('order_status_update', {
            'order_id': order.id,
            'new_status': new_status
        }, room=f'user_{order.user_id}')

        return jsonify({'message': 'Order status updated successfully', 'new_status': order.status}), 200

    @app.route('/couriers/orders/<int:order_id>/location', methods=['PATCH'])
    @jwt_required()
    def update_order_location(order_id):
        """Updates only the order's present location & sends notifications"""
        courier_id = get_jwt_identity()
        order = Delivery.query.filter_by(id=order_id, courier_id=courier_id).first()

        if not order:
            return jsonify({'message': 'Order not found or unauthorized'}), 404

        data = request.get_json()
        new_location = data.get('present_location')

        if not new_location:
            return jsonify({'message': 'Invalid location'}), 400

        order.present_location = new_location
        db.session.commit()

        # Notify user
        user = User.query.get(order.user_id)
        if user and user.email:
            send_location_email(user.email, new_location, order)

        socketio.emit('order_location_update', {
            'order_id': order.id,
            'present_location': new_location
        }, room=f'user_{order.user_id}')

        return jsonify({
            'message': 'Order location updated successfully',
            'present_location': order.present_location
        }), 200

    # Pricing Functionalities
    @app.route('/couriers/pricing', methods=['GET'])
    @jwt_required()
    def get_pricing():
        """Fetch the pricing set by the courier"""
        courier_id = get_jwt_identity()
        pricing = Pricing.query.filter_by(courier_id=courier_id).first()

        if not pricing:
            return jsonify({'message': 'Pricing not set for this courier'}), 404

        return jsonify({'courier_id': courier_id, 'price_per_km': float(pricing.price_per_km)}), 200
    
    @app.route('/couriers/pricing', methods=['POST'])
    @jwt_required()
    def set_pricing():
        courier_id = get_jwt_identity()

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
    
    @app.route('/couriers/pricing', methods=['PATCH'])
    @jwt_required()
    def update_pricing():
        courier_id = get_jwt_identity()


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

# Email Notification
def send_status_email(email, status, order):
    """Sends email notification when parcel status changes"""
    subject = f"Update: Order #{order.id} Status Changed"
    body = f"""Hello,

Your parcel status has been updated to **{status}**.

Delivery Details:
- Pickup: {order.pickup_location}
- Destination: {order.delivery_location}
- Description: {order.description}

Thank you for choosing our service!

Best regards,  
SendIt Courier Team"""

    send_email(email, subject, body)


def send_location_email(email, location, order):
    """Sends email notification when parcel location changes"""
    subject = f"Update: Order #{order.id} Location Changed"
    body = f"""Hello,

Your parcel is now at **{location}**.

Delivery Details:
- Pickup: {order.pickup_location}
- Destination: {order.delivery_location}
- Description: {order.description}

Thank you for choosing our service!

Best regards,  
SendIt Courier Team"""

    send_email(email, subject, body)

def send_email(email, subject, body):
    """Sends an email with the given subject and body"""
    msg = Message(subject, sender="victoreslieh@gmail.com", recipients=[email])
    msg.body = body
    
    try:
        mail.send(msg)
    except Exception as e:
        print(f"Error sending email: {str(e)}")