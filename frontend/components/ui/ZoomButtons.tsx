import { Button } from "@/components/ui/button";
import { ResetIcon } from "@radix-ui/react-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
    <TooltipProvider>
      <div className="absolute bottom-2 right-0 m-4 gap-2 flex flex-col z-10 text-black dark:text-white">
        <div className="flex flex-col gap-1">
          <Tooltip>
            <TooltipTrigger>
              <Button onClick={zoomIn} variant={"zoom"} size={"zoom"}>
                +
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Zoom In</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <Button onClick={zoomOut} variant={"zoom"} size={"zoom"}>
                -
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Zoom Out</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Tooltip>
          <TooltipTrigger>
            <Button
              onClick={() => setZoomLevel(1)}
              variant={"zoom"}
              size={"zoom"}
            >
              <ResetIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Reset Zoom</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
