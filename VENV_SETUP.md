# Virtual Environment Setup

## ✅ Installation Complete

A Python virtual environment has been created at `/venv` with all necessary dependencies installed.

## 📦 Installed Packages

### Backend Dependencies (from `backend/requirements.txt`)

- **fastapi** (0.123.0) - Web framework
- **uvicorn** (0.33.0) - ASGI server
- **sqlalchemy** (2.0.44) - Database ORM
- **pymysql** (1.1.2) - MySQL driver
- **python-jose[cryptography]** - JWT authentication
- **passlib[bcrypt]** - Password hashing
- **bcrypt** (4.0.1) - Encryption
- **python-multipart** - File upload support
- **pytest** (8.3.5) - Testing framework
- **pytest-asyncio** (0.24.0) - Async testing
- **httpx** (0.28.1) - HTTP client for testing
- **email-validator** (2.3.0) - Email validation

### Additional Packages

- **requests** (2.32.4) - HTTP library for scripts

## 🚀 How to Use

### Activate the virtual environment:

```bash
source venv/bin/activate
```

Or use the helper script:

```bash
source activate_venv.sh
```

### Run Python scripts:

```bash
# With venv activated
python repro_admin_update.py
python backend/seed_data.py
```

### Deactivate when done:

```bash
deactivate
```

## 📁 Files Created

- `/venv/` - Virtual environment directory (added to `.gitignore`)
- `activate_venv.sh` - Helper script to activate venv

## ⚠️ Note

The virtual environment is local to this project and will not affect your system Python installation.
