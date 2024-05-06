# Further Development Suggestions

[Back to README](README.md)

---
> **Authors:** *Tom A. S. Myre, Markus Nilsen, Marius Evensen, Sebastian Midtskogen & Lukas A. Andersen*
> **Date:** 02.05.2024
> **Updated**: 06.05.2024

This document is intended to provide information on the further suggested development after our handover. As a guide, we will provide suggestions for general improvements, new features, and expansions.
> **Note:** There are also enhancements listed in the GitHub-repo Issues, which are not mentioned here.

Defining the general structure of the suggestion, the top line will consist of a Title and a Type Category. The next line will have two fields/keywords that describe the estimated difficulty and our amount of already completed research \& testing. Below is a list of the different categories and a short note on what
these encompass, as well as an example.

1. Type:

    * **Front-end** *(The Next.js application / website)*
    * **Back-end** *(The FastAPI / processing / backend
    connected Services)*
    * **Fullstack** *(Encompassing both)*
    * **unknown** *(Unsure of where to place, or the current types are not descriptive)*

2. Difficulty:

    * **Low** *(Relatively easy, considering context)*
    * **Medium** *(Some time/difficulty expected)*
    * **High** *(Expected high difficulty and high time consumption)*
    * **unknown** *(We are not sure, and can not estimate time & difficulty)*

3. Researched:

    * **None** *(Only based on intuition, given our work with the project)*
    * **Low** *(Some testing done, and/or started researching)*
    * **Medium** *(Decent amount of testing done, and/or researched somewhat)*
    * **High** *(Good amount of testing done, and/or researched a lot)*

---

 **Example, Front-End:**
>
> * `Difficulty: Medium`
> * `Research: Medium`
>
> **Description**: What we suggest to implement, why we suggest this implementation, & possibly a theoretical suggested solution.

## High priority

**Point error calculation, Fullstack:**

