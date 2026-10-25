# InvestWise — Python Flask REST API & MySQL Backend

This is the backend service for **InvestWise – Investment Appraisal Calculator**. It provides a RESTful API to persist investment projects, dynamic cash flows, and perform financial calculations with a MySQL database.

---

## 1. Quick Start

### Step 1: Install Python dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Configure MySQL (Optional)
By default, the server runs with a lightweight SQLite database (`sqlite:///investwise.db`) for immediate testing without any setup.

To connect to your **MySQL server**:
1. Open MySQL CLI or Workbench and run the schema script:
   ```bash
   mysql -u root -p < schema.sql
   ```
2. Set the following environment variables (or create a `.env` file):
   ```env
   USE_MYSQL=true
   MYSQL_USER=root
   MYSQL_PASSWORD=your_password
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   MYSQL_DATABASE=investwise_db
   ```

### Step 3: Run the Flask API Server
```bash
python app.py
```
The server will start at: `http://127.0.0.1:5000`

---

## 2. API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status and database engine info |
| `GET` | `/api/projects` | List all saved investment projects |
| `POST` | `/api/projects` | Create or update an appraisal project & cash flows |
| `GET` | `/api/projects/<id>` | Fetch a single project by ID |
| `DELETE` | `/api/projects/<id>` | Delete an appraisal project and associated cash flows |
| `POST` | `/api/calculate` | Compute NPV and IRR for given cash flows |

---

## 3. Frontend Connection
In the InvestWise frontend web app:
1. Navigate to **Settings** -> **Python Flask REST API Connection**.
2. Ensure the URL is set to `http://127.0.0.1:5000/api`.
3. Click **Test Connection**. Once online, the status pill in the top navigation bar will automatically turn green (`Flask API Online`).
