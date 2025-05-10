#!/usr/bin/env python3
"""
Vulnerable API Demo - Educational Purpose Only
This application intentionally contains OWASP Top 10 vulnerabilities
for educational purposes. DO NOT USE IN PRODUCTION!
"""

from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlalchemy import create_engine, Column, Integer, String, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import os
import json
import subprocess  # running system commands (dangerous if not used safely)
import sqlite3     # running direct SQL queries (used for SQL injection)
import jwt         # JSON Web Token handling
from datetime import datetime, timedelta
import logging     # logging
from pathlib import Path

# logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize the FastAPI app
app = FastAPI(title="Vulnerable API Demo", 
              description="A demonstration of OWASP Top 10 vulnerabilities")
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse

# Mount static files
app.mount("/static", StaticFiles(directory="frontend/static"), name="static")

# Configure templates
templates = Jinja2Templates(directory="frontend/template")

# Create an authentication mechanism for HTTP Basic Auth
security = HTTPBasic()

# Database connection - Using SQLite for simplicity
# VULNERABILITY: Database created directly in program directory without proper permissions
DATABASE_URL = "sqlite:///./vulnerable_app.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Define database tables with SQLAlchemy models
class User(Base):
    """User model for the database"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    # VULNERABILITY: Passwords stored in plaintext without hashing
    password = Column(String)  
    email = Column(String)
    role = Column(String, default="user")  # Roles: "user", "admin"

class Post(Base):
    """Model for blog posts"""
    __tablename__ = "posts"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content = Column(Text)
    user_id = Column(Integer)

# Create database tables in the database
Base.metadata.create_all(bind=engine)

# Function to get a database connection
def get_db():
    """Create and return a database connection that can be used in API calls"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Function to initialize test data if the database is empty
def init_data():
    """Add test data to the database if it's empty"""
    db = SessionLocal()
    if db.query(User).count() == 0:
        # VULNERABILITY: Insecure passwords and plaintext storage
        # In a real app, we would never store passwords in plaintext
        admin = User(username="admin", password="admin123", email="admin@example.com", role="admin")
        user1 = User(username="user1", password="password123", email="user1@example.com", role="user")
        
        db.add(admin)
        db.add(user1)
        
        # Create some test posts
        post1 = Post(title="Welcome", content="Welcome to our vulnerable app!", user_id=1)
        post2 = Post(title="Security is important", content="This app shows how NOT to do things", user_id=1)
        
        db.add(post1)
        db.add(post2)
        
        db.commit()
    db.close()

# Initialize test data
init_data()

# JWT secret for token signing 
# VULNERABILITY: The secret is hardcoded in the source code
JWT_SECRET = "super_secret_key_dont_share"
JWT_ALGORITHM = "HS256"

# Function to create JWT token
def create_jwt_token(data: dict):
    """Creates a JWT token with the given data"""
    # VULNERABILITY: Weak implementation of token handling
    token_data = data.copy()
    # Set expiration time to 1 hour
    token_data.update({"exp": datetime.utcnow() + timedelta(hours=1)})
    return jwt.encode(token_data, JWT_SECRET, algorithm=JWT_ALGORITHM)

# Function to verify user
def verify_user(credentials: HTTPBasicCredentials, db: Session):
    """Verifies username and password"""
    
    # Kontrollera att både användarnamn och lösenord faktiskt har värden
    if not credentials.username or not credentials.password:
        logger.warning("Empty username or password provided")
        return None
    
    # VULNERABILITY: SQL Injection risk - using raw SQL query
    conn = sqlite3.connect("./vulnerable_app.db")
    cursor = conn.cursor()
    # VULNERABILITY: SQL Injection through direct string concatenation
    query = f"SELECT * FROM users WHERE username = '{credentials.username}' AND password = '{credentials.password}'"
    logger.info(f"Executing query: {query}")  # VULNERABILITY: Logging sensitive information
    cursor.execute(query)
    user = cursor.fetchone()
    conn.close()
    
    if not user:
        return None
    return {"id": user[0], "username": user[1], "role": user[4]}
