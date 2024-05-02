import React, { ReactNode } from 'react';

interface HelpModalPageProps {
    title: string;
    setCurrentPage: (page: number) => void;
    children: ReactNode;
}

const HelpModalPage: React.FC<HelpModalPageProps> = ({ title, setCurrentPage, children }) => {
    return (
        <div>
            <h1 className='text-3xl font-bold'>{title}</h1>
            <a className='font-bold hover:underline hover:cursor-pointer' onClick={() => setCurrentPage(0)}>Back to help index</a><br />
            <hr className='my-3' />
            <p>
                {children}
            </p>
        </div>
    );
}

export default HelpModalPage;