# Scripts, Builds & CMD

[Back to README](../README.md)

The purpose of this document is to give insight into the methods of running the Next.js front-end application and explain its nuances.

## Main

Entrypoint Script
For development, the main command for running is `npm run dev` or `yarn dev`
For production, the main command for building is `npm run build` or `yarn build`, and for starting the application, use `npm start` or `yarn start`

> Optional flags:
>
> - `-p` or `--port` : Defines the port on which the server runs. Default is 3000.
> - -H or --hostname : Sets the hostname where the server will run. Default is localhost.

When `yarn dev` is run, it starts the Next.js development server. By default, the server will be hosted at `localhost:3000/`.

**Note:** If a .env.local file is present in the frontend directory, the application will attempt to retrieve NEXT_PUBLIC_BACKEND_URL and NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to configure the server if no corresponding command line arguments are provided. The explanations for these are found in the [example environment file](../../frontend/.env.example).

## Other Related Notes

In the development cycle, you might use `npm run lint` or `yarn lint` to check the codebase for linting errors as specified in the .eslintrc.json configuration file.

Keep in mind that if you are using a custom server setup or have specific rewrite rules, the next.config.js file will need to be properly configured to reflect those changes for both development and production environments.
