from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Courier, Delivery, CourierWallet
def init_courier_stats(app):
    @app.route('/courier/stat', methods=['GET'])
    @jwt_required()
    def get_courier_stats():
        courier_id = get_jwt_identity()
        if not courier_id:
            return jsonify({"error": "Courier not found"}), 404

        # Total Earnings
        wallet = CourierWallet.query.filter_by(courier_id=courier_id).first()
        total_earnings = wallet.balance if wallet else 0.0

        # Completed Deliveries
        completed_deliveries = Delivery.query.filter_by(courier_id=courier_id, status='delivered').count()

        # Ongoing Deliveries
        ongoing_deliveries = Delivery.query.filter(Delivery.courier_id == courier_id, Delivery.status.in_(['pending', 'in_progress'])).count()

        # Active Deliveries (Accepted but not completed)
        active_deliveries = Delivery.query.filter_by(courier_id=courier_id).count()

        # Total Distance Covered
        total_distance = db.session.query(db.func.sum(Delivery.distance)).filter_by(courier_id=courier_id, status='delivered').scalar() or 0.0

        return jsonify({
            "total_earnings": float(total_earnings),
            "completed_deliveries": completed_deliveries,
            "ongoing_deliveries": ongoing_deliveries,
            "active_deliveries": active_deliveries,
            "total_distance_covered": float(total_distance)
        })
