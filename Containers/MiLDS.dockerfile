# Use the latest official Python image
FROM python:3.12.10

# Set working directory
WORKDIR /app

# Avoid .pyc files and ensure unbuffered output
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies
RUN apt-get update && apt-get install -y git && apt-get clean

# Accept a GitHub token at build time
ARG GIT_TOKEN

# Clone the private GitHub repo using the token
RUN git clone https://$GIT_TOKEN@github.com/usma-eecs/ay26-team-repo-5-milds.git MiLDS

# Move into the project directory
WORKDIR /app/MiLDS/MiLDSCapstone

# Create and activate a virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Upgrade pip and install dependencies
RUN pip install --upgrade pip && \
    if [ -f requirements.txt ]; then pip install -r requirements.txt; else pip install django; fi

# Expose Django port
EXPOSE 8000

# Default command to start Django server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
