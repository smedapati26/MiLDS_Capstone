FROM python:3.12.1-slim

# Install system dependencies and OpenSSH server
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

# Copy your requirements file into the container
COPY requirements_griffin.txt .

# Create and activate the virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install Python dependencies, including Gunicorn
RUN pip install --upgrade pip && pip install -r requirements_griffin.txt && pip install gunicorn

# Copy application code
COPY . .

# Expose both ports for SSH and Gunicorn
EXPOSE 8000 22

# Copy supervisord configuration
COPY supervisord_griffin.conf /etc/supervisor/conf.d/supervisord.conf

# Start supervisor (which will manage SSH and Gunicorn)
CMD ["/usr/bin/supervisord"]
