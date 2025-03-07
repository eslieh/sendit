# Sendit.

Sendit. is a modern, fast, and reliable on-demand delivery platform that simplifies sending packages across locations. Whether you're a business owner looking to deliver products or an individual in need of a seamless courier service, Sendit. provides an intuitive and real-time tracking experience.

## 🚀 Tech Stack
- **Frontend:** React.js
- **Backend:** Flask (Python)
- **Database:** SQLite/MySQL (depending on deployment)
- **API Integration:** Google Maps API (for real-time tracking)
- **Authentication:** JWT-based authentication

## 📌 Features
- 📍 **Location-Based Pickup & Delivery**
- 📦 **Instant Quote Calculation**
- 🚀 **Real-Time Tracking**
- ✅ **Secure & Reliable Courier Matching**
- 🔔 **Notifications & Updates**

## 🔧 Installation

### Prerequisites
Make sure you have the following installed:
- Node.js & Yarn (or npm)
- Python 3 & pip

### Backend Setup (Flask API)
```sh
# Clone the repo
git clone https://github.com/yourusername/sendit.git
cd sendit/backend

# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the Flask server
flask run
```
The backend should now be running on `http://127.0.0.1:5000/`.

### Frontend Setup (React.js)
```sh
cd ../frontend

# Install dependencies
yarn install  # or npm install

# Start the React app
yarn start  # or npm start
```
The frontend should now be running on `http://localhost:3000/`.

## 📜 API Endpoints
| Method | Endpoint             | Description                  |
|--------|----------------------|------------------------------|
| GET    | /api/deliveries      | Fetch all deliveries        |
| POST   | /api/deliveries      | Create a new delivery       |
| GET    | /api/deliveries/:id  | Get details of a delivery   |
| PATCH  | /api/deliveries/:id  | Update delivery status      |
| DELETE | /api/deliveries/:id  | Cancel a delivery          |

## 🌍 Deployment
- **Frontend:** Vercel / Netlify
- **Backend:** Render / Heroku / AWS
- **Database:** Hosted MySQL or SQLite for local development

## 🤝 Contributing
Pull requests are welcome! Please open an issue first to discuss any major changes.

## 📜 License
This project is licensed under the MIT License.

## 📬 Contact
For any inquiries or support, reach out at [your-email@example.com].

---
When you need to send it, **just Sendit.** 🚀

