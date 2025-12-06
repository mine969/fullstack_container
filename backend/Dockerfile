FROM python:3.9-slim

WORKDIR /app

# Install system dependencies for PostgreSQL
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    python3-dev \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Copy init SQL
# init.sql is copied via COPY . .

# Copy startup script
COPY startup.sh /app/startup.sh
RUN chmod +x /app/startup.sh

EXPOSE 8000

CMD ["sh", "/app/startup.sh"]