> * `Difficulty: High`
> * `Research: Medium`
>
> **Description**:  Calculate the amount of deviation from their real positions that the user's original points are. This is supposed to be done when users add more than the minimum amount of points to a map for georeferencing.
This will then improve accuracy, and they would be able to see how far off their original marker placements were compared to the re-georeferenced points on the map.
>
> A suggestion on this is to create an algorithm that creates an [affine transformation matrix](https://se.mathworks.com/discovery/affine-transformation.html) , to have more control of the calculation parameters.
In this case, it must [be accepted by Rasterio](https://rasterio.readthedocs.io/en/stable/topics/transforms.html#using-affine-transformation-matrix).
>
> Another possible solution is to convert to the base use of GDAL for transformation, but this option has not been explored as thoroughly.

### Good Starter

 **Logging Middleware, Front-End:**
>
> * `Difficulty: Medium`
> * `Research: Low`
>
> **Description**: Implement a standardized logging middleware to log crucial information during runtime, and generate better metrics. It would also be beneficial to have different log levels in the code to differentiate good development information and staged runtime logs. This is also a good way to get familiar with the codebase.

## Medium priority

 **Rotation of Image with map, Fullstack:**
>
> * `Difficulty: Low`
> * `Research: Low`
>
> **Description**: This suggestion includes being able to synchronously rotate the image in split-view, along with the map after it has been georeferenced. This is to make the image behave more like the map, and keep the image and map in a similar state while working.
>
> Theoretically, this can be done by calculating the deviation from the real positions, after georeferencing, by determining the image's corner bounds. Then, it is possible to calculate the line towards the north from the center and adjust the starting point by rotating it to align with the north. Lastly, extract the rotation from MapBox and replicate it in the image view.
>
> **Subfeature:** To be able to lock the image upright after triggering the minimum requirements for the feature above.

**Refactor ProjectHandler, Back-End:**

> * `Difficulty: Medium`
> * `Research: Low`
>
> **Description**: Separate the ProjectHandler into smaller classes. The reason for this is to improve the current readability of the codebase, and that the ProjectHandler-class currently has too much responsibility.
>
> A suggestion on our part would be to split the handling of points to one class and the handling of georeferencing to another.
>
> A subsuggestion to the previous is to have the new GeoreferencingHandler know of the ProjectHandler, which in turn uses the PointHandler.
>The API-router will use all three
>

 **Suggested points, Fullstack:**
>
> * `Difficulty: High`
> * `Research: Medium`
>
> **Description**: After the inital georeference, the software could suggest points on the map to be placed. This could greatly improve the user experience and the learning curve for new users of this kind of software. However, this might be a quite difficult task, as it would probably have to include some kind of Artificial Intelligence or advanced algorithm to achieve this at a good level.
>
> In terms of an algorithm, this would then most likely depend on different code-changes and improvements, such as the error point calculations.

### Good starters

 **A General HTTPExceptionHandler, Back-End:**
>
> * `Difficulty: Low`
> * `Research: Medium`
>
> **Description**: Create a common exception class to respond with the appropriate HTTP-exceptions. This is to consolidate the error response for the routers, which would improve readability. A possible way to do this is with Python decorators, a FastAPI dependency injection, or a combination of both.

 **Rotate Image, Front-End:**
>
> * `Difficulty: Low`
> * `Research: Medium`
>
> **Description**:  Giving the user the possibility of rotating the uploaded image. This can be useful in cases such as when a user has a PDF where the image is rotated sideways, or when in general when images are not facing the classic north used in maps we are familiar with. This is not a feature we have previously prioritized, but is more prevalent now, and it should be relatively easy to implement.

 **Automated Testing, Back-end:**
>
> * `Difficulty: Medium`
> * `Research: Low`
>
> **Description**: The project currently lacks tests, so code-breaking changes are hard to identify. What would help mitigate this is to create unit tests for the core logic classes in the back-end API. This is a bit of work, but will make you familiar with the existing code. This also has the added benefit of a more thoroughly checked code, which can give more confidence to making changes and ensuring that the application works as intended.

## Low priority

 **Clock to run on Heroku, Back-End:**
>
> * `Difficulty: Medium`
> * `Research: Medium`
>
> **Description**: The clock script's intention is to run periodic tasks on the database, specifically cleaning the storage of stale projects and files.
>
> This would be a full implementation of projectSelfDestruct, where the clock would fetch from the database the projects that are over the time limit. For example, the clock can fetch every 10 minutes and delete projects that are above the limit. We also recommend setting a new self-destruct time each time a project is updated to prevent active projects from being deleted. [Here is a source on Heroku clock setup](https://devcenter.heroku.com/articles/scheduled-jobs-custom-clock-processes).

 **Workers, Back-End:**
>
> * `Difficulty: High`
> * `Research: High`
>
> **Description**: Creation of a worker to offload more processing-heavy tasks from FastAPI. This is to prepare the application for more scalability and making it more redundant. A worker should handle all of the file saving, and creation and manipulation of projects. For communication between the worker and the API it is recommended to use a Message Broker.
>
> A suggestion is to use a combination of [RabbitMQ](https://www.rabbitmq.com/) (Message Broker) and [Celery](https://docs.celeryq.dev/en/stable/getting-started/introduction.html) to implement this. RabbitMQ might be time-consuming and complex to setup, but it includes built-in redundancy in the queues and several other features, hence the complexity. Additionally, there exists a Heroku Addon for a [RabbitMq server](https://elements.heroku.com/addons/cloudamqp), which has built-in metrics.
>
> If Rabbit is too complex, one of the alternatives, Redis Queue, is more bare-bones and easier to setup. It has fewer features, but it is possible to set up with the features Rabbit has, but it is a very manual process to do this; this in turn could make the implementation of RQ more complex than implementing Rabbit.

 **Editing placed Marker Pairs (Points), Front-End:**
>
> * `Difficulty: Low`
> * `Research: Medium`
>
> **Description**: It could be beneficial for the user to be able to select a marker pair from the coordinates table, adjust them, and have them updated. This could increase usability, as the user might have confirmed a pair before properly checking the location, and might want to adjust either the coordinates (map), or the pixel placement (image). This is prioritized as low due since the user has the possibility to delete points.
>
> The back-end endpoint for updating a Marker Pair already exists, and the data to do so is in the front-end, but the user interaction and flow are missing.

 **Multiple Image Georeferencing, Fullstack:**
>
> * `Difficulty: High`
> * `Research: None`
>
> **Description**: A suggestion that might be beneficial for the user is to have the possibility of uploading multiple images at once and georeference them together, and see them on the Overlay together. Another suggestion is for the user to upload multiple images at once and then work through them separately, like a backlog, before showing them all on the Overlay. This is to improve the workflow in case the user has multiple files they need to work with - rather than going back, uploading, georeferencing, checking, then downloading, the user could instead get a more seamless user-experience, starting and ending the process only once.
>
> Georeferencing multiple images would require a more substantial change in the way the back-end stores file paths and how it handles file paths. Additionally, the front-end would also require substantial rework in how it manages and displays images.  
