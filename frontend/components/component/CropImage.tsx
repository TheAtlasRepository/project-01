import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import CropModal from "@/components/ui/CropModal";
import axios from 'axios';

type CropImageProps = {
    onCrop: () => void;
    resetMarkerRequest: () => void;
    placedMarkerAmount?: number;
    projectId: number;
};

export default function CropImage({ onCrop, resetMarkerRequest, placedMarkerAmount, projectId }: CropImageProps) {
    const [crop, setCrop] = useState<Crop>(); 
    const [imageSrc, setImageSrc] = useState(localStorage.getItem("pdfData")!); // Keeps track of image URL
    const [applyButtonText, setApplyButtonText] = useState('Apply Crop');
    const [buttonsDisabled, setButtonsDisabled] = useState(false);
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);

    // Base URL for the backend API from .env
    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    // When the user requests to apply the crop
    const handleApplyCrop = async () => {
        setIsCropModalOpen(false);
        setApplyButtonText('Applying...');
        setButtonsDisabled(true);

        // Make sure that there is crop data, return if not
        if (!crop) {
            console.log("No crop data!");
            return;
        }

        // Get the displayed image size
        const imageElement = document.querySelector('img');
        if (!imageElement) {
            console.log("No image element found!");
            return;
        }
        const displayedWidth = imageElement.clientWidth;
        const displayedHeight = imageElement.clientHeight;

        // Get the original image for comparison
        const originalImage = new Image();
        originalImage.onload = async () => {
            // Get the original image size
            const originalWidth = originalImage.width;
            const originalHeight = originalImage.height;

            // Calculate the scale factor
            const scaleFactorX = originalWidth / displayedWidth;
            const scaleFactorY = originalHeight / displayedHeight;

            // If the crop unit is %, convert the crop data to pixels, as the API requires pixel coordinates
            if (crop.unit === '%') {
                console.log("Crop data is in percentage, not pixels!");
                // Convert the crop data to pixels
                crop.x = crop.x * displayedWidth / 100;
                crop.y = crop.y * displayedHeight / 100;
                crop.width = crop.width * displayedWidth / 100;
                crop.height = crop.height * displayedHeight / 100;
            }

            // Set the coordinates for the top-left corner, and calculate the coordinates of the bottom-right corner.
            // Then scale the coordinates to the original image size.
            // (Values need to be rounded to the nearest whole number to avoid issues with the API.)
            const p1x = Math.round(crop.x * scaleFactorX);
            const p1y = Math.round(crop.y * scaleFactorY);
            const p2x = Math.round((crop.x + crop.width) * scaleFactorX);
            const p2y = Math.round((crop.y + crop.height) * scaleFactorY);

            // Fetch the Blob from the blob URL
            const response = await fetch(imageSrc);
            const blob = await response.blob();

            // Create a FormData and add the blob file
            const formData = new FormData();
            formData.append('file', blob, 'filename');

            // Base URL for the backend API from .env
            const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

            //Try to send a request to the API
            try {
                // Send a POST request to the API with the coordinates and file
                const response = await axios.post(`${BASE_URL}/converter/cropPng?p1x=${p1x}&p1y=${p1y}&p2x=${p2x}&p2y=${p2y}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    responseType: 'blob' // Tell axios to expect a Blob in the response
                });

                // Convert the response data to a Blob
                const newBlob = new Blob([response.data], { type: 'image/png' });

                // Convert the new Blob to a Blob URL
                const blobUrl = URL.createObjectURL(newBlob);

                // Update the source URL of the image
                window.localStorage.setItem("pdfData", blobUrl);
                
                // Tell the current component and parent component that the image has been cropped
                setImageSrc(localStorage.getItem("pdfData")!);
                onCrop();

                // Reset the crop state, use max width and height
                setCrop({
                    unit: '%',
                    x: 0,
                    y: 0,
                    width: 100,
                    height: 100,
                });
            } catch (error) {
                // Log any errors
                console.error('Error:', error);
            }

            // Reset the apply button text
            setApplyButtonText('Apply Crop');
            setButtonsDisabled(false);
        };
        originalImage.src = imageSrc;
    };

    // When the user requests to cancel the crop
    const handleCancelCrop = () => {
        // Reset the crop state, use max width and height
        setCrop({
            unit: '%',
            x: 0,
            y: 0,
            width: 100,
            height: 100,
        });
        onCrop();
    };

    // Deletes all markers from project and applies the crop
    const deleteMarkersAndApplyCrop = () => {
        removeMarkersApiRequest(); // local function
        resetMarkerRequest(); // passed as prop
        handleApplyCrop();
    };

    // Contacts API and deletes all markers from project
    const removeMarkersApiRequest = () => {
        console.log("Deleting project points...");
        axios.delete(`${BASE_URL}/project/${projectId}/points`, {
            headers: {
                'accept': 'application/json'
            }
        })
        .then(response => {
            console.log(response.data);
        })
        .catch(error => {
            console.error('Error deleting data: ', error);
        });
    };

    // Shows the crop modal if there are placed markers, otherwise just applies the crop
    const applyCropOrShowModal = () => {
        if (placedMarkerAmount && placedMarkerAmount > 0) {
            setIsCropModalOpen(true);
            return;
        }
        
        handleApplyCrop();
    };

    return (
        <div className="flex flex-col justify-items-center card p-10 shadow-lg dark:bg-gray-900">
            <div>
                <h1 className="text-2xl font-bold mb-4 text-primary dark:text-white">Crop Image</h1>
            </div>
            <div className='mx-auto'>
                <ReactCrop
                    crop={crop}
                    onChange={(newCrop) => setCrop(newCrop)}
                >
                    <img src={imageSrc} alt="Image" />
                </ReactCrop>
            </div>
            <div className="flex flex-row justify-end">
                <Button
                    className="btn bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 dark:text-white"
                    onClick={handleCancelCrop}
                    disabled={buttonsDisabled}
                >
                    Cancel Crop
                </Button>
                <Button
                    className="btn ml-2 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 dark:text-white"
                    onClick={applyCropOrShowModal}
                    disabled={buttonsDisabled}
                >
                    {applyButtonText}
                </Button>
                {isCropModalOpen && <CropModal onCancel={() => setIsCropModalOpen(false)} onConfirm={() => deleteMarkersAndApplyCrop()}/>}
            </div>
        </div>
    );
}