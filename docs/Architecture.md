# Application Architecture

[Back to README](README.md)

---
![Arcitecture Image](./img/Img2map%20Architecture.svg)

> **TLDR**: The front-end (NextJS) has several pages, and contacts the back-end using Axios. The back-end has various routers, utilities, etc. for handling projects. The backend can store data and files either locally, or through an Amazon S3 bucket and PostgreSQL, or a combination.

In the architecture diagram  (last updated May 2nd, 2024), the system flow is illustrated starting from the client's connection to the Heroku server, where page retrieval occurs. Navigation between pages is showed by the section and arrows on the left in the Next App section, while interactions with components are to the right, highlighted to showcase their usage within the system.

The arrows attempt to display how the various components interact with eachother. Additionally, some components have other types of connections, one outward, linking to "Mapbox libraries," indicating their utilization for digital mapping functionalities (mainly used by Split-View and Overlay-View), and another inward, referencing Axios, a package facilitating HTTP communication with the backend (mainly used by Conversion and ProjectAPI).

Moving to the separately hosted backend on Heroku, a Uvicorn server runs a FastAPI application. This application receives the request and routes them according to the URL specifications.

The backend has two main routers, or entry points:

The Conversion router is mainly called during the initial preparation of the project, such as when the user uploads a PDF or a JPG etc., with the exception of image cropping.

The Project/Georef router is responsible for all of the project calls, such as uploading the image, adding points, and requesting the georeferencing process.  

These routers utilize various utilities and helpers:

The Conversion router uses the file conversion and cropping utilities, such as converting a PDF page to a PNG, or cropping a PNG image.

The Project/Georef router mainly uses the Core, which in this case is named "ProjectHandler". The Project Handler is currently responsible for iterating over the whole project, and is the collection point for the other handlers. This means that it has functions such as createProject, getProjectPoints, getImageFilePath, etc., and the Project Handler then utilizes the Database Handler and Storage Handler as necessary.

The Database Handler executes operations either on a local SQLite file, or on a PostgreSQL database through a connection facilitated by a Heroku addon.

The Storage Handler operates similarly to the Database Handler, and executes file operations either in folders on the local system, or managing file operations on an Amazon S3 bucket. The Amazon S3 bucket credentials is managed by the Heroku addon "Bucketeer".

Other minor details that are not displayed in the diagram are as follows:
- As mentioned above, the system also supports local files and local databases, and the back-end can be run independent of third party solutions.
- The front-end has several other minor components, but they are not important to display the flow. One example is the EditorToolbar, or the WarningExitModal.
- A third router exists, named Server. This is currently not used for anything besides returning a successful status to the front-end, allowing user uploads. Otherwise, a message to the user is displayed.
- There are various other interactions within the back-end, however, but these were excluded from the diagram because of the diagrams intended scope.
