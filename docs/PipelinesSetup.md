# Pipelines setup

[Back to README](README.md)

---
This doc will outline in further detail how the pipeline[s] (Github Actions) are working, the external setup of repository secrets and variables, and the general purpose the pipelines.

## Deploy to Heroku

>This action is triggered by a tag matching the regular expression `v.0.[0-9]+.[0-9]`, but not if trailed by `-dev`.

This action has 2 jobs (these can be split later). When the action is triggered, the application is built based on the code of the current branch and commit that triggered the action. Each job then builds their respective Docker-images and -containers, then use a third party action to deploy the respective images to the Heroku apps.

### Github Secrets & Variables

Following are the names of the GitHub action secrets and variables, and explaining their purpose and/or need, related to this pipeline/action.

> **Secrets:**

* **BACKEND_API_URL :** The URL to the hosted instance of the Img2map-Backend. Needed environment variable for the frontend to communicate with the backend API. Needed for app function.

    `Note: If the URL has a trailing '/', remove it`

    `Note: This could possibly have been in vars`

* **MAPBOX_ACCESS_TOKEN :** This gives the frontend access to Mapbox's API-resources, used to render digital maps and access other features provided by Mapbox. Needed for app function.
* **HEROKU_API_KEY :** Heroku account- or team-specific key. Needed for deployment authorization.
* **HEROKU_EMAIL :** The registered email for the Heroku account. Needed for deployment authorization.
* **HEROKU_API_APP_NAME :** The Heroku app-name for the backend on Heroku. This gives the action the target location on Heroku (where it deploys to).
* **HEROKU_WEB_APP_NAME :** Same as above, but for the frontend application.

> **Variables:**

* **CORS_ORIGINS :** List of which URLs that are allowed to talk to the hosted backend.

    Example: `http://example.com,http://example2.com`

    `Note: If the URL has a trailing '/', remove it`
* **NEXT_PUBLIC_PDF_URLS :** A list of domains that will display "PDF2Map" rather than "Image2Map".

    Example: `example.com,example2.com`, where example3.com will show Image2Map and example2.com will show PDF2Map.
