FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --upgrade pip && \
    pip install --default-timeout=1000 --no-cache-dir -r requirements.txt -i https://pypi.org/simple


COPY . .

# RUN python train_model.py

# WEATHER_API_KEY injected by Docker Compose
EXPOSE 5000

CMD ["python", "app.py"]