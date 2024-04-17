import uvicorn
import dotenv
import argparse
import os

import uvicorn.server
# Purpose: Entry point for the backend server
# Intended to start the backend server and run the application
def main():
    #load the environment variables
    port=8000
    host="0.0.0.0"
    parser = argparse.ArgumentParser()
    parser.add_argument("-p",'--port', type=int, help='Port to run the server on')
    parser.add_argument("-M",'--mode', type=str, help="Mode to run the server in, either 'dev' or 'prod'", default='dev')
    args = parser.parse_args()
    if args.port:
        port = args.port
        print(f"Running server on port {port}")
    else:
        if dotenv.load_dotenv():
            print("Environment variables loaded")
            #get the port from the environment variables
            port = dotenv.get_key('./.env',key_to_get='HOST_PORT')
            try:
                port = int(port)
            except:
                pass
    import img2mapAPI.Img2mapAPI as Img2mapAPI
    app = Img2mapAPI.app
    #check if the mode is production
    if args.mode == 'prod':
        print("Server running in production mode")
        uvicorn.run(app, host=host, port=port)
    else:
        print("Server running in development mode")
        #configure the server to run in development mode with auto reload 
        reload_dirs = []
        #get all directories in the project under img2mapAPI
        #add root directory to the list with perm
        reload_dirs.append('./img2mapAPI')
        reload_dirs = getDirs('./img2mapAPI', reload_dirs)
        uvicorn.run(app="img2mapAPI.Img2mapAPI:app", host=host, port=port, reload=True, reload_dirs=reload_dirs)

#recursive function to get all directories in a path
def getDirs(path: str, inndirs: list):
    #check for directories in the path, ignore the __pycache__ directory recursively for all subdirectories
    for dir in os.listdir(path):
        if os.path.isdir(f"{path}/{dir}") and dir != '__pycache__':
            inndirs.append(f"{path}/{dir}")
            getDirs(f"{path}/{dir}", inndirs)
    return inndirs
    
if __name__ == '__main__':
    main()
