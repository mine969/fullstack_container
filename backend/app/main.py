from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import auth, users, menu, orders, chat

# Create tables (optional, good for dev)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Food Delivery API")

# CORS Configuration
origins = [
    "http://localhost:3000", # Frontend
    "http://localhost:8000",
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
app.include_router(chat.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Food Delivery API"}
