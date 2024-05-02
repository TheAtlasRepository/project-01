import React, { useState } from 'react';
import { Button } from "@/components/ui/button";

interface HelpModalProps {
    onClose: () => void;
    currentPage: number;
    setCurrentPage: (page: number) => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ onClose, currentPage, setCurrentPage }) => {
    const pages = [
        <div>
            <h1 className='text-3xl font-bold'>Welcome!</h1>
            <hr className='my-3' />
            <p>Welcome to the georeferencing tool! Let's start with a quick recap; what is georeferencing? <br></br>
            Georeferencing is the process of assigning real-world coordinates to each pixel of a digital image or map.By doing this, 
            the image or map can be accurately placed on a global map in its real world location. This allows the image to be viewed and analyzed in relation to other geographical data.

            </p>
        </div>,
        <div>
        <h1 className='text-3xl font-bold'>Welcome!</h1>
        <hr className='my-3' />
        <p>Understanding how to navigate the interface will help you make the most of our nifty features. <br></br>
        <b>Split View:</b> Initially, you will see a split-screen layout with a globe-map on the left and your uploaded image or pdf page on the right. 
        You will be able to move your uploaded file around the canvas as well as zoom in and out. You can move around the globe by using the naviagtion buttons located bottom right,
        or by dragging and zooming. Alternatively you can also use the search box in the bottom left
        to find the location you want. The globe map also has a button on the top left for toggling between Streets/Satelite view. <br></br>
        <b>Navbar:</b> The navbar at the top of the screen contains various useful buttons. You can toggle between Split View and Overlay (Overlay is only available once you've georeferenced your image), 
        Crop which will open your uploaded file in a window where you can crop it, Help will open this guide, Feedback opens a form you can fill out if you have any feedback you'd like to give us, Download
        will download your georeferenced file as a .TIFF file, and finally Exit Editor will take you back to the main page. <br></br>
        <b>Overlay:</b> When you have georeferenced your file you can switch to the Overlay mode where the image is superimposed directly over the map. 
        This mode is helpful for comparing your alignment and to ensure the accuracy of your georeferencing. Adjust the image overlay opacity to see how the image fits over the map terrain using the slider on the top left.
        </p>
    </div>,
    
        <div>
        <h1 className='text-3xl font-bold'>Welcome!</h1>
        <hr className='my-3' />
        <b>Adding Points in order to georeference:</b>
        Accurate georeferencing depends significantly on correctly placing enough points on both the map and the corresponding image. Here's how you can effectively add points to ensure precise alignment.
        <br></br>
        <b>Starting the Process:</b>
        <ul>

            <li>● Begin by identifying clear landmarks on your image that are also visible on the map. These could be building corners, intersections, or distinctive natural features.</li>
            <li>● Click anywhere on the map or your image, the crosshair tool will appear. Move the crosshair to where you want to add the point and confirm. Now click on the opposite view (map or image) 
                of the one you placed a point on, move the crosshair to the corresponding location and confirm. Repeat this process until you have 3 points or more. </li>
            <li>● If you need to delete a point you can manage your points by clicking on the button labeled "Coordinates". 
                There your points will be listed with their coordinates on the globe map and the pixel coordinates on your image.</li>
        </ul>


      
        

        
    </div>,,
        // Add more pages as needed
    ];

    const nextPage = () => {
        if (currentPage < pages.length - 1) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-[9999] backdrop-blur-md">
            <div className="bg-white dark:bg-gray-900 shadow-xl rounded-lg overflow-hidden w-full max-w-2xl flex flex-col z-60">
                <div className="p-6 flex-1 flex flex-col gap-2 justify-between min-h-[80vh] max-h-[80vh]">
                    <div className='text-primary overflow-y-auto'>
                        {pages[currentPage]}
                    </div>
                    <div className="flex justify-end">
                        <Button onClick={prevPage} disabled={currentPage === 0} variant={"default"} className='mr-3 border border-gray-300 bg-gray-100 dark:bg-gray-700 text-black dark:text-white dark:hover:bg-black w-1/6'>Previous</Button>
                        <Button onClick={onClose} variant={"default"} className='mr-3 border border-gray-300 bg-red-100 dark:bg-gray-700 text-black dark:text-white dark:hover:bg-black w-1/6'>Close</Button>
                        <Button onClick={nextPage} disabled={currentPage === pages.length - 1} variant={"default"} className='dark:bg-gray-700 dark:text-white dark:hover:bg-black w-1/6'>Next</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HelpModal;