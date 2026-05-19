# College Placement Portal Backend (FastAPI, PostgreSQL & OpenAI)

This is the Python FastAPI backend engine for the College Placement Portal. It connects to a **PostgreSQL** database via SQLAlchemy ORM, and integrates the **OpenAI API** to parse resumes, match skills, and calculate intelligent ATS compatibility scores.

---

## 1. Quick Installation for PostgreSQL (Windows)

If you do not have PostgreSQL installed, follow these simple steps to configure it on your Windows machine:

1. **Download the PostgreSQL Installer**:
   * Go to the official download page: [PostgreSQL Windows Downloads](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads).
   * Choose the latest version (e.g. Version 15 or 16) and download the **Windows x86-64** installer.

2. **Run the Installer**:
   * Click next through the wizard. Keep the default installation directory.
   * **Important - Credentials Selection**: When prompted, choose a password for the superuser (we suggest using `password` to match the default `.env` configuration, or write down whatever password you choose!).
   * **Default Port**: Leave it as `5432` (the standard PostgreSQL port).
   * **Advanced components**: Ensure `pgAdmin 4` is checked. This is the visual dashboard utility.

3. **Create the Portal Database**:
   * Open **pgAdmin 4** from your Windows Start Menu.
   * Click on **Servers** and enter your password.
   * Right-click on **Databases** $\rightarrow$ **Create** $\rightarrow$ **Database...**
   * Name your database: `placement_portal`
   * Click **Save**. That's it! The backend will automatically generate all tables on startup.

---

## 2. Setting Up Python Backend Environment

Ensure you have **Python 3.9+** installed on your system.

1. **Open your Terminal (PowerShell)**:
   Navigate to the `backend` folder:
   ```powershell
   cd c:/Users/sangh/OneDrive/Desktop/cpp/backend
   ```

2. **Create a Virtual Environment**:
   ```powershell
   python -m venv venv
   ```

3. **Activate the Virtual Environment**:
   ```powershell
   venv\Scripts\Activate.ps1
   ```

4. **Install Dependencies**:
   ```powershell
   pip install -r requirements.txt
   ```

---

## 3. Configuration & Environment Variables

Open the `.env` file inside the `backend` folder and modify it to match your local setup:

```env
# 1. PostgreSQL connection string (replace 'password' with your database password)
DATABASE_URL=postgresql://postgres:password@localhost:5432/placement_portal

# 2. Enter your OpenAI API key to enable GPT-4o resume analysis.
# Leave it blank to test the portal using our high-fidelity offline fallback analyzer!
OPENAI_API_KEY=your_openai_api_key_here
```

---

## 4. Running the Development Server

With the virtual environment active and PostgreSQL running:

1. **Launch the FastAPI Server**:
   ```powershell
   uvicorn app.main:app --reload
   ```

2. **Verify it works**:
   * Open your browser and go to `http://127.0.0.1:8000/docs`.
   * This opens the **Swagger Interactive API Documentation** where you can see all available endpoints and test them directly!
