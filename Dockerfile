FROM python:3.11-slim
WORKDIR /app

# Install backend dependencies
COPY ./requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt

# Copy backend and the BUILT frontend
COPY ./backend /app/backend
COPY ./frontend/build /app/frontend/build # <-- ADD THIS LINE

# Create directories and set permissions
RUN mkdir -p /app/backend/uploaded_cvs /app/backend/uploaded_jds /app/backend/cache /app/backend/results
RUN chown -R 1000:1000 /app/backend

# Run the application
CMD ["gunicorn", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "backend.main:app", "--bind", "0.0.0.0:7860", "--timeout", "120"]