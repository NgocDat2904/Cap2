"""ASGI entry: run from the `backend` folder as `uvicorn main:app --reload`."""
from app.main import app

__all__ = ["app"]
