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
            <p>Welcome to the georeferencing tool! Let's start with a quick recap; what is georeferencing?</p>
        </div>,
        'Page 2 content',
        'Page 3 content',
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