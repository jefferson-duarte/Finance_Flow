# 💰 FinanceFlow

**FinanceFlow** is a Fullstack Personal Finance Management application. It operates as a SaaS (Software as a Service) system, allowing multiple users to register, manage their own transactions securely, and visualize their financial data through dynamic dashboards.

The application supports **multiple languages (English & Portuguese)** and features a modern, responsive design.

## 🚀 Tech Stack

### Backend (API)
- **Python** & **Django**: Core framework.
- **Django REST Framework (DRF)**: RESTful API construction.
- **SQLite**: Database (Development environment).
- **JWT (JSON Web Tokens)**: Secure authentication.
- **Django Signals**: Automated logic for new user setup.
- **ReportLab**: Library for generating PDF financial statements.

### Frontend (User Interface)
- **React.js** (via Vite): Component-based UI.
- **React Context API**: Global state management for Internationalization (i18n).
- **Container/Presenter Pattern**: Modular architecture for cleaner code.
- **Axios**: HTTP client for API requests.
- **Recharts**: Data visualization library.
- **CSS Modules & Flexbox**: Custom professional styling with Sidebar layout.

---

## ✨ Key Features

- **🌐 Internationalization (i18n):**
  - Full support for **English (EN)** and **Portuguese (PT-BR)**.
  - Language toggle available on both the Sidebar and Login screen.
  - User preference persistence (saves language choice).

- **✅ Secure Authentication:**
  - Split-screen Login and Registration pages with modern UI.
  - JWT-based session management.
  - Data isolation (Users can only see their own data).

- **📊 Financial Dashboard:**
  - **Real-time Overview:** Summary of Income, Expenses, and Current Balance.
  - **Visualizations:** Interactive Pie Chart (Expenses by Category).
  - **Smart Navigation:** - Jump to "Today" with one click.
    - Custom Date Picker to view historical data.
    - Month/Year filters.

- **💸 Transaction Management:**
  - CRUD operations (Create, Read, Update, Delete).
  - Visual indicators for Incomes (Green) and Expenses (Red).
  - Internal scrolling for transaction lists (keeps the UI clean).

- **📂 Category Management:**
  - **Automation:** New users automatically receive a default set of categories.
  - **Customization:** Users can create, rename, and delete their own categories.

- **👤 User Profile:**
  - Update personal information (Username, Email).
  - Secure Password Change functionality.

- **📄 Reporting:**
  - **PDF Export:** Generate professional monthly financial statements with a single click.

---

## 📂 Project Structure

The Frontend codebase follows the **Container/Presenter pattern** for better maintainability:

```text
src/
  ├── components/        # Presentational Components (UI)
  │    ├── Sidebar.jsx
  │    ├── DashboardHeader.jsx
  │    ├── SummaryCards.jsx
  │    ├── TransactionForm.jsx
  │    ├── TransactionList.jsx
  │    └── ExpensesChart.jsx
  ├── i18n/              # Translation Dictionaries
  ├── LanguageContext.jsx # Global State for i18n
  ├── App.jsx            # Main Container (Logic)
  ├── Login.jsx          # Auth Screen
  └── ...
```

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
- [x] **Phase 9:** UI/UX Makeover (Sidebar, Modern Design, PDF Export, Profile).
- [x] **Phase 10:** Refactoring (Components) & Internationalization (i18n).
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

# Install dependencies (including ReportLab)
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