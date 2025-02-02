import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PlusIcon, MinusIcon, ResetIcon } from '@radix-ui/react-icons'

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
    <TooltipProvider delayDuration={0}>
      <div className="absolute bottom-2 right-0 m-4 gap-2 flex flex-col z-10 text-black dark:text-white">
        <div className="flex flex-col gap-1">
          <Tooltip>
            <TooltipTrigger>
              <Button onClick={zoomIn} variant={"zoom"} size={"zoom"}>
                <PlusIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Zoom In</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <Button onClick={zoomOut} variant={"zoom"} size={"zoom"}>
                <MinusIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
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
          <TooltipContent side="left">
            <p>Reset Zoom</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
