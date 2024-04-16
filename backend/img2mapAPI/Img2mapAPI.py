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
        #checking for osenvirons cross origins and adding to the list of origins if it exists
        if 'CORS_ORIGINS' in os.environ:
            osenvirons = os.environ['CORS_ORIGINS'].split(',')
            for origin in osenvirons:
                if origin not in origins:
                    origins.append(origin)
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
        try:
            origins = os.environ['CORS_ORIGINS'].split(',')
            print(f"Origins: {origins}")
        except:
            print("Error getting CORS_ORIGINS from environment variables, using default value")
            pass
    else:
        print("Error getting environment from environment variables, using default value")

swagger_url = "/docs"
doc_url = "/redoc"

if ENVIRONMENT == 'development':
    print("App running in development mode")
else:
    print("App running in production mode")
    swagger_url = None
    doc_url = None

app = FastAPI(
    title="Img2Map API",
    description="API for converting and georeferencing images",
    docs_url=swagger_url,
    redoc_url=doc_url,
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
app.router.include_router(converters.router, prefix="/converter", tags=["File Converting & Editing"])
app.router.include_router(server.router, prefix="/serverInfo", tags=["Server Info"])
app.router.include_router(georefProject.router)
