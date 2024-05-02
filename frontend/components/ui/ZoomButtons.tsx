import { Button } from "@/components/ui/button";
import { ResetIcon } from "@radix-ui/react-icons";

interface ZoomButtonsProps {
  setZoomLevel: React.Dispatch<React.SetStateAction<number>>;
}

export default function ZoomButtons({ setZoomLevel }: ZoomButtonsProps) {
  const zoomDelta = 0.2;
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
      className="absolute bottom-2 right-0 m-4 gap-2 flex flex-col z-10 text-black dark:text-white
    "
    >
      <div className="flex flex-col gap-1">
        <Button onClick={zoomIn} variant={"zoom"} size={"zoom"}>
          +
        </Button>
        <Button
          onClick={zoomOut}
          variant={"zoom"}
          size={"zoom"}
          //   className="w-8 h-8 bg-white rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-700"
        >
          -
        </Button>
      </div>
      <Button
        onClick={() => setZoomLevel(1)}
        variant={"zoom"}
        size={"zoom"}
        // className="w-8 h-8 bg-white rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-700"
      >
        <ResetIcon />
      </Button>
    </div>
  );
}
