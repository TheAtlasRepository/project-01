# Further Development Suggestions

[Back to README](README.md)

---
> **Authors:** *Tom A. S. Myre, Markus Nilsen, Marius Evensen, Sebastian Midtskogen & Lukas A. Andersen*
> **Date:** 02.05.2024

This document is intended to provide our insight on further devolpment after our handover. As a helping guide we will provide the suggestions on genral improvments, new features and expansions.

Defining the general structure of the suggestion, The topp line will consist of a title and a Type Category. Next will have two fields/keywords describing how difficult and our amount of reasearch & testing done. Below is a list of the categories and a short note on what we mean, further down is an example.

1. Type:

    * **Front-end** *(The Next.js application / website)*
    * **Back-end** *(The FastApi / processing / backend connected Services)*
    * **Fullstack** *(Encompassing both)*
    * **unknown** *(Unsure of where to place or the current types are not descriptive)*

2. Difficulity:

    * **Low** *(Reletivly easy, considering context)*
    * **Medium** *(Some difficulity expected/ time)*
    * **High** *(Expected high difficulity / high timeconsumption)*
    * **unknown** *(We can not place it/ we are unsure)*

3. Researched:

    * **None** *(Only based on our intuition, given our work with the project)*
    * **Low** *(Some testing and/or Reading some source)*
    * **Medium** *(Decent amount of testing and/or Reading Sources)*
    * **High** *(Good amount of testing and/or Good source reading)*

---

 **Example, Front-End:**
>
> * `Difficulity: Medium`
> * `Research: Medium`
>
> **Description**: what, why & possibly a theoretical suggested solution.

## High priority

**Point error calculation, Fullstack:**

