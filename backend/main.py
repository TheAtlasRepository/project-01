import uvicorn
import dotenv
import argparse
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
    #check if the mode is production
    if args.mode == 'prod':
        print("Running in production mode")
        uvicorn.run(Img2mapAPI.app, host=host, port=port)
    else:
        print("Running in development mode")
        config = uvicorn.Config(Img2mapAPI.app, host=host, port=port, log_level="info", reload=True, reload_dirs=["img2mapAPI"])
        server = uvicorn.Server(config)
        server.run()
    
if __name__ == '__main__':
    main()
