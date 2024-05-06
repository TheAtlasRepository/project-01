# Front-End File Structure

[Back to README](../README.md)

---
The intention of this file is to give a general overview of the front-end file structure, and explaining our thought-process on the responsibility and purpose of some of the files.

## Current structure (with tree cmd)

Command: `PS <path> tree /f /a`

```cmd
c://frontend
|   .dockerignore
|   .env.example
|   .eslintrc.json
|   components.json
|   next.config.js
|   package-lock.json
|   package.json
|   postcss.config.js
|   tailwind.config.ts
|   tsconfig.json
|   yarn.lock
|
+---app
|   |   favicon.ico
|   |   globals.css
|   |   layout.tsx
|   |   page.tsx
|   |
|   +---About
|   |       page.tsx
|   |
|   +---Editor
|   |       page.tsx
|   |
|   \---Privacy
|           page.tsx
|
+---components
|   +---component
|   |       conversion.tsx
|   |       coordinateList.tsx
|   |       CropImage.tsx
|   |       editor.tsx
|   |       geocoder-control.tsx
|   |       mapStyleToggle.tsx
|   |       moveImage.tsx
|   |       overlayview.tsx
|   |       pdfSelector.tsx
|   |       projectAPI.tsx
|   |       split-view.tsx
|   |       upload-file.tsx
|   |       uploadPipeline.tsx
|   |
|   \---ui
|           alert.tsx
|           badge.tsx
|           button.tsx
|           CropModal.tsx
|           EditorToolbar.tsx
|           FormModal.tsx
|           icons.tsx
|           label.tsx
|           logo.tsx
|           MapToolbar.tsx
|           navbar.tsx
|           radio-group.tsx
|           return-service-name.tsx
|           slider.tsx
|           sniperScope.tsx
|           table.tsx
|           tooltip.tsx
|           WarningExitModal.tsx
|
+---docker
|       dev.Dockerfile
|       prod.Dockerfile
|
+---lib
|       utils.ts
|
\---public
    |   map-pin.svg
    |   next.svg
    |   vercel.svg
    |
    \---gifs
            addpoint.gif
            coordtable.gif
            crop.gif
            finishref.gif
            navbar.gif
            overlay.gif
            splitview.gif
```

## Directories

The app is mostly following a common Next.js app layout, but we are going to mention the folders in short and any deviations.

* **app:** Contains the landing page and default layout and sub-folders for sub-pages.
* **app/[subfolder]:** Sub-folders are used for Next-routing, and each contain a page: About (info page), Privacy (info page), and Editor (the main application)
* **components:** Main folder of components, only contains categorised sub-folders.
* **components/component:** This folder contains most of the application-specific components, such as the Editor, the ProjectAPI, and the CoordinateList
* **components/ui:** This folder contains more UI specific components, such as the Logo, the toolbars, and modals, as well as generic components such as button, badge, table etc.
* **docker:** Contains development and production Docker-files.
* **lib:** Contains utils.ts, which provides a utility function for conditionally applying and merging Tailwind CSS classes.
* **public:** Contains static files, such as SVG-files used and the GIFs used for the in-app help section.

## Files


### Major Components
Below are various major components used that are responsible for the main functionality of the application.

1. `editor.tsx` : This is the main component, which utilizes most of the components mentioned below. It acts as a container for the different views and functions.
2. `split-view.tsx` : The split view, which contains the main logic for georeferencing, with map view on the left and image view on the right.
3. `overlayview.tsx` : The overlay view, which takes the georeferenced image and let's the user display a tiled preview of how it looks post-georeference.
4. `moveImage.tsx` : The main logic of letting the user pan and zoom the image, which is utilized in Split View. 
5. `projectAPI.tsx` : The main project API file, which handles all interaction between the front-end project view and the data and files handled in the back-end.
6. `uploadPipeline.tsx` : A pipeline for handling files from user upload to project. It uses the `upload-file.tsx`, `pdfSelector.tsx`, and `conversion.tsx` components to guide the file and user from upload to fully converted, ready for use.
7. `EditorToolbar.tsx` : The top toolbar of the Editor, for project naming, changing views, getting help, and downloading files etc.
8. `MapToolbar.tsx` : Generic toolbar to be used together with a MapBox map, for utilities used within that view.
9. `sniperScope.tsx` : The "sniper scope" used to place points in the Split View.

### Config & Auto Generated Files
Below are some configuration and auto generated files that are beneficial to be aware of.

1. `.env` & `.env.example` : The environment file and an example, used to configurate various URLs and API keys.
1. `package.json` : This contains all of the various packages the project depends on, such as Allotment, MapBox GL, etc.
