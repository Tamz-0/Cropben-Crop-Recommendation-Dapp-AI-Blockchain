# Corrected Dockerfile for server (server/Dockerfile)
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN python train_model.py

# WEATHER_API_KEY will be injected by Docker Compose
EXPOSE 5000

# Your app.py is already set to run on 0.0.0.0:5000
CMD ["python", "app.py"]