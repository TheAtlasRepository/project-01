import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import axios from 'axios';

export default function ImageEdit({ editBool, onCrop }: { editBool: boolean, onCrop: () => void }) {
    const [crop, setCrop] = useState<Crop>(); 
    const [imageSrc, setImageSrc] = useState(localStorage.getItem("pdfData")!); // Keeps track of image URL
    const [applyButtonText, setApplyButtonText] = useState('Apply Crop');
    const [buttonsDisabled, setButtonsDisabled] = useState(false);

    // When the user requests to apply the crop
    const handleApplyCrop = async () => {
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

            //Try to send a request to the API
            try {
                // Send a POST request to the API with the coordinates and file
                const response = await axios.post(`http://localhost:8000/converter/cropPng?p1x=${p1x}&p1y=${p1y}&p2x=${p2x}&p2y=${p2y}`, formData, {
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

    return (
        <>
            {editBool ? (
                <div className="flex flex-col justify-items-center card p-10 shadow-lg">
                    <div>
                        <h1 className="text-2xl font-bold mb-4 text-primary">Crop Image</h1>
                    </div>
                    <div>
                        <ReactCrop
                            crop={crop}
                            onChange={(newCrop) => setCrop(newCrop)}
                        >
                            <img src={imageSrc} alt="Image" />
                        </ReactCrop>
                    </div>
                    <div className="flex flex-row justify-end">
                        <Button
                            className="btn bg-red-600 hover:bg-red-700"
                            onClick={handleCancelCrop}
                            disabled={buttonsDisabled}
                        >
                            Cancel Crop
                        </Button>
                        <Button
                            className="btn ml-2 bg-green-600 hover:bg-green-700"
                            onClick={handleApplyCrop}
                            disabled={buttonsDisabled}
                        >
                            {applyButtonText}
                        </Button>
                    </div>
                </div>
            ) : (
                <img src={imageSrc} alt="Image" />
            )}
        </>
    );
}