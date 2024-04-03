import { RotateLoader } from 'react-spinners';
import { useRouter } from "next/navigation";
import { useRef, useState, useEffect } from "react";

import axios from "axios";

type ConversionProps = {
    fileType: string | null;
    fileUrl: string | null;
    pageNumber: number | null;
    clearStateRequest: () => void;
};

const Conversion: React.FC<ConversionProps> = ({ fileType, fileUrl, pageNumber, clearStateRequest }) => {
  const router = useRouter();
  const hasMadeApiCall = useRef(false);
  const [isLargeFile, setLargeFile] = useState<boolean>(false);

  // Base URL for the backend API from .env
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;


  // Convert Image or PDF to PNG after component has been rendered on the client side.
  useEffect(() => {
    if (typeof window !== "undefined" && !hasMadeApiCall.current) {
      const pdfDataFromLocalStorage = window.localStorage.getItem("pdfData");

      // Check if pdfData is already in local storage
      if (pdfDataFromLocalStorage !== null) {
        // Parse the data from local storage
        const parsedData = JSON.parse(pdfDataFromLocalStorage);
        const fileType = parsedData.type;

        // Fetch the Blob from the URL
        fetch(parsedData.url)
          .then((res) => res.blob())
          .then((blob) => {
            // Check if the file is larger than 1 MB
            if (blob.size / (1024 * 1024) > 1) {
              setLargeFile(true);
            }

            // Create a FormData object to send the file to the API
            const formData = new FormData();
            formData.append("file", blob, "");        

            // Handle different the different file types
            if (fileType === "image/png") {
              // Create a Blob URL from the fetched Blob
              const fileURL = URL.createObjectURL(blob);

              // Save the Blob URL to local storage
              window.localStorage.setItem("pdfData", fileURL);

              //push to Editor
              router.push("/Editor");

              // Pass the Blob to the handleFileUpload function
              handleFileConversion(null, null, blob);
            } else if (fileType === "application/pdf") {
              // Make API call for PDF file
              handleFileConversion(`${BASE_URL}/converter/pdf2png?page_number=${pageNumber || 1}`, formData);
            } else if (fileType.startsWith("image/")) {
              // Make a different API call for other image files
              handleFileConversion(`${BASE_URL}/converter/image2png`, formData);
            } else {
              goToUpload("The file you uploaded is not supported.");
            }
          });
      }
      hasMadeApiCall.current = true; // Set to true so that the API call is only made once
    }
  }, []);

  // Function to handle file conversion
  // Url is the API endpoint to convert the file
  // formData is the file data
  // blob is the Blob of the file
  function handleFileConversion(url: string | null, formData: any, blob: Blob | null = null) {
    // If no URL is provided, we assume the file is already a PNG Blob and go straight to the Editor
    if (url === null) {
      //push to Editor
      router.push("/Editor");
      return;
    }

    // Make API call to convert the file
    axios
    .post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      responseType: "blob", // Tell axios to expect a Blob
    })
    .then((response) => {
      // Create a Blob URL from the returned file
      const fileURL = blob ? URL.createObjectURL(blob) : URL.createObjectURL(response.data);

      // Save the Blob URL to local storage
      window.localStorage.setItem("pdfData", fileURL);

      //push to Editor
      router.push("/Editor");
    })
    .catch((error) => {
      if (error.response && error.response.status === 415) {
        goToUpload("The file type you uploaded is not supported.");
      } else {
        goToUpload("An error occurred.");
      }
    });
  }

  // Function to push to UploadFile with an error message
  function goToUpload(string = "An error occurred.") {
    clearStateRequest();
    router.push("/?e=" + string);
    router.prefetch("/");
    router.refresh();
  }

  return (
    <div className="flex flex-col bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-xl">
            <div className="rounded-lg border-4 border-dashed p-10 py-20 text-center dark:border-gray-800">
                <div className="p-10 text-center text-gray-300">
                    <h1>Getting your file ready</h1>
                    { isLargeFile && <p>This may take some time for larger files</p>}
                </div>
                <RotateLoader color="#9CA3AF"/>
            </div>
        </div>
    </div>
  );
}

export default Conversion;