FROM python:3.9-slim

WORKDIR /app

# Install system dependencies (if needed for mysqlclient/cryptography)
RUN apt-get update && apt-get install -y \
    build-essential \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Expose port
EXPOSE 8000

# Run the application (runs fix_images.py first to update URLs)
CMD ["sh", "-c", "python fix_images.py && python app/seed_db.py && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
