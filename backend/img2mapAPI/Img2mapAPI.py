from fastapi import FastAPI, APIRouter, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from img2mapAPI.routers import *
from dotenv import load_dotenv, get_key
import os

#setting the default environment to development
ENVIRONMENT = 'development'
origins = [
    "http://localhost", #for local testing
    "http://localhost:8080", # for vue dev server
    "http://localhost:3000", # for react dev server
]

#getting the environment variables for the application
if load_dotenv('./.env'):
    print("Environment variables loaded")
    #get the origins from the environment variables
    try:
        origins = get_key('./.env',key_to_get='CORS_ORIGINS')
        origins = origins.split(',')
        print(f"Origins: {origins}")
    except:
        print("Error getting CORS_ORIGINS from environment variables")
        pass
    #get the environment
    try:
        #first try to get the environment from the environment variables, if fails try to get from os.environ
        ENVIRONMENT = get_key('./.env',key_to_get='ENVIRONMENT')
    except:
        try:
            ENVIRONMENT = os.environ['ENVIRONMENT']
        except:
            print("Error getting environment from environment variables")
            pass
        pass
else:
    if 'ENVIRONMENT' in os.environ:
        ENVIRONMENT = os.environ['ENVIRONMENT']
        print("Environment variables not loaded")
    else:
        print("Error getting environment from environment variables, using default value")

app = FastAPI(
    title="Img2Map API",
    description="API for converting and georeferencing images",
    #disable the docs and redoc routes in production
    docs_url="/docs" if ENVIRONMENT == 'development' else None,
    redoc_url="/redoc" if ENVIRONMENT == 'development' else None,
)

router = APIRouter()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Default route
@router.get("/")
async def root():
    return {"message": "Welcome to the georeferencing API. Please refer to the documentation for more information. at /docs or /redoc"}

#adding the routers to the app
app.router.include_router(converters.router, prefix="/converter", tags=["converter"])
app.router.include_router(georefProject.router)
