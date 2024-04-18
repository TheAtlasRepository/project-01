""" Entry point for the backend server

    Run the server with the following command:
        python main.py
    The scrip will load the environment variables from the .env file in the root directory
    If the environment variables are not loaded, the script will use the default values
    The script will run the server in development mode with auto reload

    The script can be run with the following flags:
    -p, --port: The port to run the server on
    -M, --mode: The mode to run the server in, either 'dev' or 'prod'
"""

import os
import uvicorn
import dotenv
import argparse
import uvicorn.server

def main():
    """Main function to run the server
    """

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
            port = dotenv.get_key('./.env',key_to_get='HOST_PORT')
            try:
                port = int(port)
            except:
                pass
    import img2mapAPI.Img2mapAPI as Img2mapAPI
    app = Img2mapAPI.app

    if args.mode == 'prod':
        print("Server running in production mode")
        uvicorn.run(app, host=host, port=port)
    else:
        print("Server running in development mode")
        reload_dirs = []
        reload_dirs.append('./img2mapAPI')
        reload_dirs = getDirs('./img2mapAPI', reload_dirs)
        uvicorn.run(app="img2mapAPI.Img2mapAPI:app", host=host, port=port, reload=True, reload_dirs=reload_dirs)

def getDirs(path: str, inndirs: list):
    """Get all directories in a path

    Args:
        path (str): The path to get the directories from
        inndirs (list): The list of directories

    Returns:
        list: The list of directories
    """
    
    for dir in os.listdir(path):
        if os.path.isdir(f"{path}/{dir}") and dir != '__pycache__':
            inndirs.append(f"{path}/{dir}")
            getDirs(f"{path}/{dir}", inndirs)
    return inndirs
    
if __name__ == '__main__':
    main()
