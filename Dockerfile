
FROM python:3.11-slim

# Sätt arbetsmapp i containern
WORKDIR /app

# Kopiera requirements först (för snabbare caching)
COPY requirements.txt .

# Installera dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Kopiera resten av projektet
COPY . .

# Exponera port 8000
EXPOSE 8000

# Starta FastAPI med Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]