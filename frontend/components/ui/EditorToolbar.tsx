import React from 'react';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  OpenBook,
  TargetIcon,
  WindowsIcon,
  SelectionIcon,
} from "@/components/ui/icons";
import FormModal from "@/components/ui/FormModal";

interface EditorToolbarProps {
    handleToggleSideBySide: () => void;
    handleToggleOverlay: () => void;
    handleToggleCoordTable: () => void;
    handleToggleCrop: () => void;
    handleDownload: () => void;
    isAutoSaved: boolean;
    isSideBySide: boolean;
    isCoordList: boolean;
    isCrop: boolean;
    projectName: string;
    projectId: number;
    setProjectName: (value: string) => void;
}

const EditorToolbar = (props: EditorToolbarProps) => {

    const [isFormModalOpen, setFormModalOpen] = useState(false); // State to control the visibility of the feedback form modal

    // Handle feedback button click and show the feedback form modal
    const handleFeedbackClick = () => {
        setFormModalOpen(true);
    };

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
                    className={`${
                        props.isSideBySide ? "bg-blue-500" : "bg-gray-700"
                    } hover:bg-blue-800 dark:hover:bg-blue-800`}
                    variant="toggle"
                    onClick={props.handleToggleSideBySide} // Add onClick event handler
                >
                    <OpenBook className="text-white" />
                    Side by side
                </Button>
                <Button
                    className="bg-gray-200 dark:bg-gray-700 hover:bg-blue-800 dark:hover:bg-blue-800"
                    variant="secondary"
                    onClick={props.handleToggleOverlay}
                >
                    <WindowsIcon className="text-gray-500" />
                    Overlay
                </Button>
                <Button
                    className={`${
                        props.isCoordList ? "bg-blue-500" : "bg-gray-700"
                    } hover:bg-blue-800 dark:hover:bg-blue-800`}
                    variant="toggle"
                    onClick={props.handleToggleCoordTable}
                >
                    <TargetIcon className="text-gray-500" />
                    <span>Coordinates</span>
                </Button>
                <Button
                    className={`${
                        props.isCrop ? "bg-blue-500" : "bg-gray-700"
                    } hover:bg-blue-800 dark:hover:bg-blue-800`}
                    variant="toggle"
                    onClick={props.handleToggleCrop}
                >
                    <SelectionIcon className="text-white" />
                    Crop
                </Button>
            </div>

            {/* Right Group */}
            <div className="flex items-center gap-4">
                <Button
                    className="bg-slate-600 hover:bg-blue-800 dark:text-white"
                    variant="default"
                    size="default"
                    asChild={false}
                    onClick={props.handleDownload}
                    >
                    Download
                </Button>

                <Button className="bg-blue-500 hover:bg-blue-800" onClick={handleFeedbackClick}>Feedback</Button>
                {isFormModalOpen && <FormModal onClose={() => setFormModalOpen(false)} />}
            </div>
        </div>
    );
};

export default EditorToolbar;