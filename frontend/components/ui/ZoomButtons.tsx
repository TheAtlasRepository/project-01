interface ZoomButtonsProps {
  setZoomLevel: React.Dispatch<React.SetStateAction<number>>;
}

export default function ZoomButtons({ setZoomLevel }: ZoomButtonsProps) {
  const zoomDelta = 0.4;
  const maxZoom = 0.1;

  //function to zoom in
  const zoomIn = () => {
    setZoomLevel((prevZoomLevel) => prevZoomLevel + zoomDelta);
  };

  //
  const zoomOut = () => {
    setZoomLevel((prevZoomLevel) =>
      Math.max(prevZoomLevel - zoomDelta, maxZoom)
    );
  };

  return (
    <div
      className="absolute bottom-2 right-0 m-4 gap-2 flex flex-col z-10 dark:text-white
    "
    >
      <div className="flex flex-col gap-1">
        <button
          onClick={zoomIn}
          className="w-8 h-8 bg-white rounded-md hover:bg-gray-50 dark:bg-gray-600 dark:hover:bg-gray-700"
        >
          +
        </button>
        <button
          onClick={zoomOut}
          className="w-8 h-8 bg-white rounded-md hover:bg-gray-50 dark:bg-gray-600 dark:hover:bg-gray-700"
        >
          -
        </button>
      </div>
      <button
        onClick={() => setZoomLevel(1)}
        className="w-8 h-8 bg-white rounded-md hover:bg-gray-50 dark:bg-gray-600 dark:hover:bg-gray-700"
      >
        ↻
      </button>
    </div>
  );
}
