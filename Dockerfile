# Use a standard Python 3.11 base image
FROM python:3.11-slim

# Set the working directory inside the container
WORKDIR /app

# Copy and install backend dependencies
COPY ./requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt

# Copy your backend and BUILT frontend code
COPY ./backend /app/backend
COPY ./frontend/build /app/frontend/build

# Create necessary directories and set permissions for the app to use
RUN mkdir -p /app/backend/uploaded_cvs /app/backend/uploaded_jds /app/backend/cache /app/backend/results
RUN chown -R 1000:1000 /app/backend

# Command to run your application
CMD ["gunicorn", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "backend.main:app", "--bind", "0.0.0.0:7860", "--timeout", "120"]