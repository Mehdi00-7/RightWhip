from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import listings
from app.routers import images
from fastapi.staticfiles import StaticFiles
from app.routers import auth
from app.routers import favourites
from app.routers import saved_searches

app= FastAPI(title="RightWhip API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/health")
def health():
    return {"status": "ok"}

app.include_router(listings.router)
app.include_router(images.router)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.include_router(auth.router)
app.include_router(favourites.router)
app.include_router(favourites.favourites_router)
app.include_router(saved_searches.router)