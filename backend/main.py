import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from database import engine
import models

# Import all routers
from routers import auth, projects, clients, resources, attendance, worklogs, performance, dashboard

load_dotenv()

# Create all DB tables on startup
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Elyndor Management OS — API",
    description="Backend for Elyndor Interactive's Resource & Employee Management System",
    version="1.0.0",
)

# CORS — allow the Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        os.getenv("FRONTEND_URL", ""),
        os.getenv("PRODUCTION_FRONTEND_URL", ""), # Add this
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(clients.router)
app.include_router(resources.router)
app.include_router(attendance.router)
app.include_router(worklogs.router)
app.include_router(performance.router)
app.include_router(dashboard.router)


@app.get("/", tags=["Health"])
def root():
    return {
        "status": "online",
        "system": "Elyndor Management OS",
        "version": "1.0.0",
        "docs": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
