# Application Architecture

[Back to README](README.md)

---
![Arcitecture Image](./img/Img2map%20Architecture.svg)

In the image above you can see how the current (02.05.24) architechture is designed. Starting with the client connecting to the serever on herkoku, and getting the pages.

From the inital page the lines to other pages indicate navigation, while lines to components shows firstly which components are in use, and how it flows througout the components.

The componets have two further connections idicating back and fourth communication. The first on the bottom of the components linking outside to "Mapbox libraries", this is what we found to be most descriptive. Inn the components linking to "Mapbox libraries", there are internal packages in use that is making a digital map, and interacting with the "Library". Now to the second, this is an internal to Axios. Axios is a package that is used to communicate with the backend over HTTP requests as seen.

Going over to the sepratly hosted backend on heroku, we have a uvicorn server running with a FastAPI application. This application recives the request and routes them according to the url specifcations.

Going with conversion router, it will send it to the core and return the processed result over http as a response to the frontend, going through axios to the apropriate component for display.

Heading trough the project/georef we are sent to the core for proceccing. The core logic will have one or multiple iterations of interactions with the file storage or the database handler, before finally returning in to the router for formatting a response, from here it is same path as conversion.

The database handler when reciving calls from the core logic will execute based on the call operations on a postgresSql DB through its connection. The DB in the instance is part of heroku addons, which are services provided by heroku to or in the instance.

The final part to look at is the file Storage handler, Bucketeer and Amazone S3 bucket. File storage handler behaves much in the same way as the DB handler executing calls request based on the type, where it differs is the connection. It recives its credentials from bucketeer (Heroku addon) which creates and manage the Amazone S3 bucket.

With the credatials from bucketeer, the file storage handler can do file operations inside of the bucket, this completes the architecture.
