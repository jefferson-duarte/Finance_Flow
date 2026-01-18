# 💰 FinanceFlow

**FinanceFlow** is a Fullstack Personal Finance Management application. It operates as a SaaS (Software as a Service) system, allowing multiple users to register, manage their own transactions securely, and visualize their financial data through dynamic dashboards.

## 🚀 Tech Stack

### Backend (API)
- **Python** & **Django**: Core framework.
- **Django REST Framework (DRF)**: RESTful API construction.
- **SQLite**: Database (Development environment).
- **JWT (JSON Web Tokens)**: Secure authentication.
- **Django Signals**: Automated logic for new user setup.

### Frontend (User Interface)
- **React.js** (via Vite): Component-based UI.
- **Axios**: HTTP client for API requests.
- **Recharts**: Data visualization library.
- **CSS Modules**: Styling.

---

## ✨ Key Features

- **Secure Authentication:**
  - User Registration and Login using JWT.
  - Route protection (private access only).
  - Data isolation (Users can only see their own data).

- **Financial Dashboard:**
  - Real-time summary of Income, Expenses, and Current Balance.
  - Interactive Pie Chart (Expenses by Category).
  - **Date Filtering:** Navigation by Month/Year to track historical data.

- **Transaction Management (CRUD):**
  - Create, Read, Update, and Delete transactions.
  - Visual indicators for Incomes (Green) and Expenses (Red).

- **Category Management:**
  - **Automation:** New users automatically receive a default set of categories (via Django Signals).
  - **Customization:** Users can create, rename, and delete their own categories.

---

## 🗺️ Development Roadmap

Here is the progress of the project development:

- [x] **Phase 1:** Environment Setup & Django Models.
- [x] **Phase 2:** API Construction (Serializers & ViewSets).
- [x] **Phase 3:** Frontend Setup (React + Vite).
- [x] **Phase 4:** API Integration & Transaction CRUD.
- [x] **Phase 5:** Dashboard Logic & Charts (Recharts).
- [x] **Phase 6:** JWT Authentication & User Data Security.
- [x] **Phase 7:** Automation with Signals (Default Categories).
- [x] **Phase 8:** Date Filters & Category Manager.


---

## 🔧 How to Run the Project

### Prerequisites
- Python 3.13
- Node.js & npm

### 1. Backend Setup

```bash
# Navigate to the backend folder (or root)
cd finance-flow

# Create and activate virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# Start the server
python manage.py runserver

```
The Backend will run at: http://127.0.0.1:8000/

___

### 2. Backend Setup
```bash
# Navigate to the frontend folder
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```
The Frontend will run at: http://localhost:5173/

---

🤝 Contribution
This project was developed for educational purposes to master the Django & React Fullstack architecture. Feel free to fork and submit pull requests.

Developed with 💙 by Jefferson Duarte