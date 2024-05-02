import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import HelpModalPage from './HelpModalPage';

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
            <p>
                Welcome to the georeferencing tool and the help section! Take a look around if there's something you're not quite sure of: <br />
                <br />
                <a className='font-bold hover:underline hover:cursor-pointer' onClick={() => setCurrentPage(1)}>Introduction - What is georeferencing?</a><br />
                <br />
                <a className='font-bold hover:underline hover:cursor-pointer' onClick={() => setCurrentPage(2)}>Navigating around - Navbar</a><br />
                <a className='font-bold hover:underline hover:cursor-pointer' onClick={() => setCurrentPage(3)}>Navigating around - Split View</a><br />
                <a className='font-bold hover:underline hover:cursor-pointer' onClick={() => setCurrentPage(4)}>Navigating around - Overlay</a><br />
                <a className='font-bold hover:underline hover:cursor-pointer' onClick={() => setCurrentPage(5)}>Navigating around - Crop Mode</a><br />
                <br />
                <a className='font-bold hover:underline hover:cursor-pointer' onClick={() => setCurrentPage(6)}>Adding Points</a><br />
                <a className='font-bold hover:underline hover:cursor-pointer' onClick={() => setCurrentPage(7)}>The Split View Toolbar</a><br />
                <a className='font-bold hover:underline hover:cursor-pointer' onClick={() => setCurrentPage(8)}>The Overlay Toolbar</a><br />
                <a className='font-bold hover:underline hover:cursor-pointer' onClick={() => setCurrentPage(9)}>The Coordinate Table</a><br />
                <br />
                <a className='font-bold hover:underline hover:cursor-pointer' onClick={() => setCurrentPage(10)}>Help Modal</a><br />
                <a className='font-bold hover:underline hover:cursor-pointer' onClick={() => setCurrentPage(11)}>Feedback Form</a><br />
                <a className='font-bold hover:underline hover:cursor-pointer' onClick={() => setCurrentPage(12)}>Download File</a><br />
                <a className='font-bold hover:underline hover:cursor-pointer' onClick={() => setCurrentPage(13)}>Exiting The Editor</a><br />
            </p>
        </div>,

        <HelpModalPage title="Introduction" setCurrentPage={setCurrentPage}>
            Welcome to the georeferencing tool! Let's get started with a quick introduction: <br />
            <br />
            <b>What is georeferencing?</b><br />
            Georeferencing is the process of assigning real-world coordinates to each pixel of a digital image (or map). By doing this, 
            the image (or map) can be accurately placed on a global map in its real world location.
            This allows the image to be viewed and analyzed in relation to other geographical data.
        </HelpModalPage>,

        <HelpModalPage title="Navigating around - Navbar" setCurrentPage={setCurrentPage}>
            Understanding how to navigate the interface will help you make the most of our nifty features. <br></br>
            <br />
            <img className='border border-gray-300 rounded-md shadow-sm' src="/helpgifs/navbar.gif" alt="Gif showing how to use the navbar" />
            <br />
            <b>Let's start with the navbar,</b> which is divided into three sections: <br />
            <i>The left section</i> contains the project name. This sets the name of the file you download. <br />
            <i>The middle section</i> contains the current view mode. You can switch between Split View, Overlay, and Crop mode here.
            Overlay is enabled once you have completed your initial georeference, which is after you have placed 3 pairs.<br />
            <i>The right section</i> contains other useful buttons such as Help, Feedback, Download, and Exit Editor. 
            Download is also enabled once you have completed your initial georeference.<br />
        </HelpModalPage>,

        <HelpModalPage title="Navigating around - Split View" setCurrentPage={setCurrentPage}>
            When the application is loaded, you will see a split-screen layout with a globe-map on the left and your uploaded image or pdf page on the right. 
            You will be able to move your uploaded file around the canvas as well as zoom in and out. You can move around the globe by using the naviagtion buttons located bottom right,
            or by dragging and zooming. Alternatively you can also use the search box in the bottom left
            to find the location you want. The globe map also has a button on the top left for toggling between Streets/Satelite view.
            <img className='border border-gray-300 my-5 rounded-md shadow-sm' src="/helpgifs/splitview.gif" alt="Gif showing how to use the split view" />
        </HelpModalPage>,

        <HelpModalPage title="Navigating around - Overlay" setCurrentPage={setCurrentPage}>
            When you have georeferenced your file you can switch to the Overlay mode where the image is superimposed directly over the map. 
            This mode is helpful for comparing your alignment and to ensure the accuracy of your georeferencing, 
            and it also acts as a preview of the file you can download.
            You can adjust the image overlay opacity to see how the image fits over the map terrain by using the slider on the top left.
            <img className='border border-gray-300 my-5 rounded-md shadow-sm' src="/helpgifs/overlay.gif" alt="Gif showing how to use the overlay" />
        </HelpModalPage>,

        <HelpModalPage title="Navigating around - Crop Mode" setCurrentPage={setCurrentPage}>
            Use the borders to crop your image to the desired size, and press Apply Crop to save the changes. If you wish to cancel, you can either press the Cancel Crop button or click a view on the navbar. Leaving the crop mode will discard any changes made, unless you have applied a crop.
            <img className='border border-gray-300 my-5 rounded-md shadow-sm' src="/helpgifs/crop.gif" alt="Gif showing how to use the crop mode" />
        </HelpModalPage>,

        <HelpModalPage title="Adding Points" setCurrentPage={setCurrentPage}>
            <b>Adding Points in order to georeference:</b>
            Accurate georeferencing depends significantly on correctly placing enough points on both the map and the corresponding image. Here's how you can effectively add points to ensure precise alignment.
            <br /> <br />
            <b>Starting the Process:</b>
            <ul>
                <li>● Begin by identifying clear landmarks on your image that are also visible on the map. These could be building corners, intersections, or distinctive natural features.</li>
                <li>● Click anywhere on the map or your image, the crosshair tool will appear. Move the crosshair to where you want to add the point and confirm. Now click on the opposite view (map or image) 
                    of the one you placed a point on, move the crosshair to the corresponding location and confirm. Repeat this process until you have 3 points or more. </li>
                <li>● If you need to delete a point you can manage your points by clicking on the button labeled "Coordinates". 
                    There your points will be listed with their coordinates on the globe map and the pixel coordinates on your image.</li>
            </ul>
            <br />
            <img className='border border-gray-300 my-5 rounded-md shadow-sm' src="/helpgifs/addpoint.gif" alt="Gif showing how to add points" />
        </HelpModalPage>,

        <HelpModalPage title="The Split View Toolbar" setCurrentPage={setCurrentPage}>
            <b>The toolbar on the top left during split view, beneath the navbar, contains the following tools:</b> <br />
            <i>Map Style Switch</i> - Switch between Streets and Satellite view using the radio buttons. <br />
            <i>Coordinate table</i> - Open a table showing the coordinates of the points you have placed. <br />
            <i>Info Box</i> - A small box that shows information about where you are in the process. This will show the number of points are needed for georeferencing, 
            and if the application is currently referencing your project. <br />
        </HelpModalPage>,

        <HelpModalPage title="The Overlay Toolbar" setCurrentPage={setCurrentPage}>
            <b>The toolbar on the top left during overlay view, beneath the navbar, contains the following tools:</b> <br />
            <i>Map Style Switch</i> - Switch between Streets and Satellite view using the radio buttons. <br />
            <i>Image Overlay Opacity slider</i> - Change the opacity of the overlayed image to see how it fits over the map terrain. <br />
        </HelpModalPage>,

        <HelpModalPage title="The Coordinate Table" setCurrentPage={setCurrentPage}>
            <b>The coordinate table is a useful tool for managing your points.</b> 
            It displays the coordinates of the points you have placed on the map and the corresponding pixel coordinates on your image.
            You can also delete points from this table by clicking the delete button next to each point.
            This will remove the point from the map and the image, and is useful for correcting mistakes or starting over.
            <img className='border border-gray-300 my-5 rounded-md shadow-sm' src="/helpgifs/coordtable.gif" alt="Gif showing how to use the coordinate table" />
        </HelpModalPage>,

        <HelpModalPage title="Help Modal" setCurrentPage={setCurrentPage}>
        <b>This is where you are now!</b><br />
        The help modal is a quick guide to help you navigate the georeferencing tool. 
        You can use the buttons at the bottom of the modal to navigate between pages, or close the modal to return to the editor
        (but you probably already knew all of this).
        </HelpModalPage>,

        <HelpModalPage title="Feedback Form" setCurrentPage={setCurrentPage}>
            We would love to hear from you! If you have any feedback, suggestions, or bug reports, please fill out the feedback form. 
            We appreciate your input and will use it to improve the georeferencing tool.
        </HelpModalPage>,

        <HelpModalPage title="Download File" setCurrentPage={setCurrentPage}>
            Once you have placed at least 3 points, the download button will become active. 
            Clicking the download button will download the georeferenced image.
            The file you receive is in TIFF format and contains metadata about where it exists in the world, 
            which allows it to be opened in GIS software.
        </HelpModalPage>,

        <HelpModalPage title="Exiting The Editor" setCurrentPage={setCurrentPage}>
            When you are finished georeferencing, you can exit the editor by clicking the "Exit Editor" button in the top right corner of the navbar.
            <b>This is the preferred way to finish up a project,</b> as it makes sure that any remnants of your project is properly cleaned up.
            This will return you to the homepage of the georeferencing tool.
        </HelpModalPage>
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
                        <Button onClick={prevPage} disabled={currentPage === 0} variant={"default"} className='mr-3 border border-gray-300 bg-gray-100 dark:bg-gray-700 text-black dark:text-white dark:hover:bg-black w-1/6 hover:bg-gray-300'>Previous</Button>
                        <Button onClick={onClose} variant={"default"} className='mr-3 border border-gray-300 bg-red-100 dark:bg-gray-700 text-black dark:text-white dark:hover:bg-black w-1/6 hover:bg-red-300'>Close</Button>
                        <Button onClick={nextPage} disabled={currentPage === pages.length - 1} variant={"default"} className='dark:bg-gray-700 dark:text-white dark:hover:bg-black w-1/6'>Next</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HelpModal;