# Use Python 3.12.1 slim image
FROM python:3.12.1-slim

# Set the working directory
WORKDIR /app

# Prevent .pyc creation and enable unbuffered output
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies and OpenSSH + Supervisor
RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
        gcc \
        unixodbc-dev \
        libpq-dev \
        curl \
        openssh-server \
        supervisor \
    && rm -rf /var/lib/apt/lists/*

# Configure SSH
RUN mkdir /var/run/sshd \
    && echo 'root:passwd' | chpasswd \
    && sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config \
    && sed -i 's@session\s*required\s*pam_loginuid.so@session optional pam_loginuid.so@g' /etc/pam.d/sshd

# Copy requirements file
COPY requirements_AMAP.txt .

# Create and activate virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Upgrade pip and install all dependencies (including Gunicorn)
RUN pip install --upgrade pip && pip install -r requirements_AMAP.txt && pip install gunicorn

# Copy application code
COPY . .

# Expose ports for Django and SSH
EXPOSE 8000 22

# Copy supervisor configuration
COPY supervisord_amap.conf /etc/supervisor/conf.d/supervisord.conf

# Start both SSH and Gunicorn via Supervisor
CMD ["/usr/bin/supervisord"]
