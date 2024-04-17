from fastapi import APIRouter

#API router for the server
router = APIRouter()

#default status of the server
status = "running"

@router.get('/')
async def returnStatus():
    """ **Returns server status** 
    """
    return {"status": status}