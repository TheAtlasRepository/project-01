import { useState, useEffect } from "react";
import SplitView from "./split-view";
import CropImage from "./CropImage";
import * as api from "./projectAPI";
import OverlayView from "./overlayview";
import EditorToolbar, { ViewPage } from "@/components/ui/EditorToolbar";
import { Split } from "lucide-react";

export default function Editor() {
  const [projectId, setProjectId] = useState(0);
  const [projectName, setProjectName] = useState("Project 1");
  const [isAutoSaved, setIsAutoSaved] = useState(false);
  const [isSideBySide, setIsSideBySide] = useState(false); // Add state for side by side toggle
  const [isOverlay, setIsOverlay] = useState(false); // Add state for crop toggle
  const [wasSideBySide, setWasSideBySide] = useState(false);
  const [isCrop, setIsCrop] = useState(false);
  const [imageSrc, setImageSrc] = useState(localStorage.getItem("pdfData")!); // Keeps track of image URL
  const [isCoordList, setIsCoordList] = useState(true); // Add state for coordinates table
  const [activePage, setActivePage] = useState<ViewPage>('sideBySide');

  // Array containing pairs of georeferenced markers and their corresponding image markers
  const [georefMarkerPairs, setGeorefMarkerPairs] = useState<
    { latLong: [number, number]; pixelCoords: [number, number] }[]
  >([]);
  const [mapMarkers, setMapMarkers] = useState<
    { geoCoordinates: [number, number] }[]
  >([]);

  const [imageMarkers, setImageMarkers] = useState<
    { pixelCoordinates: [number, number] }[]
  >([]);


  //function to add a new project
  const addProject = (name: string) => {
    //make API call to add project
    api
      .addProject(name)
      .then((data) => {
        // handle success
        console.log("Success:", data);
        setProjectId(data.id);
        console.log("Project ID:", data.id);
        uploadImage(data.id);
      })
      .catch((error) => {
        // handle error
        console.error("Error:", error.message);
      });
  };

  //upload image function to upload the blob url imgsrc to the server
  const uploadImage = async (projectId: number) => {
    try {
      // Convert blob URL to blob
      const response = await fetch(imageSrc);
      const blob = await response.blob();

      // Create a FormData object and append the blob as 'file'
      const formData = new FormData();
      // Here assuming you want to send the file with a generic name, you can customize it
      formData.append("file", blob, "image.png");

      // Make API call to upload the image
      await api.uploadImage(projectId, formData);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  //call the addProject function when the component mounts
  useEffect(() => {
    addProject(projectName);
    console.log("Project added");
  }, []);

  const handleSave = () => {
    setIsAutoSaved(true);
  };

  const handleToggleCrop = () => {
    if (!isCrop) {
      setWasSideBySide(isSideBySide); // Save the current value of isSideBySide
      setIsSideBySide(false); // Set isSideBySide to false when cropping is activated
      setIsCoordList(false); // Close the coordinates table when cropping is activated
    } else {
      setIsSideBySide(wasSideBySide); // Restore the value of isSideBySide when cropping is deactivated
    }

    setIsCrop((prevCrop) => !prevCrop); // Toggle the value of isCrop

    console.log(isCrop); // Log the value of isSideBySide
  };

  // Update the image source when the user has cropped the image, and close the crop tool
  const handleCrop = () => {
    setImageSrc(localStorage.getItem("pdfData")!);
    handleToggleCrop();
  };

  // Add the handleToggleCoordTable function
  const handleToggleCoordTable = () => {
    setIsCoordList((prevIsCoordList) => !prevIsCoordList); // Toggle the value of isCoordTable
  };
  // Condtition to check if there are atleast 3 markers to display the coordinates table and the values are not 0
  const isGeorefValid = georefMarkerPairs.length >= 3 && georefMarkerPairs.every((pair) => pair.latLong.every((val) => val !== 0)) && georefMarkerPairs.every((pair) => pair.pixelCoords.every((val) => val !== 0));

  // Remove all placed markers
  const resetMarkerRequest = () => {
    // TODO: Implement the logic to reset all placed markers
    return;
  };

  // Handle download requests
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = localStorage.getItem("tiffUrl")!;
    link.download = "georeferenced.tiff";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

  return (
    <div className="flex flex-col h-screen bg-white">
      <EditorToolbar
        activePage={activePage}
        setActivePage={setActivePage}
        handleDownload={handleDownload}
        isAutoSaved={isAutoSaved}
        projectName={projectName}
        projectId={projectId}
        setProjectName={setProjectName}
        hasBeenReferenced={isGeorefValid}
      />

      {activePage === 'sideBySide' ? (
        console.log("Side by side view requested"),
        <SplitView
          projectId={projectId}
          setGeorefMarkerPairs={setGeorefMarkerPairs}
          georefMarkerPairs={georefMarkerPairs}
          mapMarkers={mapMarkers}
          setMapMarkers={setMapMarkers}
          imageMarkers={imageMarkers}
          setImageMarkers={setImageMarkers}
        />
      ) : activePage === 'overlay' ? (
        console.log("Overlay view requested"),
        <OverlayView
          projectId={projectId}
        />
      ) : activePage === 'crop' ? (
        console.log("Crop view requested"),
        <div className="flex flex-col items-center justify-center flex-1 bg-gray-400 dark:bg-gray-800">
          <div className="flex items-center justify-center w-full">
            <div className="w-1/2 flex justify-center items-center">
              <CropImage
                onCrop={handleCrop}
                resetMarkerRequest={resetMarkerRequest}
                placedMarkerAmount={1} // Todo: Use the actual number of placed markers
              />
            </div>
          </div>
        </div>
      ) : (
        // Just in case something goes wrong, display the SplitView as a fallback
        console.log("Error, displaying fallback view"),
        <SplitView
          projectId={projectId}
          setGeorefMarkerPairs={setGeorefMarkerPairs}
          georefMarkerPairs={georefMarkerPairs}
          mapMarkers={mapMarkers}
          setMapMarkers={setMapMarkers}
          imageMarkers={imageMarkers}
          setImageMarkers={setImageMarkers}
        />
      )}
    </div>
  );
}
