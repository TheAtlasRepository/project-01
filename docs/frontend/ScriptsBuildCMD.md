# Scripts, Builds & CMD

[Back to README](../README.md)

The purpose of this document is to give insight into the methodes of running the Next.js frontend application and explain it's nuances.

## Main

Entrypoint Script
Main command `npm run dev` or `yarn dev`

> Optional flags:
>
> - `-p` or `--port` : Defines the port on which the server runs. Default is 3000.
> - -H or --hostname : Sets the hostname where the server will run. Default is localhost.

When `yarn dev` is run, it starts the Next.js development server. By default, the server will be hosted at <http://localhost:3000/>.

**Note:** If a .env.local file is present in the frontend directory, the application will attempt to retrieve NEXT_PUBLIC_BACKEND_URL and NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to configure the server if no corresponding command line arguments are provided.

## Other Related Notes

In the development cycle, you might use `npm run lint` or `yarn lint` to check the codebase for linting errors as specified in the .eslintrc.json configuration file.

Keep in mind that if you are using a custom server setup or have specific rewrite rules, the next.config.js file will need to be properly configured to reflect those changes for both development and production environments.
