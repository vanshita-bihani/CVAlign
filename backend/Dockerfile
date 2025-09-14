# Use an official Python runtime as a parent image
FROM python:3.10.9

# Copy local code to the container
COPY . .
WORKDIR /

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Expose port 7860 (default for Spaces) and start the server
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
