from faker import Faker
from models import db, User, Courier, UserWallet, CourierWallet, Delivery, Pricing
from app import app  # Ensure app is properly initialized in app.py

fake = Faker()

def seed_users(n=5):
    users = []
    for _ in range(n):
        user = User(
            first_name=fake.first_name(),
            last_name=fake.last_name(),
            email=fake.email(),
            password=fake.password(length=12)
        )
        users.append(user)
    db.session.add_all(users)
    db.session.commit()
    return users

def seed_couriers(n=3):
    couriers = []
    for _ in range(n):
        courier = Courier(
            first_name=fake.first_name(),
            last_name=fake.last_name(),
            email=fake.email(),
            password=fake.password(length=12)
        )
        couriers.append(courier)
    db.session.add_all(couriers)
    db.session.commit()
    return couriers

def seed_user_wallets(users):
    wallets = []
    for user in users:
        wallet = UserWallet(user_id=user.id, balance=round(fake.random_number(digits=3), 2))
        wallets.append(wallet)
    db.session.add_all(wallets)
    db.session.commit()

def seed_courier_wallets(couriers):
    wallets = []
    for courier in couriers:
        wallet = CourierWallet(courier_id=courier.id, balance=round(fake.random_number(digits=3), 2))
        wallets.append(wallet)
    db.session.add_all(wallets)
    db.session.commit()

def seed_pricing(couriers):
    pricing_data = []
    for courier in couriers:
        pricing = Pricing(courier_id=courier.id, price_per_km=round(fake.pyfloat(min_value=1, max_value=10, right_digits=2), 2))
        pricing_data.append(pricing)
    db.session.add_all(pricing_data)
    db.session.commit()

def seed_deliveries(users, couriers, n=10):
    deliveries = []
    for _ in range(n):
        delivery = Delivery(
            user_id=fake.random_element(users).id,
            courier_id=fake.random_element(couriers).id,
            description=fake.sentence(),
            pickup_location=fake.address(),
            delivery_location=fake.address(),
            pricing=round(fake.pyfloat(min_value=5, max_value=100, right_digits=2), 2),
            status=fake.random_element(["pending", "in_progress", "delivered", "cancelled"]),
            distance=round(fake.pyfloat(min_value=1, max_value=50, right_digits=2), 2)
        )
        deliveries.append(delivery)
    db.session.add_all(deliveries)
    db.session.commit()

def seed_database():
    print("Seeding database... 🚀")
    
    # Drop and recreate tables
    db.drop_all()
    db.create_all()

    # Seed data
    users = seed_users()
    couriers = seed_couriers()
    seed_user_wallets(users)
    seed_courier_wallets(couriers)
    seed_pricing(couriers)
    seed_deliveries(users, couriers)

    print("Seeding complete! 🎉")

if __name__ == "__main__":
    with app.app_context():
        seed_database()