> * `Difficulity: High`
> * `Research: Medium`
>
> **Description**: Calculates how far off your original points where from their real positions. This is supposed to be done when users adds more then the minimum amounts of points to a map for the goerefrence. This will then improved accuracy, and they would be able to see how far off their original marker placements where compared to the re-referenced points on the map.
>
> A suggestion on this is to create an algorithm that crates a [affine transformation](https://se.mathworks.com/discovery/affine-transformation.html) matrix, to have more control of calculation parameters. In this case it needs to be [accepted](https://rasterio.readthedocs.io/en/stable/topics/transforms.html#using-affine-transformation-matrix) by rasterio.
>
> Another possible solution is to convert to the base use of gdal for tranformation, that option has not been as thoroughly explored.

### Good Starter

 **Logging Middleware, Front-End:**
>
> * `Difficulity: Medium`
> * `Research: low`
>
> **Description**: Implement a standarized logging middleware to log crucial information during runtime, and generate better metrics. This would also be beneficial to have different loglevels in the code to differentiate good devolopment information and staged runtime logs. This is also good for getting to know the codebase.

## Medium priority

 **Rotation of Image or PDF With map, Fullstack:**
>
> * `Difficulity: Low`
> * `Research: Low`
>
> **Description**: Simply put, to be able to synchronously rotate the image side along with the map (split view) when it has been georefrenced. This is for ease of use, for the user, to be able to align the side by side and recognition of features.
>
> What we know is that it theoreticaly can be done after georefrencing, by getting the corner bounds of the image to calculate the line to north from center, then adjust the start by rotating to north with getting the degrees between the north line and center to top. From this point it is to extract the rotatation from mapbox and mimic.
>
> **Subfeature:** To be able to lock the image upright after triggering min requriments for the feature above.

**Refactor ProjectHanlder, Back-End:**

> * `Difficulity: Medium`
> * `Research: low`
>
> **Description**: Seprate projecthandler into smaller classes. The Reasone for this is the current readablility of codebase and that currently the projecthandlerclass have to much resposebility.
>
> A Suggestion on our part would be to split out general point handeling to one class and handeling of georefenicing to another.
>
> A sub suggestion to the privious is to have the new georefrencing handler know of the project handler, which in turn uses point handler. The router will use all three.
>

 **Suggested points, Fullstack:**
>
> * `Difficulity: High`
> * `Research: Medium`
>
> **Description**: With the inital georefrence, the software would suggest points on the map to be placed. This would greatly improve the user experience and the learning curve for new users of this kind of software. But this might be quite a difficult task as it would probably have to include some kind of artificial Intelligence to or advanced algorithm to achieve this at the level we want.
>
> In terms of an algorithm this would then most likely depend on different reworks like the error point calculations.

### Good starters

 **A General HttexceptionHandler, Back-End:**
>
> * `Difficulity: Low`
> * `Research: Medium`
>
> **Description**: Create a common exeption class to respond with the apropriate Http Exeptions in response, this is to consolidate the error response for the routers (Easier readability). A possible way to do this is with python decorators, a fastapi dependecy injection or a combination of both.

 **Rotate Image, Front-End:**
>
> * `Difficulity: Low`
> * `Research: Medium`
>
> **Description**: Simply to rotate the uploaded image, this is usefull when a user have a pdf where the Image is rotated sideways. This is not a feature we have previously prioritized but is more prevelent now, Should be relativly easy to implement.

 **Automated Testing, Back-end:**
>
> * `Difficulity: Medium`
> * `Research: Low`
>
> **Description**: Create unit test for the core logic classes in the Back-end API, This is a bit of work but good for familiarization with the code. This also have the added benefit of a more thoroughly checking of the code which gives more cofidence to making changes and ensuring that the application works as intended.

## Low priority

 **Clock to run on heroku, Back-End:**
>
> * `Difficulity: Medium`
> * `Research: Medium`
>
> **Description**: The clock scrpits intention is to run perioadic tasks on the database,this is to clean the stroages of stale project.
>
> This would be an full implementation of the projectSelf destruct where the clock would fetch from the database the projects which are over the limit, say once every 10 mins, and delete the ones that are over. We would also recommend to set new selfdestruct time each time a project is updated, to prevent active projects from being deleted. A source on [heroku clock setup](https://devcenter.heroku.com/articles/scheduled-jobs-custom-clock-processes)

 **Workers, Back-End:**
>
> * `Difficulity: High`
> * `Research: High`
>
> **Description**: Creation of a worker to offload the more processing heavy task from the FastAPI, This is to better the application for scalability and making it more redundant. A worker should handle all the file saving, manipulation and creation. For communication between it is recommended to use a Message Broaker.
>
> A suggestion from is to use a combination of [RabbitMQ](https://www.rabbitmq.com/) (Message Broaker) and [Celary](https://docs.celeryq.dev/en/stable/getting-started/introduction.html) to implement this. Why RabbitMQ, it might be more time consuming and complex to setupp, but it got innbuilt redundancy in the queues and more features, hence the complexity. But the on of the alternatives Redis queue is more bare bones and is possible to setup with features like Rabbit but is wary manual, and another good thing heroku has a addon for a [RabbitMq server](https://elements.heroku.com/addons/cloudamqp), it has built in metrics.

 **Edition of placed Marker Pairs(Points), Front-End:**
>
> * `Difficulity: Low`
> * `Research: Medium`
>
> **Description**: To be able to select a marker pair from the cordinates table, adjust them and have them updated. Better usability, user might have confirmed a pair before properly checking and might want to adjust either the cordinates (Map) or pixel placement (image). This is low becouse the exsitance of deletion.
>
> The backend endpoint for updating a point pair already exsist and the data to do so is in the front-end, but the user interaction and flow is missing.

 **Multiple Image Georefrencing, Fullstack:**
>
> * `Difficulity: High`
> * `Research: None`
>
> **Description**: In theory it would have users be able to upload multiple images at once and georefrence them together, and see them on overlay. Another is bunch upload and sepratly have a work lits to georefrence trough each one then be able to see them all on overlay. This would require a more substantial change of the backeds way of storing project filepaths, and how it handels them, but also on how to manage and view them on the frontend would reqire substantial rework.
