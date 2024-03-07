import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import SplitView from "./split-view";
import ImageEdit from "./imageEdit";
import {
  OpenBook,
  TargetIcon,
  WindowsIcon,
  SelectionIcon,
} from "@/components/ui/icons";
import * as api from "./projectAPI";

export default function Editor() {
  const [projectId, setProjectId] = useState(1);
  const [projectName, setProjectName] = useState("Project 1");
  const [isAutoSaved, setIsAutoSaved] = useState(false);
  const [isSideBySide, setIsSideBySide] = useState(false); // Add state for side by side toggle
  const [wasSideBySide, setWasSideBySide] = useState(false);
  const [isCrop, setIsCrop] = useState(false);
  const [imageSrc, setImageSrc] = useState(localStorage.getItem("pdfData")!); // Keeps track of image URL
  const [isCoordList, setIsCoordList] = useState(true); // Add state for coordinates table

  //function to add a new project
  const addProject = (name: string) => {
    //make API call to add project
    api
      .addProject(name)
      .then((data) => {
        // handle success
        console.log("Success:", data);
        setProjectId(data.id);
      })
      .catch((error) => {
        // handle error
        console.error("Error:", error.message);
      });
  };

  //call the addProject function when the component mounts
  useEffect(() => {
    addProject(projectName);
    console.log("Project added");
  }, []);

  const handleSave = () => {
    setIsAutoSaved(true);
  };

  const handleToggleSideBySide = () => {
    if (!isCrop) {
      setIsSideBySide(!isSideBySide); // Toggle the value of isSideBySide
      console.log(isSideBySide); // Log the value of isSideBySide
    }
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

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="flex items-center justify-between p-4 background-dark shadow-md">
        <div className="items-center text-white">
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="text-xl font-semibold bg-transparent border-none outline-none"
            placeholder="Project name" // Add placeholder attribute
          />
          {isAutoSaved && (
            <span className="text-sm text-gray-500">Auto saved</span>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <Button
            className={`${
              isSideBySide ? "bg-blue-500" : "bg-gray-700"
            } hover:bg-blue-800 dark:hover:bg-blue-800`}
            variant="toggle"
            onClick={handleToggleSideBySide} // Add onClick event handler
          >
            <OpenBook className="text-white" />
            Side by side
          </Button>
          <Button
            className="bg-gray-200 dark:bg-gray-700 hover:bg-blue-800 dark:hover:bg-blue-800"
            variant="secondary"
          >
            <WindowsIcon className="text-gray-500" />
            Overlay
          </Button>
          <Button
            className={`${
              isCoordList ? "bg-blue-500" : "bg-gray-700"
            } hover:bg-blue-800 dark:hover:bg-blue-800`}
            variant="toggle"
            onClick={handleToggleCoordTable}
          >
            <TargetIcon className="text-gray-500" />
            <span>Coordinates</span>
          </Button>
          <Button
            className={`${
              isCrop ? "bg-blue-500" : "bg-gray-700"
            } hover:bg-blue-800 dark:hover:bg-blue-800`}
            variant="toggle"
            onClick={handleToggleCrop} // Add onClick event handler
          >
            <SelectionIcon className="text-white" />
            Crop
          </Button>
        </div>
        <Button
          className="bg-gray-200 dark:bg-gray-700 dark:hover:bg-blue-800 dark:text-white"
          onClick={handleSave}
        >
          Continue
        </Button>
      </div>
      {isSideBySide ? (
        <SplitView
          // pass isCoordList to the SplitView component
          isCoordList={isCoordList}
          projectId={projectId}
        />
      ) : (
        <div
          className={`flex flex-col items-center justify-center flex-1 ${
            !isCrop
              ? "bg-gray-100 dark:bg-gray-900"
              : "bg-gray-400 dark:bg-gray-800"
          }`}
        >
          <div className="flex items-center justify-center w-full">
            <div className="w-1/2 flex justify-center items-center">
              <ImageEdit
                editBool={isCrop}
                onCrop={handleCrop} // When the user has cropped the image
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
