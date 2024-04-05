import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";

interface WarningExitModalProps {
    onCancel: () => void;
    onConfirm: () => void;
}

const WarningExitModal: React.FC<WarningExitModalProps> = ({ onCancel, onConfirm }) => {

    return (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-[9999] backdrop-blur-md">
            <div className="bg-white shadow-xl rounded-lg overflow-hidden w-full max-w-2xl flex flex-col z-60">
                <div className="p-6 flex-1 flex flex-col gap-2 text-black min-h-72 justify-between">
                    <div>
                        <h1 className="text-2xl font-bold mb-4 text-primary dark:text-white">You have added points</h1>
                        <p>
                            You have added points, and leaving the editor will delete your file.<br />
                            Do you wish to proceed?
                        </p>
                    </div>
                    <div className='mt-10 flex flex-row justify-end'>
                        <Button 
                            className="btn bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 dark:text-white"
                            onClick={onCancel} 
                        >
                            Cancel
                        </Button>
                        <Button 
                            className="btn ml-2 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 dark:text-white"
                            onClick={onConfirm} 
                        >
                            Proceed
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WarningExitModal;