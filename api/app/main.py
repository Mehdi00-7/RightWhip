import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import listings
from app.routers import images
from fastapi.staticfiles import StaticFiles
from app.routers import auth
from app.routers import favourites
from app.routers import saved_searches
from app.routers import search

app= FastAPI(title="RightWhip API")

# The deployed frontend talks to the API through Next.js's /api rewrite
# (server-side), so CORS isn't strictly in the path — but keep the allow-list
# honest: localhost for dev, plus the deployed origin from FRONTEND_ORIGIN.
allowed_origins = ["http://localhost:3000"]
if frontend_origin := os.environ.get("FRONTEND_ORIGIN"):
    allowed_origins.append(frontend_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
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
app.include_router(search.router)