import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import FormModal from "@/components/ui/FormModal";
import WarningExitModal from '@/components/ui/WarningExitModal';
import { ViewVerticalIcon, StackIcon, CropIcon, FileTextIcon, DownloadIcon, ExitIcon } from '@radix-ui/react-icons'
import * as api from "@/components/component/projectAPI";
import { ViewPage } from "@/components/component/editor";

interface EditorToolbarProps {
    activePage: ViewPage;
    onButtonClick: (page: ViewPage) => void;
    handleDownload: () => void;
    isAutoSaved: boolean;
    projectName: string;
    projectId: number;
    setProjectName: (value: string) => void;
    hasBeenReferenced: boolean;
    placedMarkerAmount: number;
}

const EditorToolbar = (props: EditorToolbarProps) => {
    const [isFormModalOpen, setFormModalOpen] = useState(false); // State to control the visibility of the feedback form modal
    const [isWarningExitModalOpen, setIsWarningExitModalOpen] = useState(false);

    // Handle button click to change the view page
    const handleButtonClick = (page: ViewPage) => {
        props.onButtonClick(page);
    };

    // Handle feedback button click and show the feedback form modal
    const handleFeedbackClick = () => {
        setFormModalOpen(true);
    };

    // When the user clicks the Exit Editor button
    const handleExitEditor = () => {
        // If the user has placed a marker, show a warning modal
        if (props.placedMarkerAmount && props.placedMarkerAmount > 0) {
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
        api.deleteProject(props.projectId)
            .then(() => {
                // Redirect the user to the homepage
                window.location.href = "/";
            })
            .catch(error => {
                console.error('Error deleting data: ', error);
            });        
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
                    className={`${props.activePage === 'sideBySide' ? "bg-blue-500 dark:bg-blue-500" : "bg-gray-700 dark:bg-gray-700"} hover:bg-blue-800 dark:hover:bg-blue-800 dark:text-white`}
                    onClick={() => handleButtonClick('sideBySide')}
                >
                    <ViewVerticalIcon className='text-white mr-2' width={20} height={20}/>
                    Split View
                </Button>
                <Button
                    className={`${props.activePage === 'overlay' ? "bg-blue-500 dark:bg-blue-500" : "bg-gray-700 dark:bg-gray-700"} hover:bg-blue-800 dark:hover:bg-blue-800 dark:text-white`}
                    onClick={() => handleButtonClick('overlay')}
                    disabled={!props.hasBeenReferenced}
                >
                    <StackIcon className='text-white mr-2' width={20} height={20}/>
                    Overlay
                </Button>
                <Button
                    className={`${props.activePage === 'crop' ? "bg-blue-500 dark:bg-blue-500" : "bg-gray-700 dark:bg-gray-700"} hover:bg-blue-800 dark:hover:bg-blue-800 dark:text-white`}
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