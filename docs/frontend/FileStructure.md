# Filestruck

[Back to README](../README.md)

---
This file contains something?

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
        map-pin.svg
        next.svg
        vercel.svg
```

## Directories

Mosltly following a commen next.js app layout, but we are going to mention the folders in short and any deviations

* **app:** Contains . Sub-folders are used for Next-routing, and each contain 
* **app/[subfolder]:** 
* **components:**
* **components/component:**
* **components/ui:**
* **docker:**
* **lib:**
* **public:**

## Files

## Config & Auto Generated Files