#
# OWASP TOP 10 VULNERABILITY DEMONSTRATIONS
#

# Route for the homepage
@app.get("/", tags=["Frontend"])
async def get_home(request: Request):
    """Serves the web interface for the vulnerable API demonstration"""
    return templates.TemplateResponse("index.html", {"request": request})

# BROKEN ACCESS CONTROL (A01:2021)
@app.get("/admin/users/", tags=["Admin"])
def get_all_users(credentials: HTTPBasicCredentials = Depends(security), db: Session = Depends(get_db)):
    """Get all users - VULNERABLE TO BROKEN ACCESS CONTROL
    
    Vulnerability: No proper role check - any logged-in user can see all users.
    """
    user = verify_user(credentials, db)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    # VULNERABILITY: No check if the user is an admin

    users = db.query(User).all()
    return [{"id": user.id, "username": user.username, "email": user.email, "role": user.role} for user in users]

# IDENTIFICATION AND AUTHENTICATION FAILURE / CRYPTOGRAPHIC FAILURE
@app.post("/login", tags=["Authentication"])
def login(credentials: HTTPBasicCredentials = Depends(security), db: Session = Depends(get_db)):
    """Log in and get a JWT token
    
    Vulnerabilities:
    1. Uses HTTP Basic Auth over insecure HTTP (not HTTPS)
    2. Passwords stored in plaintext in the database
    3. JWT secret is weak and hardcoded
    """
    user = verify_user(credentials, db)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # VULNERABILITY: JWT token without proper security handling
    token = create_jwt_token({"sub": user["username"], "role": user["role"]})
    return {"access_token": token, "token_type": "bearer"}

# SQLi INJECTION (A03:2021)
@app.get("/posts/search/", tags=["Posts"])
def search_posts(query: str, db: Session = Depends(get_db)):
    """Search for posts - VULNERABLE TO SQL INJECTION"""
    # VULNERABILITY: SQL Injection via direct string concatenation
    conn = sqlite3.connect("./vulnerable_app.db")
    cursor = conn.cursor()
    # This is very insecure - user input should never be directly added into the SQL query.
    sql_query = f"SELECT * FROM posts WHERE title LIKE '%{query}%' OR content LIKE '%{query}%'"
    # Example payload: ' OR 1=1 --
    logger.info(f"Executing search query: {sql_query}")
    cursor.execute(sql_query)
    posts = cursor.fetchall()
    conn.close()
    
    return [{"id": post[0], "title": post[1], "content": post[2], "user_id": post[3]} for post in posts]

# INSECURE DESIGN (A04:2021)
@app.post("/password/reset", tags=["Users"])
def reset_password(username: str, new_password: str):
    """Reset password - VULNERABLE DESIGN"""
    # VULNERABILITY: Insecure design; no verification that the user owns the account
    conn = sqlite3.connect("./vulnerable_app.db")
    cursor = conn.cursor()
    # VULNERABILITY: User can reset anyone's password without verification
    # VULNERABILITY: SQL Injection here too
    cursor.execute(f"UPDATE users SET password = '{new_password}' WHERE username = '{username}'")
    conn.commit()
    conn.close()
    
    return {"message": f"Password for {username} has been reset"}

# SECURITY MISCONFIGURATION (A05:2021)
@app.get("/debug/config", tags=["Debug"])
def get_server_config():
    """Show server configuration - VULNERABLE CONFIGURATION"""
    # VULNERABILITY: Sensitive information available to everyone
    config = {
        "app_name": "Vulnerable API Demo",
        "database_url": DATABASE_URL,
        "jwt_secret": JWT_SECRET,  # VULNERABILITY: Reveals JWT secret
        "environment": dict(os.environ),  # VULNERABILITY: Reveals environment variables
        "debug_mode": True
    }
    return config

# VULNERABLE AND OUTDATED COMPONENTS (A06:2021)
@app.get("/system/check", tags=["System"])
def run_system_check(command: str = "echo 'System check running'"):
    """Run a system command - VULNERABLE TO COMMAND INJECTION"""
    # VULNERABILITY: OS Command Injection through unsafe subprocess.check_output
    try:
        # SERIOUS VULNERABILITY: shell=True allows command chaining with ; or &&
        result = subprocess.check_output(command, shell=True, stderr=subprocess.STDOUT)
        return {"output": result.decode('utf-8')}
    except subprocess.CalledProcessError as e:
        return {"error": e.output.decode('utf-8')}

