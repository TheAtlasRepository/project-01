# Piplines setup

This will outline in more detail how the pipeline[s] (Github Actions) are working, the external setup of reposetory secret and variables and the general purpose.

## Deploy to heroku

>This action is triggered by a tag matching this regex `v.0.[0-9]+.[0-9]` but not trailed by `-dev`.

This action has 2 jobs (possible to later split), Each of the jobs start by looking at the repository from the triggerpoint's version look (how the code looks from linked commit).

Each job then buildes their respective docker images and containers, then use a third party action to deploy the image to Heroku platform on their respective apps.

### Github Secrets & Variables

The names of github action secrets and variables and explaining their purpose and/or need, related to this pipeline/action.

> **Secrets:**

* **BACKEND_API_URL :** The webadress to the hoeted instance of Img2map Backend, Needed env var for frontend to communicate with the backend API. `Note: this could possibly have been in vars` Note2: if trailing `/` remove.
* **MAPBOX_ACCESS_TOKEN :** This gives the frontend accsess to mapbox recourses, for rendering digital maps and related features provided by mapbox.
* **HEROKU_API_KEY :** This is a crucial varible for deploying any app to heroku, it's a account/ team spesific key for heroku.
* **HEROKU_EMAIL :** The registered email on heroku account, Needed as a part for authorization on heroku, for the deployment.
* **HEROKU_API_APP_NAME :** The heroku app name for the backend (FastAPI Aplication) on heroku, This gives the action the target on heroku, where it deploys to.
* **HEROKU_WEB_APP_NAME :** Same as above, diffrence is Heroku app name for frontend.

> **Variables:**

* **CORS_ORIGINS :** Example: `http://example.com,http//example2.com` , Note: if trailing `/` remove. This is the list of which adresses are allowed to talk to the hosted backend.
* **NEXT_PUBLIC_PDF_URLS :** Example: `example.com,example2.com`. A list of the domain pointer where the home page header changes to Pdf2map.
