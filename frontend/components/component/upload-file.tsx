import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { UploadIconFolder } from "@/components/ui/icons";
import { InfoCircledIcon, ExclamationTriangleIcon, QuestionMarkCircledIcon } from '@radix-ui/react-icons'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import axios from "axios";
import { RotateLoader } from 'react-spinners';

type UploadFileProps = {
  clearStateRequest: () => void;
  onFileUpload: (fileUrl: string, fileType: string) => void;
};

const UploadFile: React.FC<UploadFileProps> = ({ onFileUpload, clearStateRequest }) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [serverIsRunning, setServerIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Base URL for the backend API from .env
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  //wrap the useSearchParams in suspense
  const params = useSearchParams();


  useEffect(() => {
    // If there is an error message in the URL, set the error message state to the value in the URL
    if (params.get("e")) {
      handleErrorMsg(params.get("e") as string);
    } 

    // Add this block
    axios.get(`${BASE_URL}/serverInfo/`)
      .then(response => {
        if (response.data.status === 'running') {
          setServerIsRunning(true);
          setIsLoading(false);
        }
      })
      .catch(error => {
        setServerIsRunning(false);
        setIsLoading(false);
      });
  }, [params]);

  // Handle file input change when user has used "Open a file"-button
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      checkFileType(file);
    }
  };

  // Handle drag over
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  // Handle file drop
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      checkFileType(file);
    }
  };

  // Check if file type is supported
  const checkFileType = (file: File) => {
    if (file) {
      // Clear any existing error message and set file type and name
      handleErrorMsg("");
      setFileName(file.name);

      // Return if file type is not supported
      if (file.type !== 'application/pdf' && !file.type.startsWith('image/')) {
        handleErrorMsg("File type not supported.");
        return;
      }

      // Read and save file to local storage
      const reader = new FileReader();
      reader.onload = () => {
          const blob = new Blob([reader.result as string], { type: file.type });
          const fileUrl = URL.createObjectURL(blob);
          localStorage.setItem(
              "pdfData",
              JSON.stringify({
                  url: fileUrl,
                  type: blob.type,
              })
          );

          // Call onFileUpload with the file type and the file URL
          onFileUpload(fileUrl, file.type);
      };
      reader.readAsArrayBuffer(file);

      // Delete previous PDF if it exists
      if (localStorage.getItem("pdfData")) {
          URL.revokeObjectURL(localStorage.getItem("pdfData")!);
          localStorage.removeItem("pdfData");
      }
    } else {
      handleErrorMsg("File type not supported.");
    }
  };

  const handleErrorMsg = (e: string) => {
    clearStateRequest();
    setErrorMessage(e);
  }

  return (
    <div className="mx-auto w-5/6 hidden sm:w-3/4 md:block md:w-1/2 lg:w-1/3 xl:w-1/4">
      {isLoading ? (
        <div className="rounded-lg border-4 border-dashed border-lb p-10 py-20 text-center transition-all dark:border-gray-800 text-primary text-xl min-h-96 h-96">
          <div className="h-full flex justify-center items-center mx-auto my-auto">
            <div>
              <RotateLoader color="#9CA3AF"/>
            </div>
            
          </div>
          
        </div>
      ) : (
        serverIsRunning ? (
          <div
            onClick={() => document.querySelector("input")?.click()}
            className="cursor-pointer"
          >
            <div
              className="rounded-lg border-4 border-dashed border-lb p-10 py-20 text-center transition-all hover:bg-gray-100 dark:hover:bg-gray-800 dark:border-gray-800 min-h-96"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <UploadIconFolder className="mx-auto mb-6 text-blue-300 dark:text-blue-600" />
              <div className="text-lg font-medium text-gray-400 text-pretty">
                Open, or drop your <b>image or PDF</b> here 
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <span> <QuestionMarkCircledIcon className="h-4 w-4 ml-1"/></span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Ideal images are maps, satellite photos, urban plans, etc.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                            
              </div>
              {fileName && (
                <div className="text-lg font-medium text-gray-400 mt-4">
                  {fileName}
                </div>
              )}
            </div>
  
            <input
              type="file"
              accept=".pdf, image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              className="mt-6 w-full bg-blue-600 text-white text-xl dark:text-gray-200 dark:bg-blue-800 dark:hover:bg-blue-900"
              variant="blue"
            >
              Open a file
            </Button>
          </div>
        ) : (
          <div className="rounded-lg border-4 border-dashed border-lb p-10 py-20 text-center transition-all dark:border-gray-800 text-primary text-xl min-h-96">
            <p className="text-2xl font-bold">Server's Taking a Coffee Break ☕️</p>
            <p>
              Oops! Looks like our server is on a short coffee break. We're working to perk it up.
              <br />
              <br />
              Please swing by later! ☕️
            </p>
          </div>
        )
      )}
      

      {errorMessage && (
        <Alert variant="destructive" className="mt-5 dark:bg-gray-900">
          <div className="flex items-start">
            <div>
              <ExclamationTriangleIcon className="h-4 w-4"/>
            </div>
            <div className="ml-2 flex flex-col justify-center">
              <AlertTitle>Error!</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </div>
          </div>
        </Alert>        
      )}
            
      <Alert variant="help" className="mt-5 xl:hidden dark:bg-gray-900">
        <div className="flex items-start">
          <div>
            <InfoCircledIcon className="h-4 w-4"/>
          </div>
          <div className="ml-2 flex flex-col justify-center">
            <AlertTitle>Just a heads up!</AlertTitle>
            <AlertDescription>This application is designed for desktop devices, and may not work as intended on smaller screens or mobile devices.</AlertDescription>
          </div>
        </div>
      </Alert>

      <Alert variant="help" className="mt-5 dark:bg-gray-900">
        <div className="flex items-start">
          <div>
            <InfoCircledIcon className="h-4 w-4"/>
          </div>
          <div className="ml-2 flex flex-col justify-center">
            <AlertTitle>This project is currently in Beta!</AlertTitle>
            <AlertDescription>Because of this, there may be features that don't work as intended or don't even work at all. <i>But don't worry, we're working on making the application ready!</i></AlertDescription>
          </div>
        </div>
      </Alert>
    </div>
  );
}

export default UploadFile;