# CRYPTOGRAPHIC FAILURES (A02:2021) - AUTHENTICATION FAILURE (A07:2021)
@app.post("/register", tags=["Users"])
def register_user(username: str, password: str, email: str, db: Session = Depends(get_db)):
    """Register a new user - VULNERABLE TO AUTHENTICATION FLAWS"""
    # VULNERABILITY: No verification of password complexity or email
    existing_user = db.query(User).filter(User.username == username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # VULNERABILITY: Password stored in plaintext
    new_user = User(username=username, password=password, email=email)
    db.add(new_user)
    db.commit()
    
    return {"message": "User created successfully", "user_id": new_user.id}


# 8. SOFTWARE AND DATA INTEGRITY FAILURES (A08:2021)
@app.post("/import/data", tags=["Data"])
def import_data(data: str):
    """Import data from JSON - VULNERABLE TO INSECURE DESERIALIZATION"""
    try:
        # VULNERABILITY: Unsafe JSON deserialization without validation or schema
        parsed_data = json.loads(data)
        
        # VULNERABILITY: Direct insertion of data into the database without validation
        if "users" in parsed_data:
            conn = sqlite3.connect("./vulnerable_app.db")
            cursor = conn.cursor()
            for user in parsed_data["users"]:
                # VULNERABILITY: SQL Injection again
                cursor.execute(f"""INSERT INTO users (username, password, email, role) 
                              VALUES ('{user["username"]}', '{user["password"]}', 
                              '{user["email"]}', '{user.get("role", "user")}')""")
            conn.commit()
            conn.close()
        
        return {"message": "Data imported successfully", "items": len(parsed_data.get("users", []))}
    except Exception as e:
        return {"error": str(e)}


# 9. SECURITY LOGGING AND MONITORING FAILURES (A09:2021)
@app.get("/users/{user_id}", tags=["Users"])
def get_user(user_id: int, db: Session = Depends(get_db)):
    """Get user information - VULNERABLE TO LOGGING AND MONITORING FAILURES"""
    # VULNERABILITY: No authentication required to fetch sensitive user information
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"error": f"User with ID {user_id} not found"}
    
    # VULNERABILITY: Returns all user data, including password
    return {
        "id": user.id,
        "username": user.username,
        "password": user.password,  # VULNERABILITY: Returns the password!
        "email": user.email,
        "role": user.role
    }


# 10. SERVER-SIDE REQUEST FORGERY (SSRF) (A10:2021)
@app.get("/fetch-resource/", tags=["External"])
def fetch_external_resource(url: str):
    """Fetch external resource - VULNERABLE TO SSRF"""
    import requests  # Import here to avoid circular import dependencies
    
    # VULNERABILITY: No validation of URL - can be used to access internal services
    try:
        # VULNERABILITY: SSRF - can be used to reach internal systems or localhost
        response = requests.get(url)
        content = response.text
        return {
            "status": response.status_code, 
            "content": content[:500] + "..." if len(content) > 500 else content
        }
    except Exception as e:
        return {"error": str(e)}


# CORS configuration - VULNERABILITY: Allows all origins
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # VULNERABILITY: Allows all origins
    allow_credentials=True,  # VULNERABILITY: Allows cookies across origins
    allow_methods=["*"],  # VULNERABILITY: Allows all HTTP methods
    allow_headers=["*"],  # VULNERABILITY: Allows all HTTP headers
)

# Run the application if file is run directly
if __name__ == "__main__":
    import uvicorn
    import sys  # Needed to print message
    
    print("WARNING: This app contains intentional security vulnerabilities. Use for education only.")
    
    # VULNERABILITY: Exposes the API on all network interfaces (0.0.0.0) with debug mode on
    uvicorn.run(app, host="0.0.0.0", port=8000)