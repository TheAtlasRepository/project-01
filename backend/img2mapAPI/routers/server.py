from fastapi import APIRouter, BackgroundTasks, HTTPException, Query #some extra imports for future use

#API router for the server
router = APIRouter()

#default status of the server
status = "running"

@router.get('/')
async def returnStatus():
    """ **Returns server status** """
    return {"status": status}