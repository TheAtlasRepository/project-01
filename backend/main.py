from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from routers import converters
#TODO: import routers when they are created

app = FastAPI()
router = APIRouter()

origins = [
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#todo: add routes to router

# add converter router to app
app.router.include_router(converters.router, prefix="/convert")


# if __name__ == "__main__": run unicorn server
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
