# Pull base python registry
FROM registry.cdso.army.mil/cdso/containers/approved-base/python_alpine:3.13

# Run local DB for builds.  This will be changed in running container.
ARG SETTINGS_FILE=griffin_ai.settings.dev.local

# Create user and group
# Create app directory and set it to be owned by appuser
# Install required packages including MS SQL Drivers
RUN addgroup -S appgroup && \
    adduser -S appuser -G appgroup && \
    mkdir /app && \
    chown -R appuser /app && \
    apk --no-cache add unixodbc unixodbc-dev unzip curl wget build-base linux-headers openssl && \
    curl -O https://download.microsoft.com/download/fae28b9a-d880-42fd-9b98-d779f0fdd77f/msodbcsql18_18.5.1.1-1_amd64.apk && \
    curl -O https://download.microsoft.com/download/7/6/d/76de322a-d860-4894-9945-f0cc5d6a45f8/mssql-tools18_18.4.1.1-1_amd64.apk && \
    apk --no-cache add --allow-untrusted msodbcsql18_18.5.1.1-1_amd64.apk && \
    apk --no-cache add --allow-untrusted mssql-tools18_18.4.1.1-1_amd64.apk && \
    rm ms*_amd64.apk && \
    pip install --upgrade --no-cache-dir pip && \
    apk del --purge binutils curl

# Set the working directory
WORKDIR /app

# Copy application code
COPY --chown=appuser:appgroup . .

# Set environment variables to optimize Python
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1 
ENV PATH="$PATH:/opt/mssql-tools18/bin:/home/appuser/.local/bin"

# Switch to non-root user
USER appuser

# Create a virtual environment
RUN python -m venv venv
ENV PATH="/app/venv/bin:$PATH"
ENV DJANGO_SETTINGS_MODULE=${SETTINGS_FILE}

# Install needed packages
# Collect static files for api docs and django rest
RUN pip install --upgrade --no-cache-dir pip && \
    pip install --no-cache-dir -r requirements.txt && \
    python manage.py collectstatic --noinput

# Expose the application port
EXPOSE 8000

# Start the application using Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--timeout", "120", "--workers", "3", "--access-logfile=-", "--error-logfile=-", "--capture-output", "griffin_ai.wsgi:application"]
