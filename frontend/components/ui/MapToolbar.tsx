interface MapToolbarProps {
    children: React.ReactNode | React.ReactNode[];
}

const MapToolbar: React.FC<MapToolbarProps> = ({ children }) => {
    return (
        <div className="absolute top-20 left-0 z-50">
            <div className="flex justify-start items-start">
                {Array.isArray(children) ? children.map((child, index) => (
                    child && <div key={index} className="bg-gray-100 dark:bg-gray-900 text-sm text-primary dark:text-gray-200 shadow-md rounded-xl p-3 m-2">
                        {child}
                    </div>
                )) : 
                children && 
                <div className="bg-gray-100 dark:bg-gray-900 text-sm text-primary dark:text-gray-200 shadow-md rounded-xl p-3 m-2">
                    {children}
                </div>
                }
            </div>
        </div>
    );
};

export default MapToolbar;