"""  This module contains the API Router with endpoints for the server information

The module contains the following endpoints:
    - Get the server status
"""

from fastapi import APIRouter

router = APIRouter()

status = "running"

@router.get('/')
async def returnStatus():
    """ **Returns server status** """
    return {"status": status}