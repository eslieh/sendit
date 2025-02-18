from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy import CheckConstraint, DECIMAL

from config import db
class User(db.Model, SerializerMixin):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    first_name = db.Column(db.String, nullable=True)
    last_name = db.Column(db.String, nullable=False)
    email = db.Column(db.String, nullable=False, unique=True)
    password = db.Column(db.String(255), nullable=False)
    
    wallet = db.relationship("UserWallet", back_populates="user", uselist=False, cascade="all, delete")
    deliveries = db.relationship("Delivery", back_populates="user", cascade="all, delete")

class Courier(db.Model, SerializerMixin):
    __tablename__ = 'couriers'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String, nullable=True, unique=True)
    first_name = db.Column(db.String, nullable=False)
    last_name = db.Column(db.String, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    
    wallet = db.relationship("CourierWallet", back_populates="courier", uselist=False, cascade="all, delete")
    deliveries = db.relationship("Delivery", back_populates="courier", cascade="all, delete")
    pricing = db.relationship("Pricing", back_populates="courier", cascade="all, delete")

class UserWallet(db.Model, SerializerMixin):
    __tablename__ = 'user_wallet'
    
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete="CASCADE"), nullable=False)
    balance = db.Column(DECIMAL(10, 2), nullable=False, default=0.00)
    
    user = db.relationship("User", back_populates="wallet")

class CourierWallet(db.Model):
    __tablename__ = 'courier_wallet'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    courier_id = db.Column(db.Integer, db.ForeignKey('couriers.id', ondelete="CASCADE"), nullable=False)
    balance = db.Column(DECIMAL(10, 2), nullable=False, default=0.00)
    
    courier = db.relationship("Courier", back_populates="wallet")

class Delivery(db.Model, SerializerMixin):
    __tablename__ = 'delivery'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete="CASCADE"), nullable=False)
    courier_id = db.Column(db.Integer, db.ForeignKey('couriers.id', ondelete="CASCADE"), nullable=False)
    description = db.Column(db.String(255), nullable=False)
    pickup_location = db.Column(db.Text, nullable=False)
    delivery_location = db.Column(db.Text, nullable=False)
    pricing = db.Column(db.Float, nullable=False)
    status = db.Column(db.String, nullable=False)
    distance = db.Column(db.Float, nullable=False)
    
    user = db.relationship("User", back_populates="deliveries")
    courier = db.relationship("Courier", back_populates="deliveries")
    
    __table_args__ = (CheckConstraint(status.in_(['pending', 'in_progress', 'delivered', 'cancelled'])),)

class Pricing(db.Model):
    __tablename__ = 'pricing'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    courier_id = db.Column(db.Integer, db.ForeignKey('couriers.id', ondelete="CASCADE"), nullable=False)
    price_per_km = db.Column(db.Float, nullable=False)
    
    courier = db.relationship("Courier", back_populates="pricing")