from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .database import engine, Base
from .routers import auth, users, menu, orders, payments, kitchen, delivery, admin, guest, upload

# Create tables (optional, good for dev)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Food Delivery API")

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# CORS Configuration (updated for deployment)
origins = [
    "http://localhost:3000", # Frontend
    "http://localhost:3001", # API
    "http://localhost", # Nginx
    "*", # Allow all origins (for Vercel deployment)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(menu.router)
app.include_router(orders.router)
app.include_router(payments.router)
app.include_router(kitchen.router)
app.include_router(delivery.router)
app.include_router(admin.router)
app.include_router(guest.router)
app.include_router(upload.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Food Delivery API"}
