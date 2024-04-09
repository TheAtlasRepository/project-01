import React from 'react';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  OpenBook,
  TargetIcon,
  WindowsIcon,
  SelectionIcon,
  TextDocumentIcon,
} from "@/components/ui/icons";
import FormModal from "@/components/ui/FormModal";
import WarningExitModal from '@/components/ui/WarningExitModal';
import { ViewVerticalIcon, StackIcon, CropIcon, FileTextIcon, DownloadIcon, ExitIcon } from '@radix-ui/react-icons'
import axios from 'axios';

export type ViewPage = 'sideBySide' | 'overlay' | 'coordTable' | 'crop'; // Pages in the editor, add more pages as needed

interface EditorToolbarProps {
    activePage: ViewPage;
    setActivePage: React.Dispatch<React.SetStateAction<ViewPage>>;
    handleDownload: () => void;
    isAutoSaved: boolean;
    projectName: string;
    projectId: number;
    setProjectName: (value: string) => void;
    hasBeenReferenced: boolean;
    //hasPlacedMarker: boolean;
}

const EditorToolbar = (props: EditorToolbarProps) => {

    const [activePage, setActivePage] = React.useState<ViewPage>(props.activePage); // Current page
    const [lastActivePage, setLastActivePage] = React.useState<ViewPage>(props.activePage); // Last active page (for remembering where the user were)
    const [isFormModalOpen, setFormModalOpen] = useState(false); // State to control the visibility of the feedback form modal
    const [hasPlacedMarker, setHasPlacedMarker] = useState(true); // State to check if the user has placed a marker
    const [isWarningExitModalOpen, setIsWarningExitModalOpen] = useState(false);

    // Base URL for the backend API from .env
    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    const handleButtonClick = (page: ViewPage) => {
        // If the user clicks on the active page, go to the last active page and return
        if (page === activePage) {
            setLastActivePage(page);
            setActivePage(lastActivePage);
            props.setActivePage(lastActivePage);
            return;
        }

        // If the user clicks on a different page, set the current page, and set new active page
        setLastActivePage(activePage); // Save the last active page
        setActivePage(page); // Set the active page in the toolbar
        props.setActivePage(page); // Set the view page in the parent component
    };

    // Handle feedback button click and show the feedback form modal
    const handleFeedbackClick = () => {
        setFormModalOpen(true);
    };

    // When the user clicks the Exit Editor button
    const handleExitEditor = () => {
        // If the user has placed a marker, show a warning modal
        if (hasPlacedMarker) {
            setIsWarningExitModalOpen(true);
            return;
        }

        deleteProjectAndRedirect();
    }

    // When the user confirms to exit the editor
    const deleteProjectAndRedirect = () => {
        // Exit the editor
        console.log("Requested to exit editor!");
        
        // Make API request to delete current project
        console.log("Deleting project...");
        axios.delete(`${BASE_URL}/project/${props.projectId}`, {
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

        // Redirect the user to the homepage
        window.location.href = "/";
    }

    return (
        <div className="flex items-center justify-between p-4 background-dark shadow-md">
            {/* Left Group */}
            <div className="items-center text-white">
                <input
                    type="text"
                    value={props.projectName}
                    onChange={(e) => props.setProjectName(e.target.value)}
                    className="text-xl font-semibold bg-transparent border-none outline-none"
                    placeholder="Project name" // Add placeholder attribute
                />
                {props.isAutoSaved && (
                    <span className="text-sm text-gray-500">Auto saved</span>
                )}
            </div>

            {/* Center Group */}
            <div className="flex items-center gap-4">
                <Button
                    className={`${activePage === 'sideBySide' ? "bg-blue-500 dark:bg-blue-500" : "bg-gray-700 dark:bg-gray-700"} hover:bg-blue-800 dark:hover:bg-blue-800 dark:text-white`}
                    onClick={() => handleButtonClick('sideBySide')}
                >
                    <ViewVerticalIcon className='text-white mr-2' width={20} height={20}/>
                    Split View
                </Button>
                <Button
                    className={`${activePage === 'overlay' ? "bg-blue-500 dark:bg-blue-500" : "bg-gray-700 dark:bg-gray-700"} hover:bg-blue-800 dark:hover:bg-blue-800 dark:text-white`}
                    onClick={() => handleButtonClick('overlay')}
                    disabled={!props.hasBeenReferenced}
                >
                    <StackIcon className='text-white mr-2' width={20} height={20}/>
                    Overlay
                </Button>
                {/*<Button
                    className={`${
                        props.isCoordList ? "bg-blue-500" : "bg-gray-700"
                    } hover:bg-blue-800 dark:hover:bg-blue-800`}
                    variant="toggle"
                    onClick={props.handleToggleCoordTable}
                >
                    <TargetIcon className="text-gray-500" />
                    <span>Coordinates</span>
                </Button>*/}
                <Button
                    className={`${activePage === 'crop' ? "bg-blue-500 dark:bg-blue-500" : "bg-gray-700 dark:bg-gray-700"} hover:bg-blue-800 dark:hover:bg-blue-800 dark:text-white`}
                    onClick={() => handleButtonClick('crop')}
                >
                    <CropIcon className='text-white mr-2' width={20} height={20}/>
                    Crop
                </Button>
            </div>

            {/* Right Group */}
            <div className="flex items-center gap-4">
                <Button className="bg-gray-700 dark:bg-gray-700 dark:text-white hover:bg-blue-800 dark:hover:bg-blue-800" onClick={handleFeedbackClick}>
                    <FileTextIcon className='text-white mr-2' width={20} height={20}/>
                    Feedback
                </Button>
                {isFormModalOpen && <FormModal onClose={() => setFormModalOpen(false)} />}

                <Button
                    className="bg-gray-700 dark:bg-gray-700 dark:text-white hover:bg-blue-800 dark:hover:bg-blue-800"
                    variant="default"
                    size="default"
                    asChild={false}
                    onClick={props.handleDownload}
                    disabled={!props.hasBeenReferenced}
                    >
                    <DownloadIcon className='text-white mr-2' width={20} height={20}/>
                    Download
                </Button>

                <Button
                    onClick={handleExitEditor}
                    className="bg-gray-700 dark:bg-gray-700 dark:text-white hover:bg-blue-800 dark:hover:bg-blue-800"
                >
                    <ExitIcon className='text-white mr-2' width={20} height={20}/>
                    Exit Editor
                </Button> 
                {isWarningExitModalOpen && <WarningExitModal onCancel={() => setIsWarningExitModalOpen(false)} onConfirm={() => deleteProjectAndRedirect()}/>}
            </div>
        </div>
    );
};

export default EditorToolbar;